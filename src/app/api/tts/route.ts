import { timeId } from '@/lib/utils';
import { put } from '@vercel/blob';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

export async function POST(request: Request) {
  const apiKey = (await cookies()).get('api-key')?.value;
  if (!apiKey) {
    throw new Error('Cannot get API key');
  }
  const { content } = await request.json();

  const openai = new OpenAI({ apiKey });

  const streamResponse = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: 'alloy',
    speed: 1,
    instructions:
      'Speak like a TED Talk presenter: inspiring, conversational, engaging, with natural pauses and clear emphasis on key ideas.',
    input: content,
    response_format: 'mp3',
    stream_format: 'audio',
  });

  const path = `lingoease-simplified-${timeId()}.mp3`;

  const { url, downloadUrl } = await put(path, streamResponse.body!, {
    access: 'public',
  });

  return Response.json({ url, downloadUrl });
}

export async function GET(request: Request) {
  const apiKey = (await cookies()).get('api-key')?.value;
  if (!apiKey) {
    throw new Error('Cannot get API key');
  }

  const { searchParams } = new URL(request.url);
  const content = searchParams.get('content');
  if (!content) {
    throw new Error('Missing content in query string');
  }

  const openai = new OpenAI({ apiKey });

  const streamResponse = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: 'alloy',
    speed: 1,
    instructions:
      'Speak like a TED Talk presenter: inspiring, conversational, engaging, with natural pauses and clear emphasis on key ideas.',
    input: content,
    response_format: 'mp3',
    stream_format: 'audio',
  });

  return streamResponse;
}
