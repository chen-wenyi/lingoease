'use server';

import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';

import { cookies } from 'next/headers';
import z from 'zod';

const structuredOutput = z.object({
  segments: z
    .array(z.string())
    .min(1, 'Must return at least one segment')
    .describe('text segments'),
});

export async function segment(text: string) {
  try {
    const apiKey = (await cookies()).get('api-key')?.value;

    if (!apiKey) {
      throw new Error('Cannot get API key');
    }

    const model = new ChatOpenAI({
      apiKey,
      model: 'gpt-5-mini',
      // temperature: 0,
    });
    // const model = await initChatModel('gpt-5', {
    //   apiKey,
    //   modelProvider: 'openai',
    //   // temperature: 0,
    // });

    const systemTemplate = `
You are a meticulous text segmenter.
Split the given text into multiple chunks.
Rules:
1) Each chunk must be at least one complete sentence. Do not break a sentence into parts.
2) Preserve context across boundaries—if splitting would cause loss of meaning or context, DO NOT split at that point.
3) The concatenation of all chunks, in order, must EXACTLY match the original text (including all words, punctuation, whitespace, and line breaks).
4) You must always return at least one chunk. If no safe split exists, return a single chunk that is the entire original text.

Here is the text to segment:
{text}
`;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemTemplate],
    ]);

    // const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const chain = RunnableSequence.from([
      prompt,
      model.withStructuredOutput(structuredOutput),
    ]);

    const response = await chain.invoke({ text });
    // Safety net: never return an empty list; ensure exact reconstruction
    const segments = response?.segments ?? [];

    if (!Array.isArray(segments) || segments.length === 0) {
      return [text];
    }

    return segments;
  } catch (error) {
    console.error('Error during segmentation:', {
      error,
      inputLength: text?.length,
    });
    throw new Error('Segmentation failed');
  }
}
