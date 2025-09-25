'use server';

import { getProviderFromApiKey } from '@/lib/utils';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';

import { cookies } from 'next/headers';

export async function simplify(
  model: string,
  chunks: { text: string; newWords: string[] }[],
  candidateMap: Record<string, string[]>,
  contextWindowSize: number = 1
) {
  const apiKey = (await cookies()).get('api-key')?.value;

  if (!apiKey) {
    throw new Error('Cannot get API key');
  }

  const provider = getProviderFromApiKey(apiKey);

  const llm =
    provider === 'google'
      ? new ChatGoogleGenerativeAI({
          model: model || 'gemini-2.5-flash',
          apiKey,
        })
      : new ChatOpenAI({
          apiKey,
          model: model || 'gpt-5-mini',
        });

  const systemTemplate = `
You are a careful text simplifier. Use only the provided candidate meanings to simplify the target words when it truly improves clarity without changing the author's intent.
Your task:
1. Try to simplify the text by replacing the new words with one of their candidate meanings if it is a synonym in context.
2. Only replace a noun if it is a common noun with a clear, natural everyday synonym in the candidate list. NEVER replace proper nouns, technical terms, or abstract nouns (like Internet, democracy, freedom, data).
3. Do not replace topics when they appear in meta-phrases like “today we would talk about ___”, “our topic is ___”, “let's discuss ___”. Keep the original topic text unchanged.
4. If no candidate fits naturally, leave the word unchanged.
5. Do NOT simplify fixed expressions (e.g., "ladies and gentlemen", "he's", "it's", "they're").
6. Do NOT simplify idioms (e.g., "spill the beans", "break the ice").
7. Keep the sentence fluent and natural after replacements.
8. Output the simplified version of the text.
`;

  const humanTemplate = `
Text to simplify:
{text}

Context:
{context}

New Word List:
{newWordsList}

Candidate List:
{candidateList}

Please provide the simplified text.`;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemTemplate],
    ['human', humanTemplate],
  ]);
  const chain = RunnableSequence.from([prompt, llm, new StringOutputParser()]);

  const simplifyStartTime = performance.now();

  const all = Promise.all(
    chunks.map((chunk, idx) => {
      const { prev, next } = getContext(chunks, idx, contextWindowSize);
      const context = `Previous sentence: ${prev}\nNext sentence: ${next}`;
      return chunk.newWords.length > 0
        ? simplifySingle(
            chain,
            chunk.text,
            context,
            chunk.newWords,
            candidateMap
          )
        : Promise.resolve(chunk.text);
    })
  );

  const simplifyEndTime = performance.now();
  console.log(
    `Simplification took ${
      (simplifyEndTime - simplifyStartTime) / 1000
    } seconds`
  );

  return all;
}

async function simplifySingle(
  chain: RunnableSequence<unknown, string>,
  text: string,
  context: string,
  newWords: string[],
  candidateMap: Record<string, string[]>
) {
  const newWordsList = newWords.toString();

  let candidateList = ``;

  newWords.forEach((word) => {
    const candidates = candidateMap[word];
    candidateList += `${word}: ${candidates.join(', ')}\n\n`;
  });

  console.log('---- simplify start --- ');
  const response = await chain.invoke({
    text,
    context,
    newWordsList,
    candidateList,
  });
  console.log('---- simplify end --- ');

  return response;
}

function getContext(
  chunks: { text: string }[],
  index: number,
  contextSize = 1
) {
  // Get previous sentences based on contextSize
  const prevSentences: string[] = [];
  for (let i = 1; i <= contextSize; i++) {
    const prevChunk = chunks[index - i];
    if (prevChunk) {
      prevSentences.unshift(prevChunk.text);
    }
  }
  const prev = prevSentences.join(' ');

  // Get next sentences based on contextSize
  const nextSentences: string[] = [];
  for (let i = 1; i <= contextSize; i++) {
    const nextChunk = chunks[index + i];
    if (nextChunk) {
      nextSentences.push(nextChunk.text);
    }
  }
  const next = nextSentences.join(' ');

  return { prev, next };
}
