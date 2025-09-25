export const runtime = 'nodejs';

import { getProviderFromApiKey } from '@/lib/utils';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    let apiKey = (await cookies()).get('api-key')?.value;

    if (!apiKey) {
      throw new Error('Cannot get API key');
    }

    const provider = getProviderFromApiKey(apiKey);

    const form = await request.formData();
    const blob = form.get('blob') as Blob;
    const filename = form.get('filename') as string;

    const file = new File([blob], filename, { type: blob.type });

    if (provider === 'google') {
      apiKey =
        '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';
    }

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
