import type { PluginListenerHandle } from '@capacitor/core';

export interface VoiceStatus {
  readonly arm64: boolean;
  readonly lowRam: boolean;
  readonly ramMB: number;
  readonly freeDiskMB: number;
  readonly device: string;
  /** Android only. */
  readonly chip?: string;
  /** Packs whose every file is on disk and checked. */
  readonly installed: string[];
  /** The last launch crashed inside a model: voice stays off until `reset()`. */
  readonly faulted: boolean;
}

export interface VoiceFile {
  readonly name: string;
  readonly size: number;
  readonly sha256: string;
  readonly url: string;
}

export interface VoicePlugin {
  status(): Promise<VoiceStatus>;
  /** Downloads what is missing, resuming a partial file, and checks every sha256. */
  install(options: {
    pack: string;
    files: readonly VoiceFile[];
    headers?: Readonly<Record<string, string>>;
  }): Promise<void>;
  remove(options: { pack: string }): Promise<void>;
  /** Loads a pack's model ahead of the first answer. */
  prepare(options: { pack: string }): Promise<void>;
  /** Reads the sentences back to back; a new call or `cancel()` cuts it off with `completed: false`. */
  speak(options: {
    pack: string;
    lang: string;
    voice?: number;
    speed?: number;
    sentences: readonly string[];
  }): Promise<{ completed: boolean }>;
  cancel(): Promise<void>;
  /** Stops speaking and frees the model. */
  unload(): Promise<void>;
  /** Turns voice back on after a crash. */
  reset(): Promise<void>;
  addListener(
    event: 'progress',
    listener: (event: { pack: string; received: number; total: number }) => void,
  ): Promise<PluginListenerHandle>;
  /** A sentence starts playing; `durationMs` is its real length. */
  addListener(
    event: 'sentence',
    listener: (event: { index: number; durationMs: number }) => void,
  ): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

export declare const Voice: VoicePlugin;
