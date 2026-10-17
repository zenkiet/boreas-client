import AVFoundation
import Capacitor
import CryptoKit
import Foundation
import SherpaOnnx
import UIKit

private let MB: UInt64 = 1_048_576

@objc(VoicePlugin)
public class VoicePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "VoicePlugin"
    public let jsName = "Voice"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "install", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "prepare", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "speak", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancel", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unload", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reset", returnType: CAPPluginReturnPromise)
    ]
    // Capacitor runs every plugin call on one shared serial queue, so downloads and models get their own.
    private let downloads = DispatchQueue(label: "dev.zenkiet.boreas.voice.downloads", qos: .utility)
    private let synth = DispatchQueue(label: "dev.zenkiet.boreas.voice.synth", qos: .userInitiated)
    private let root = voiceRoot()
    private lazy var speaker = Speaker { [weak self] index, ms in
        self?.notifyListeners("sentence", data: ["index": index, "durationMs": ms])
    }
    private var tts: (pack: String, engine: SherpaOnnxOfflineTtsWrapper)?
    // A crash inside the model leaves .session behind, and the next launch turns it into .faulted.
    private var session: URL { root.appendingPathComponent(".session") }
    private var faulted: URL { root.appendingPathComponent(".faulted") }

    override public func load() {
        if exists(session) { try? FileManager.default.moveItem(at: session, to: faulted) }
        // A backgrounded app holding a model is the first one iOS kills; the next answer loads it again.
        for name in [UIApplication.didEnterBackgroundNotification, UIApplication.didReceiveMemoryWarningNotification] {
            NotificationCenter.default.addObserver(forName: name, object: nil, queue: nil) { [weak self] _ in
                self?.synth.async { self?.tts = nil }
            }
        }
    }

    @objc func status(_ call: CAPPluginCall) {
        let home = URL(fileURLWithPath: NSHomeDirectory())
        let free = (try? home.resourceValues(forKeys: [.volumeAvailableCapacityForImportantUsageKey]))?
            .volumeAvailableCapacityForImportantUsage ?? 0
        let packs = (try? FileManager.default.contentsOfDirectory(atPath: root.path)) ?? []
        call.resolve([
            "arm64": true,
            "lowRam": false,
            "ramMB": Int(ProcessInfo.processInfo.physicalMemory / MB),
            "freeDiskMB": Int(free / Int64(MB)),
            "device": machine(),
            "installed": packs.filter { exists(root.appendingPathComponent($0).appendingPathComponent(".complete")) }.sorted(),
            "faulted": exists(faulted)
        ])
    }

    @objc func install(_ call: CAPPluginCall) {
        guard let pack = safe(call.getString("pack")) else { return call.reject("A pack id is required") }
        guard let files = call.getArray("files", JSObject.self) else { return call.reject("The pack's files are required") }
        let headers = (call.getObject("headers") ?? [:]).compactMapValues { $0 as? String }
        downloads.async { [self] in
            do {
                try download(pack, files, headers)
                call.resolve()
            } catch {
                call.reject("\(error)")
            }
        }
    }

    @objc func remove(_ call: CAPPluginCall) {
        guard let pack = safe(call.getString("pack")) else { return call.reject("A pack id is required") }
        synth.async { [self] in if tts?.pack == pack { tts = nil } }
        downloads.async { [self] in
            try? FileManager.default.removeItem(at: root.appendingPathComponent(pack))
            call.resolve()
        }
    }

    @objc func prepare(_ call: CAPPluginCall) {
        guard let pack = safe(call.getString("pack")) else { return call.reject("A pack id is required") }
        synth.async { [self] in
            do {
                _ = try guarded { try voice(pack) }
                call.resolve()
            } catch {
                call.reject("\(error)")
            }
        }
    }

    @objc func speak(_ call: CAPPluginCall) {
        guard let pack = safe(call.getString("pack")) else { return call.reject("A pack id is required") }
        guard let lang = call.getString("lang") else { return call.reject("A language is required") }
        guard let sentences = call.getArray("sentences", String.self) else { return call.reject("Sentences are required") }
        let generation = SherpaOnnxGenerationConfigSwift(
            speed: call.getFloat("speed") ?? 1, sid: call.getInt("voice") ?? 0, numSteps: 5, extra: ["lang": lang])
        let id = speaker.begin { call.resolve(["completed": $0]) }
        synth.async { [self] in
            do {
                try guarded {
                    let engine = try voice(pack)
                    for (index, text) in sentences.enumerated() {
                        guard speaker.isCurrent(id) else { return }
                        // The wrapper's C strings are autoreleased: drain them per sentence, not per answer.
                        let audio = autoreleasepool {
                            engine.generateWithConfig(text: text, config: generation, callback: nil, arg: nil)
                        }
                        speaker.queue(id, Clip(
                            index: index, samples: audio.samples, sampleRate: Double(audio.sampleRate),
                            last: index == sentences.count - 1))
                    }
                }
                if sentences.isEmpty { speaker.finish(id) }
            } catch {
                speaker.abandon(id)
                call.reject("\(error)")
            }
        }
    }

    @objc func cancel(_ call: CAPPluginCall) {
        speaker.cancel()
        call.resolve()
    }

    @objc func unload(_ call: CAPPluginCall) {
        speaker.cancel()
        synth.async { [self] in
            tts = nil
            call.resolve()
        }
    }

    /// Turns voice back on after a crash.
    @objc func reset(_ call: CAPPluginCall) {
        try? FileManager.default.removeItem(at: faulted)
        call.resolve()
    }

    /// Model work: a crash inside it leaves the marker, so a crash loop stops at one crash.
    private func guarded<T>(_ work: () throws -> T) throws -> T {
        guard !exists(faulted) else { throw VoiceError(description: "Voice is off after a crash") }
        FileManager.default.createFile(atPath: session.path, contents: nil)
        defer { try? FileManager.default.removeItem(at: session) }
        return try work()
    }

    private func voice(_ pack: String) throws -> SherpaOnnxOfflineTtsWrapper {
        if let tts, tts.pack == pack { return tts.engine }
        tts = nil
        let dir = root.appendingPathComponent(pack)
        let supertonic = sherpaOnnxOfflineTtsSupertonicModelConfig(
            durationPredictor: try onnx(dir, "duration_predictor"), textEncoder: try onnx(dir, "text_encoder"),
            vectorEstimator: try onnx(dir, "vector_estimator"), vocoder: try onnx(dir, "vocoder"),
            ttsJson: try path(dir, "tts.json"), unicodeIndexer: try path(dir, "unicode_indexer.bin"),
            voiceStyle: try path(dir, "voice.bin"))
        // Two threads on every phone until the device self-test (P4) picks per device.
        var config = sherpaOnnxOfflineTtsConfig(model: sherpaOnnxOfflineTtsModelConfig(numThreads: 2, supertonic: supertonic))
        let engine = SherpaOnnxOfflineTtsWrapper(config: &config)
        guard engine.tts != nil else { throw VoiceError(description: "Could not load the voice in \(pack)") }
        tts = (pack, engine)
        return engine
    }

    private func download(_ pack: String, _ files: [JSObject], _ headers: [String: String]) throws {
        let dir = root.appendingPathComponent(pack)
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        let total = files.reduce(UInt64(0)) { $0 + UInt64($1["size"] as? Int ?? 0) }
        var done: UInt64 = 0
        var reported: UInt64?
        // A 400 MB pack would send thousands of events: one per megabyte is plenty for a progress bar.
        let report = { (bytes: UInt64) in
            guard reported.map({ bytes >= $0 + MB }) ?? true || bytes == total else { return }
            reported = bytes
            self.notifyListeners("progress", data: ["pack": pack, "received": Int(bytes), "total": Int(total)])
        }
        for file in files {
            guard let name = safe(file["name"] as? String), let size = (file["size"] as? Int).map(UInt64.init),
                  let sha256 = file["sha256"] as? String, let url = (file["url"] as? String).flatMap(URL.init(string:))
            else { throw VoiceError(description: "A file entry is not valid") }
            let target = dir.appendingPathComponent(name)
            // Only a checked file is ever moved into place, so the right size means it is whole.
            if fileSize(target) != size {
                let part = dir.appendingPathComponent("\(name).part")
                let got = try Fetch.run(url, to: part, size: size, headers: headers) { report(done + $0) }
                guard got == sha256, fileSize(part) == size else {
                    try? FileManager.default.removeItem(at: part)
                    throw VoiceError(description: "\(name) failed its checksum")
                }
                try? FileManager.default.removeItem(at: target)
                try FileManager.default.moveItem(at: part, to: target)
            }
            done += size
            report(done)
        }
        FileManager.default.createFile(atPath: dir.appendingPathComponent(".complete").path, contents: nil)
    }
}

private struct VoiceError: Error, CustomStringConvertible {
    let description: String
}

/// One file over HTTP, resumed from its .part with Range and hashed as it lands.
private final class Fetch: NSObject, URLSessionDataDelegate {
    private let out: FileHandle
    private var digest = SHA256()
    private var offset: UInt64 = 0
    private let onBytes: (UInt64) -> Void
    private var failure: Error?
    private let finished = DispatchSemaphore(value: 0)

    static func run(_ url: URL, to part: URL, size: UInt64, headers: [String: String],
                    onBytes: @escaping (UInt64) -> Void) throws -> String {
        if !exists(part) { FileManager.default.createFile(atPath: part.path, contents: nil) }
        let fetch = try Fetch(part, onBytes)
        defer { try? fetch.out.close() }
        if fetch.offset < size {
            var request = URLRequest(url: url)
            headers.forEach { request.setValue($1, forHTTPHeaderField: $0) }
            if fetch.offset > 0 { request.setValue("bytes=\(fetch.offset)-", forHTTPHeaderField: "Range") }
            // The session holds its delegate strongly until it is invalidated.
            let session = URLSession(configuration: .ephemeral, delegate: fetch, delegateQueue: nil)
            session.dataTask(with: request).resume()
            fetch.finished.wait()
            session.finishTasksAndInvalidate()
            if let failure = fetch.failure { throw failure }
        }
        return fetch.digest.finalize().map { String(format: "%02x", $0) }.joined()
    }

    private init(_ part: URL, _ onBytes: @escaping (UInt64) -> Void) throws {
        out = try FileHandle(forUpdating: part)
        self.onBytes = onBytes
        super.init()
        // Resuming: the checksum has to cover what is already on disk.
        while let chunk = try out.read(upToCount: 1 << 16), !chunk.isEmpty { digest.update(data: chunk) }
        offset = try out.offset()
    }

    func urlSession(_ session: URLSession, dataTask: URLSessionDataTask, didReceive response: URLResponse,
                    completionHandler: @escaping (URLSession.ResponseDisposition) -> Void) {
        switch (response as? HTTPURLResponse)?.statusCode ?? 0 {
        case 206:
            completionHandler(.allow)
        case 200:
            // The server ignored Range: start the file over.
            if offset > 0 {
                offset = 0
                digest = SHA256()
                try? out.truncate(atOffset: 0)
            }
            completionHandler(.allow)
        case let status:
            failure = VoiceError(description: "HTTP \(status)")
            completionHandler(.cancel)
        }
    }

    func urlSession(_ session: URLSession, dataTask: URLSessionDataTask, didReceive data: Data) {
        do {
            try out.write(contentsOf: data)
        } catch {
            failure = error
            return dataTask.cancel()
        }
        digest.update(data: data)
        offset += UInt64(data.count)
        onBytes(offset)
    }

    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        failure = failure ?? error
        finished.signal()
    }
}

private struct Clip {
    let index: Int
    let samples: [Float]
    let sampleRate: Double
    let last: Bool
}

/// Plays one answer's sentences back to back; a new answer or cancel() cuts the current one off.
private final class Speaker {
    private let lane = DispatchQueue(label: "dev.zenkiet.boreas.voice.speaker")
    private let engine = AVAudioEngine()
    private let node = AVAudioPlayerNode()
    private let onSentence: (Int, Int) -> Void
    private var format: AVAudioFormat?
    private var onEnd: ((Bool) -> Void)?
    private var current = 0
    // Scheduled and not yet played out; the head is the sentence the listener hears.
    private var scheduled: [Clip] = []

    init(onSentence: @escaping (Int, Int) -> Void) {
        self.onSentence = onSentence
        engine.attach(node)
    }

    func begin(_ onDone: @escaping (Bool) -> Void) -> Int {
        lane.sync {
            end(current, false)
            onEnd = onDone
            // Ambient keeps to the silent switch, as the WebView's own speech did.
            try? AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default)
            try? AVAudioSession.sharedInstance().setActive(true)
            return current
        }
    }

    func isCurrent(_ id: Int) -> Bool { lane.sync { id == current } }

    func cancel() { lane.async { self.end(self.current, false) } }

    func finish(_ id: Int) { lane.async { self.end(id, true) } }

    /// Ends the answer without resolving it, for a caller that rejects instead.
    func abandon(_ id: Int) {
        lane.sync {
            if id == current { onEnd = nil }
            end(id, false)
        }
    }

    func queue(_ id: Int, _ clip: Clip) {
        lane.async { [self] in
            guard id == current,
                  let format = AVAudioFormat(standardFormatWithSampleRate: clip.sampleRate, channels: 1),
                  let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(max(clip.samples.count, 1)))
            else { return }
            buffer.frameLength = AVAudioFrameCount(clip.samples.count)
            clip.samples.withUnsafeBufferPointer { samples in
                if let base = samples.baseAddress { buffer.floatChannelData![0].update(from: base, count: samples.count) }
            }
            if self.format != format {
                engine.stop()
                engine.connect(node, to: engine.mainMixerNode, format: format)
                self.format = format
            }
            if !engine.isRunning { try? engine.start() }
            scheduled.append(clip)
            if scheduled.count == 1 { started(clip) }
            node.scheduleBuffer(buffer, completionCallbackType: .dataPlayedBack) { [weak self] _ in
                self?.lane.async { self?.played(id) }
            }
            node.play()
        }
    }

    private func played(_ id: Int) {
        guard id == current, !scheduled.isEmpty else { return }
        let clip = scheduled.removeFirst()
        if clip.last { return end(id, true) }
        if let next = scheduled.first { started(next) }
    }

    private func started(_ clip: Clip) {
        onSentence(clip.index, Int(Double(clip.samples.count) * 1000 / clip.sampleRate))
    }

    private func end(_ id: Int, _ completed: Bool) {
        guard id == current else { return }
        current += 1
        scheduled.removeAll()
        node.stop()
        engine.stop()
        onEnd?(completed)
        onEnd = nil
    }
}

private func voiceRoot() -> URL {
    var url = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        .appendingPathComponent("voice", isDirectory: true)
    try? FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
    // Packs come back from the server, so iCloud backups never carry their 400 MB.
    var values = URLResourceValues()
    values.isExcludedFromBackup = true
    try? url.setResourceValues(values)
    return url
}

// Pack and file names become paths: no separators, and no leading dot for "..".
private func safe(_ name: String?) -> String? {
    name.flatMap { $0.range(of: "^[A-Za-z0-9_@-][A-Za-z0-9_.@-]*$", options: .regularExpression) != nil ? $0 : nil }
}

private func exists(_ url: URL) -> Bool { FileManager.default.fileExists(atPath: url.path) }

private func fileSize(_ url: URL) -> UInt64? {
    (try? FileManager.default.attributesOfItem(atPath: url.path))?[.size] as? UInt64
}

// The Swift wrapper calls fatalError on a missing file, so paths are checked first.
private func path(_ dir: URL, _ name: String) throws -> String {
    let file = dir.appendingPathComponent(name).path
    guard FileManager.default.fileExists(atPath: file) else { throw VoiceError(description: "Missing \(file)") }
    return file
}

private func onnx(_ dir: URL, _ prefix: String) throws -> String {
    let names = (try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? []
    guard let name = names.sorted().first(where: { $0.hasPrefix(prefix) && $0.hasSuffix(".onnx") }) else {
        throw VoiceError(description: "Missing \(prefix)*.onnx in \(dir.path)")
    }
    return dir.appendingPathComponent(name).path
}

private func machine() -> String {
    if let simulated = ProcessInfo.processInfo.environment["SIMULATOR_MODEL_IDENTIFIER"] { return simulated }
    var system = utsname()
    uname(&system)
    return withUnsafeBytes(of: &system.machine) { String(decoding: $0.prefix { $0 != 0 }, as: UTF8.self) }
}
