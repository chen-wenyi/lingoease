// Client-side streaming utility using kokoro-js
// Yields audio chunks as they are produced.
import { KokoroTTS, TextSplitterStream } from 'kokoro-js';

export type KokoroTTSStreamChunk = {
  index: number;
  text: string;
  phonemes?: string | string[];
  blob: Blob;
  url: string;
};

/**
 * Stream TTS audio from text using kokoro-js. Loads the model internally.
 * Returns an async generator yielding audio chunks with object URLs.
 */
export async function* kokoroTTSChunks(
  text: string
): AsyncGenerator<KokoroTTSStreamChunk, void, void> {
  const input = text?.trim();
  if (!input) throw new Error('Text is required');
  if (typeof navigator === 'undefined') {
    throw new Error('kokoroTTSStream must run in the browser');
  }

  const canUseWebGPU = 'gpu' in navigator;
  const modelId = 'onnx-community/Kokoro-82M-v1.0-ONNX';

  let tts: KokoroTTS;
  try {
    tts = await KokoroTTS.from_pretrained(modelId, {
      dtype: 'fp32',
      device: canUseWebGPU ? 'webgpu' : 'wasm',
    });
  } catch (e) {
    // Fallback to WASM if WebGPU init fails
    tts = await KokoroTTS.from_pretrained(modelId, {
      dtype: 'fp32',
      device: 'wasm',
    });
  }

  const splitter = new TextSplitterStream();
  const stream = tts.stream(splitter, {
    voice: 'am_adam',
    speed: 0.7,
  });

  // Producer: feed tokens asynchronously so the synthesizer can start early
  const producer = (async () => {
    const tokens: string[] = input.match(/\s*\S+/g) ?? [input];
    for (const token of tokens) {
      splitter.push(token);
      // Small delay to simulate incremental arrival and give time to synthesize
      await new Promise<void>((resolve) => setTimeout(resolve, 10));
    }
    splitter.close();
  })();
  void producer;

  let i = 0;
  for await (const { text: t, phonemes, audio } of stream as AsyncIterable<{
    text: string;
    phonemes?: string | string[];
    audio: { toBlob: () => Blob };
  }>) {
    const blob = audio.toBlob();
    const url = URL.createObjectURL(blob);
    yield { index: i++, text: t, phonemes, blob, url };
  }
}

/**
 * Generate full audio for the provided text and return an object URL.
 * Loads the model inside the function. No streaming to the caller.
 */
export async function kokoroTTSStream(text: string): Promise<string> {
  const input = text?.trim();
  if (!input) throw new Error('Text is required');
  if (typeof navigator === 'undefined') {
    throw new Error('kokoroTTSStream must run in the browser');
  }

  const canUseWebGPU = 'gpu' in navigator;
  const modelId = 'onnx-community/Kokoro-82M-v1.0-ONNX';

  let tts: KokoroTTS;
  try {
    tts = await KokoroTTS.from_pretrained(modelId, {
      dtype: 'fp32',
      device: canUseWebGPU ? 'webgpu' : 'wasm',
    });
  } catch {
    tts = await KokoroTTS.from_pretrained(modelId, {
      dtype: 'fp32',
      device: 'wasm',
    });
  }

  const audio = await tts.generate(input, {
    voice: 'am_adam',
    speed: 0.7,
  });
  const blob = audio.toBlob();
  return URL.createObjectURL(blob);
}

/**
 * Consume the Kokoro stream internally, concatenate chunks, and return a single object URL.
 * This waits until all streaming chunks are synthesized, then builds one WAV Blob.
 */
export async function kokoroTTSStreamWaitUrl(text: string): Promise<string> {
  const input = text?.trim();
  if (!input) throw new Error('Text is required');
  if (typeof navigator === 'undefined') {
    throw new Error('kokoroTTSStreamWaitUrl must run in the browser');
  }

  const canUseWebGPU = 'gpu' in navigator;
  const modelId = 'onnx-community/Kokoro-82M-v1.0-ONNX';

  let tts: KokoroTTS;
  try {
    tts = await KokoroTTS.from_pretrained(modelId, {
      dtype: 'fp32',
      device: canUseWebGPU ? 'webgpu' : 'wasm',
    });
  } catch {
    tts = await KokoroTTS.from_pretrained(modelId, {
      dtype: 'fp32',
      device: 'wasm',
    });
  }

  const splitter = new TextSplitterStream();
  const stream = tts.stream(splitter, {
    voice: 'af_heart',
    speed: 1,
  });

  // Feed tokens and close when done
  (async () => {
    const tokens: string[] = input.match(/\s*\S+/g) ?? [input];
    for (const token of tokens) {
      splitter.push(token);
      await new Promise<void>((resolve) => setTimeout(resolve, 5));
    }
    splitter.close();
  })();

  const blobs: Blob[] = [];
  for await (const { audio } of stream as AsyncIterable<{
    text: string;
    phonemes?: string | string[];
    audio: { toBlob: () => Blob };
  }>) {
    blobs.push(audio.toBlob());
  }

  // Decode and concatenate to one AudioBuffer
  const audioCtx = new AudioContext();
  const buffers: AudioBuffer[] = [];
  for (const b of blobs) {
    const arr = await b.arrayBuffer();
    const buf = await audioCtx.decodeAudioData(arr);
    buffers.push(buf);
  }

  if (buffers.length === 0) {
    throw new Error('No audio produced by the stream');
  }

  const merged = concatAudioBuffers(buffers, audioCtx);
  const wavBlob = audioBufferToWavBlob(merged);
  return URL.createObjectURL(wavBlob);
}

function concatAudioBuffers(
  buffers: AudioBuffer[],
  ctx: BaseAudioContext
): AudioBuffer {
  const sampleRate = buffers[0].sampleRate;
  const channels = Math.max(...buffers.map((b) => b.numberOfChannels));
  const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
  const output = ctx.createBuffer(channels, totalLength, sampleRate);

  for (let ch = 0; ch < channels; ch++) {
    const out = output.getChannelData(ch);
    let offset = 0;
    for (const buf of buffers) {
      const src = buf.getChannelData(Math.min(ch, buf.numberOfChannels - 1));
      out.set(src, offset);
      offset += buf.length;
    }
  }
  return output;
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const ab = new ArrayBuffer(totalSize);
  const dv = new DataView(ab);
  let pos = 0;

  // Helper to write ASCII
  const writeString = (s: string) => {
    for (let i = 0; i < s.length; i++) dv.setUint8(pos++, s.charCodeAt(i));
  };

  // RIFF header
  writeString('RIFF');
  dv.setUint32(pos, totalSize - 8, true);
  pos += 4;
  writeString('WAVE');

  // fmt chunk
  writeString('fmt ');
  dv.setUint32(pos, 16, true); // PCM chunk size
  pos += 4;
  dv.setUint16(pos, 1, true); // PCM format
  pos += 2;
  dv.setUint16(pos, numChannels, true);
  pos += 2;
  dv.setUint32(pos, sampleRate, true);
  pos += 4;
  dv.setUint32(pos, byteRate, true);
  pos += 4;
  dv.setUint16(pos, blockAlign, true);
  pos += 2;
  dv.setUint16(pos, bytesPerSample * 8, true);
  pos += 2;

  // data chunk
  writeString('data');
  dv.setUint32(pos, dataSize, true);
  pos += 4;

  // Interleave and write PCM samples
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      // clamp
      sample = Math.max(-1, Math.min(1, sample));
      // scale to 16-bit signed int
      const s = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      dv.setInt16(pos, Math.round(s), true);
      pos += 2;
    }
  }

  return new Blob([ab], { type: 'audio/wav' });
}
