'use server';
import { Index } from '@upstash/vector';
import wf1000 from './wordlist/1000.json' with { type: 'json' };
import wf500 from './wordlist/500.json' with { type: 'json' };

const wordFreq = 1000;

export async function vectorize() {
  const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
  });

  // Filter wf1000 to only include words not present in wf500
  const words = wf1000.filter((word) => !wf500.includes(word));

  // Prepare batch upsert operations
  const upsertData = words.map((word) => ({
    id: word,
    data: word,
    metadata: { wordFreq },
  }));

  // Perform batch upsert
  const result = await index.upsert(upsertData.slice(0, 1000));
  return result;
}
