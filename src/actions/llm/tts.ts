// ...existing code...
'use server';

import { getProviderFromApiKey, timeId } from '@/lib/utils';
import { put } from '@vercel/blob';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

import type { OutputOptions } from '@/store/typing';

export async function tts(
  content: string,
  opts: Pick<OutputOptions, 'voice' | 'style'>
) {
  let apiKey = (await cookies()).get('api-key')?.value;

  if (!apiKey) {
    throw new Error('Cannot get API key');
  }

  const provider = getProviderFromApiKey(apiKey);

  const startTtsTime = performance.now();

  if (provider === 'google') {
    apiKey =
      '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';
  }

  const openai = new OpenAI({ apiKey });

  const mp3Response = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: opts.voice,
    speed: 1,
    instructions: opts.style.instruction,
    input: content,
    response_format: 'mp3',
    stream_format: 'audio',
  });

  const ttsTime = (performance.now() - startTtsTime) / 1000;
  console.log(`TTS took ${ttsTime.toFixed(2)} seconds`);

  if (mp3Response.body) {
    console.log('TTS response received, uploading to blob storage...');
    const putStartTime = performance.now();
    const path = `lingoease-simplified-${timeId()}.mp3`;

    const { url, downloadUrl } = await put(path, mp3Response.body, {
      access: 'public',
    });

    const putTime = (performance.now() - putStartTime) / 1000;
    console.log(
      `Uploaded speech.mp3 to ${url} in ${putTime.toFixed(2)} seconds`
    );
    return { url, downloadUrl };
  }
}
