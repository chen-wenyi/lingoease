// ...existing code...
'use server';

import { put } from '@vercel/blob';
import { cookies } from 'next/headers';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
import { Readable } from 'stream';

export async function tts(content: string) {
  const apiKey = (await cookies()).get('api-key')?.value;

  if (!apiKey) {
    throw new Error('Cannot get API key');
  }
  const startTtsTime = performance.now();

  const openai = new OpenAI({ apiKey });

  const mp3Response = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: 'alloy',
    speed: 1,
    instructions:
      'Speak like a TED Talk presenter: inspiring, conversational, engaging, with natural pauses and clear emphasis on key ideas.',
    input: content,
    response_format: 'mp3',
    stream_format: 'audio',
  });

  const ttsTime = (performance.now() - startTtsTime) / 1000;
  console.log(`TTS took ${ttsTime.toFixed(2)} seconds`);

  if (mp3Response.body) {
    console.log('TTS response received, uploading to blob storage...');
    const putStartTime = performance.now();
    const path = `lingoease-simplified-${timeId()}.ogg`;

    const webStream = mp3Response.body as WebReadableStream<Uint8Array>;
    const nodeStream = Readable.fromWeb(webStream);
    const file = await toFile(nodeStream, path);

    const { url, downloadUrl } = await put(path, file, {
      access: 'public',
      multipart: true,
      cacheControlMaxAge: 60 * 10,
      contentType: 'audio/ogg',
    });

    const putTime = (performance.now() - putStartTime) / 1000;
    console.log(
      `Uploaded speech.ogg to ${url} in ${putTime.toFixed(2)} seconds`
    );
    return { url, downloadUrl };
  }
}
// ...existing code...
function timeId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}
