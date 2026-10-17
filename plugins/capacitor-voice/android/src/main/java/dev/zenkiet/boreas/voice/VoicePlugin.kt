package dev.zenkiet.boreas.voice

import android.app.ActivityManager
import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.os.Build
import android.os.StatFs
import android.os.SystemClock
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.k2fsa.sherpa.onnx.GenerationConfig
import com.k2fsa.sherpa.onnx.OfflineTts
import com.k2fsa.sherpa.onnx.OfflineTtsConfig
import com.k2fsa.sherpa.onnx.OfflineTtsModelConfig
import com.k2fsa.sherpa.onnx.OfflineTtsSupertonicModelConfig
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.Executors

private const val MB = 1024 * 1024

// Pack and file names become paths: no separators, and no leading dot for "..".
private val SAFE = Regex("^[\\w@-][\\w.@-]*$")
private const val CHUNK = 2048

private val SPEECH: AudioAttributes = AudioAttributes.Builder()
    .setUsage(AudioAttributes.USAGE_MEDIA)
    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
    .build()

@CapacitorPlugin(name = "Voice")
class VoicePlugin : Plugin() {
    // Capacitor rethrows on its plugin thread and kills the app, so work runs here and rejects instead.
    private val downloads = Executors.newSingleThreadExecutor()
    private val synth = Executors.newSingleThreadExecutor()
    private val root by lazy { File(context.noBackupFilesDir, "voice").apply { mkdirs() } }
    private val speaker by lazy {
        Speaker(context.getSystemService(Context.AUDIO_SERVICE) as AudioManager) { index, ms ->
            notifyListeners("sentence", JSObject().put("index", index).put("durationMs", ms))
        }
    }
    private var tts: Pair<String, OfflineTts>? = null

    // A crash inside the model leaves .session behind, and the next launch turns it into .faulted.
    private val session by lazy { File(root, ".session") }
    private val faulted by lazy { File(root, ".faulted") }

    override fun load() {
        if (session.exists()) session.renameTo(faulted)
    }

    // A backgrounded app holding a model is the first one the system kills; the next answer loads it again.
    override fun handleOnStop() {
        synth.execute(::release)
    }

    @PluginMethod
    fun status(call: PluginCall) {
        val activity = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memory = ActivityManager.MemoryInfo().also(activity::getMemoryInfo)
        val installed = root.listFiles()?.filter { File(it, ".complete").exists() }?.map { it.name }?.sorted() ?: emptyList()
        call.resolve(
            JSObject()
                .put("arm64", Build.SUPPORTED_64_BIT_ABIS.isNotEmpty())
                .put("lowRam", activity.isLowRamDevice)
                .put("ramMB", memory.totalMem / MB)
                .put("freeDiskMB", StatFs(context.noBackupFilesDir.path).availableBytes / MB)
                .put("device", "${Build.MANUFACTURER} ${Build.MODEL}")
                .put("chip", if (Build.VERSION.SDK_INT >= 31) Build.SOC_MODEL else Build.HARDWARE)
                .put("installed", JSArray(installed))
                .put("faulted", faulted.exists()),
        )
    }

    @PluginMethod
    fun install(call: PluginCall) {
        val pack = call.getString("pack")?.takeIf(SAFE::matches) ?: return call.reject("A pack id is required")
        val files = call.getArray("files")?.toList<JSONObject>() ?: return call.reject("The pack's files are required")
        val headers = call.getObject("headers") ?: JSObject()
        downloads.execute {
            try {
                download(pack, files, headers)
                call.resolve()
            } catch (e: Throwable) {
                call.reject(e.message ?: e.toString())
            }
        }
    }

    @PluginMethod
    fun remove(call: PluginCall) {
        val pack = call.getString("pack")?.takeIf(SAFE::matches) ?: return call.reject("A pack id is required")
        synth.execute { if (tts?.first == pack) release() }
        downloads.execute {
            File(root, pack).deleteRecursively()
            call.resolve()
        }
    }

    @PluginMethod
    fun prepare(call: PluginCall) {
        val pack = call.getString("pack")?.takeIf(SAFE::matches) ?: return call.reject("A pack id is required")
        synth.execute {
            try {
                guarded { voice(pack) }
                call.resolve()
            } catch (e: Throwable) {
                call.reject(e.message ?: e.toString())
            }
        }
    }

    @PluginMethod
    fun speak(call: PluginCall) {
        val pack = call.getString("pack")?.takeIf(SAFE::matches) ?: return call.reject("A pack id is required")
        val lang = call.getString("lang") ?: return call.reject("A language is required")
        val sentences = call.getArray("sentences")?.toList<String>() ?: return call.reject("Sentences are required")
        val generation = GenerationConfig(
            sid = call.getInt("voice") ?: 0,
            speed = call.getFloat("speed") ?: 1f,
            numSteps = 5,
            extra = mapOf("lang" to lang),
        )
        val id = speaker.begin { completed -> call.resolve(JSObject().put("completed", completed)) }
        synth.execute {
            try {
                guarded {
                    val tts = voice(pack)
                    for ((index, text) in sentences.withIndex()) {
                        if (id != speaker.current) break
                        val audio = tts.generateWithConfig(text, generation)
                        speaker.queue(id, Clip(index, audio.samples, audio.sampleRate, index == sentences.lastIndex))
                    }
                }
                if (sentences.isEmpty()) speaker.finish(id)
            } catch (e: Throwable) {
                speaker.abandon(id)
                call.reject(e.message ?: e.toString())
            }
        }
    }

    @PluginMethod
    fun cancel(call: PluginCall) {
        speaker.cancel()
        call.resolve()
    }

    @PluginMethod
    fun unload(call: PluginCall) {
        speaker.cancel()
        synth.execute {
            release()
            call.resolve()
        }
    }

    /** Turns voice back on after a crash. */
    @PluginMethod
    fun reset(call: PluginCall) {
        faulted.delete()
        call.resolve()
    }

    /** Model work: a crash inside it leaves the marker, so a crash loop stops at one crash. */
    private fun <T> guarded(work: () -> T): T {
        if (faulted.exists()) throw IllegalStateException("Voice is off after a crash")
        session.createNewFile()
        try {
            return work()
        } finally {
            session.delete()
        }
    }

    private fun voice(pack: String): OfflineTts {
        tts?.let { (loaded, engine) -> if (loaded == pack) return engine }
        release()
        val dir = File(root, pack)
        val model = OfflineTtsSupertonicModelConfig(
            durationPredictor = onnx(dir, "duration_predictor"),
            textEncoder = onnx(dir, "text_encoder"),
            vectorEstimator = onnx(dir, "vector_estimator"),
            vocoder = onnx(dir, "vocoder"),
            ttsJson = path(dir, "tts.json"),
            unicodeIndexer = path(dir, "unicode_indexer.bin"),
            voiceStyle = path(dir, "voice.bin"),
        )
        // Two threads on every phone until the device self-test (P4) picks per device.
        val config = OfflineTtsConfig(model = OfflineTtsModelConfig(supertonic = model, numThreads = 2))
        return OfflineTts(config = config).also { tts = pack to it }
    }

    private fun release() {
        tts?.second?.release()
        tts = null
    }

    private fun download(pack: String, files: List<JSONObject>, headers: JSONObject) {
        val dir = File(root, pack).apply { mkdirs() }
        val total = files.sumOf { it.getLong("size") }
        var done = 0L
        var reported = -1L
        // A 400 MB pack would send thousands of events: one per megabyte is plenty for a progress bar.
        val report = { bytes: Long ->
            if (bytes - reported >= MB || bytes == total) {
                reported = bytes
                notifyListeners("progress", JSObject().put("pack", pack).put("received", bytes).put("total", total))
            }
        }
        for (file in files) {
            val name = file.getString("name").takeIf(SAFE::matches) ?: throw IOException("A file name is not allowed")
            val size = file.getLong("size")
            val target = File(dir, name)
            // Only a checked file is ever renamed into place, so the right size means it is whole.
            if (target.length() != size) {
                val part = File(dir, "$name.part")
                val sha256 = fetch(file.getString("url"), part, size, headers) { report(done + it) }
                if (sha256 != file.getString("sha256") || part.length() != size) {
                    part.delete()
                    throw IOException("$name failed its checksum")
                }
                if (!part.renameTo(target)) throw IOException("Could not save $name")
            }
            done += size
            report(done)
        }
        File(dir, ".complete").createNewFile()
    }
}

/** One file over HTTP, resumed from its .part with Range and hashed as it lands. */
private fun fetch(url: String, part: File, size: Long, headers: JSONObject, onBytes: (Long) -> Unit): String {
    val digest = MessageDigest.getInstance("SHA-256")
    var offset = part.length()
    // Resuming: the checksum has to cover what is already on disk.
    if (offset > 0) part.inputStream().use { pump(it, digest) { _, _ -> } }
    if (offset < size) {
        val connection = URL(url).openConnection() as HttpURLConnection
        // A stalled socket would otherwise hold the download queue forever.
        connection.connectTimeout = 15_000
        connection.readTimeout = 30_000
        headers.keys().forEach { connection.setRequestProperty(it, headers.getString(it)) }
        if (offset > 0) connection.setRequestProperty("Range", "bytes=$offset-")
        try {
            when (val status = connection.responseCode) {
                206 -> Unit
                200 -> if (offset > 0) {
                    // The server ignored Range: start the file over.
                    offset = 0
                    digest.reset()
                }
                else -> throw IOException("HTTP $status")
            }
            FileOutputStream(part, offset > 0).use { out ->
                connection.inputStream.use { input ->
                    pump(input, digest) { buffer, n ->
                        out.write(buffer, 0, n)
                        offset += n
                        onBytes(offset)
                    }
                }
            }
        } finally {
            connection.disconnect()
        }
    }
    return digest.digest().joinToString("") { "%02x".format(it) }
}

private inline fun pump(input: InputStream, digest: MessageDigest, chunk: (ByteArray, Int) -> Unit) {
    val buffer = ByteArray(64 * 1024)
    while (true) {
        val n = input.read(buffer)
        if (n < 0) return
        digest.update(buffer, 0, n)
        chunk(buffer, n)
    }
}

private class Clip(val index: Int, val samples: FloatArray, val sampleRate: Int, val last: Boolean)

/** Plays one answer's sentences back to back; a new answer or cancel() cuts the current one off. */
private class Speaker(private val audio: AudioManager, private val onSentence: (Int, Long) -> Unit) {
    private val player = Executors.newSingleThreadExecutor()
    private val focus = if (Build.VERSION.SDK_INT >= 26) {
        AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK).setAudioAttributes(SPEECH).build()
    } else {
        null
    }
    private var onEnd: ((Boolean) -> Unit)? = null

    // The player thread owns the track: one stream per answer, so sentences join without a gap.
    private var track: AudioTrack? = null
    private var frames = 0L

    @Volatile
    var current = 0
        private set

    @Synchronized
    fun begin(onDone: (Boolean) -> Unit): Int {
        end(current, false)
        onEnd = onDone
        if (Build.VERSION.SDK_INT >= 26) audio.requestAudioFocus(focus!!)
        return current
    }

    fun cancel() = end(current, false)

    fun finish(id: Int) = end(id, true)

    /** Ends the answer without resolving it, for a caller that rejects instead. */
    @Synchronized
    fun abandon(id: Int) {
        if (id == current) onEnd = null
        end(id, false)
    }

    fun queue(id: Int, clip: Clip) = player.execute { play(id, clip) }

    @Synchronized
    private fun end(id: Int, completed: Boolean) {
        if (id != current) return
        current++
        if (Build.VERSION.SDK_INT >= 26) audio.abandonAudioFocusRequest(focus!!)
        onEnd?.invoke(completed)
        onEnd = null
        player.execute(::stop)
    }

    private fun play(id: Int, clip: Clip) {
        if (id != current) return
        val track = track ?: open(clip.sampleRate).also { track = it }
        onSentence(clip.index, clip.samples.size * 1000L / clip.sampleRate)
        var offset = 0
        // Short writes, so a cancel lands within one chunk.
        while (offset < clip.samples.size && id == current) {
            val n = track.write(clip.samples, offset, minOf(CHUNK, clip.samples.size - offset), AudioTrack.WRITE_BLOCKING)
            if (n <= 0) break
            offset += n
        }
        frames += offset
        if (!clip.last || id != current) return
        // A stream starts only on a full buffer, and stop() zeroes the head: silence pushes the tail out.
        track.write(FloatArray(track.bufferSizeInFrames), 0, track.bufferSizeInFrames, AudioTrack.WRITE_BLOCKING)
        val deadline = SystemClock.uptimeMillis() + 2_000
        while (id == current && track.playbackHeadPosition < frames && SystemClock.uptimeMillis() < deadline) Thread.sleep(10)
        finish(id)
    }

    private fun open(sampleRate: Int): AudioTrack {
        frames = 0
        val format = AudioFormat.Builder()
            .setEncoding(AudioFormat.ENCODING_PCM_FLOAT)
            .setSampleRate(sampleRate)
            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
            .build()
        val buffer = AudioTrack.getMinBufferSize(sampleRate, AudioFormat.CHANNEL_OUT_MONO, AudioFormat.ENCODING_PCM_FLOAT) * 2
        return AudioTrack.Builder()
            .setAudioAttributes(SPEECH)
            .setAudioFormat(format)
            .setTransferMode(AudioTrack.MODE_STREAM)
            .setBufferSizeInBytes(buffer)
            .build()
            .apply { play() }
    }

    private fun stop() {
        track?.run {
            pause()
            flush()
            release()
        }
        track = null
    }
}

private fun path(dir: File, name: String): String =
    File(dir, name).also { require(it.exists()) { "Missing ${it.path}" } }.path

private fun onnx(dir: File, prefix: String): String =
    dir.listFiles()?.sortedBy { it.name }?.firstOrNull { it.name.startsWith(prefix) && it.name.endsWith(".onnx") }?.path
        ?: throw IllegalArgumentException("Missing $prefix*.onnx in ${dir.path}")
