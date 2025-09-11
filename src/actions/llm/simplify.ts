'use server';

import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { cookies } from 'next/headers';

export async function simplify(
  chunks: { text: string; newWords: string[] }[],
  candidateMap: Record<string, string[]>
) {
  const apiKey = (await cookies()).get('api-key')?.value;

  if (!apiKey) {
    throw new Error('Cannot get API key');
  }

  const model = new ChatOpenAI({
    apiKey,
    model: 'gpt-5-nano',
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

Here is the text to simplify:
{text}

New Word List:
{newWordsList}

Candidate List:
{candidateList}
`;

  const prompt = ChatPromptTemplate.fromMessages([['system', systemTemplate]]);
  const chain = RunnableSequence.from([
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const simplifyStartTime = performance.now();

  const all = Promise.all(
    chunks.map((chunk) =>
      chunk.newWords.length > 0
        ? simplifySingle(chain, chunk.text, chunk.newWords, candidateMap)
        : Promise.resolve(chunk.text)
    )
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
  const response = await chain.invoke({ text, newWordsList, candidateList });
  console.log('---- simplify end --- ');

  return response;
}
