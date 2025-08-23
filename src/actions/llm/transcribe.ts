'use server';

import { del, head } from '@vercel/blob';
import { cookies } from 'next/headers';
import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
import path from 'path';

export async function transcribe(blobUrl: string) {
  try {
    const apiKey = (await cookies()).get('api-key')?.value;

    if (!apiKey) {
      throw new Error('Cannot get API key');
    }

    const downloadStartTime = performance.now();
    console.log('starting downloading file...');

    const { downloadUrl, pathname } = await head(blobUrl);

    const filename = path.basename(pathname);

    const fileResp = await fetch(downloadUrl);

    const downloadEndTime = performance.now();
    console.log(
      `Download took ${(downloadEndTime - downloadStartTime) / 1000} seconds`
    );

    if (!fileResp.ok) throw new Error('fetch file failed for ' + blobUrl);

    console.log('starting buffering...');
    const bufferStartTime = performance.now();
    if (!fileResp.body) {
      throw new Error('No response body when downloading audio file');
    }
    // Convert the Web ReadableStream to a Node.js Readable stream
    const webStream = fileResp.body as WebReadableStream<Uint8Array>;
    const nodeStream = Readable.fromWeb(webStream);
    // Create a File-like object from the stream without buffering the whole thing in memory
    const file = await toFile(nodeStream, filename);

    const bufferEndTime = performance.now();
    console.log(
      `Streaming prep took ${(bufferEndTime - bufferStartTime) / 1000} seconds`
    );

    console.log('starting transcription...');

    const client = new OpenAI({ apiKey });

    const transcribeStartTime = performance.now();

    const transcriptionResp = await client.audio.transcriptions.create({
      model: 'gpt-4o-mini-transcribe',
      file,
    });

    const transcribeEndTime = performance.now();
    console.log(
      `Transcription took ${(transcribeEndTime - transcribeStartTime) / 1000} seconds`
    );

    del(blobUrl);

    return { ok: true, text: transcriptionResp.text, error: '' };
  } catch (error) {
    console.error('Error during transcribe:', error);
    if (error instanceof Error) {
      return { ok: false, text: '', error: error.message };
    } else if (error instanceof OpenAI.APIError) {
      return {
        ok: false,
        text: '',
        error: `OpenAI API error: ${error.message}`,
      };
    }
    return { ok: false, text: '', error: 'Unknown error' };
  }
}
