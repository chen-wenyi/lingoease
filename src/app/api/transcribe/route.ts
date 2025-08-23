export const runtime = 'nodejs';

import { cookies } from 'next/headers';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const apiKey = (await cookies()).get('api-key')?.value;

    if (!apiKey) {
      throw new Error('Cannot get API key');
    }

    const form = await request.formData();
    const blob = form.get('blob') as Blob;
    const filename = form.get('filename') as string;

    const file = new File([blob], filename, { type: blob.type });

    const client = new OpenAI({ apiKey });

    const transcriptionResp = await client.audio.transcriptions.create({
      model: 'gpt-4o-mini-transcribe',
      file,
    });

    return Response.json({ ok: true, text: transcriptionResp.text, error: '' });
  } catch (error) {
    console.error('Transcription error:', error);
    return Response.json({
      ok: false,
      text: '',
      error: (error as Error).message,
    });
  }
}
