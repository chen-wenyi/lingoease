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
You are a text simplifier. Your main goal is to replace the new words with their candidate meanings 
whenever the replacement fits naturally and keeps the original intent.  

Rules:
1. Prefer using the candidate list whenever possible. 
2. If no candidate makes sense at all, keep the word unchanged.  
3. Do not replace topics when they appear in meta-phrases like “today we would talk about ___”, “our topic is ___”, “let's discuss ___”. Keep the original topic text unchanged.
4. Do not simplify fixed expressions (e.g., "ladies and gentlemen", "he's", "it's", "they're").  
5. Do not simplify idioms (e.g., "spill the beans", "break the ice").  
6. Make sure the final text is fluent and natural.  

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
