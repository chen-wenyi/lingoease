'use server';

import { Index } from '@upstash/vector';
import { analyzeChunks } from './utils';

const topK = 15; //50

export async function analyzeAndFindCandidateWords(
  chunks: string[],
  wordFreq: 500 | 1000
) {
  const analyzedChunks = analyzeChunks(chunks, wordFreq);
  const filter = `wordFreq <= ${wordFreq}`;

  const candidateMap = await findCandidateWords(
    analyzedChunks.totalNewWords,
    filter
  );

  return {
    ...analyzedChunks,
    candidateMap,
  };
}

const BATCH_SIZE = 15;
async function findCandidateWords(totalNewWords: string[], filter: string) {
  const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
  });

  const queryParam = totalNewWords.map((word) => ({
    topK,
    data: word,
    filter,
    includeData: true,
  }));

  const candidateMap: Record<string, string[]> = {};

  for (let i = 0; i < totalNewWords.length; i += BATCH_SIZE) {
    const batchQueryParams = queryParam.slice(i, i + BATCH_SIZE);
    if (batchQueryParams.length > 1) {
      const batchQueryResult = await index.queryMany(batchQueryParams);
      batchQueryResult.forEach((result, j) => {
        const wordIndex = i + j;
        const word = totalNewWords[wordIndex];
        candidateMap[word] = result.map((c) => c.data as string);
      });
    } else {
      const singleQueryResult = await index.query(batchQueryParams[0]);
      const wordIndex = i;
      const word = totalNewWords[wordIndex];
      candidateMap[word] = singleQueryResult.map((c) => c.data as string);
    }
  }

  return candidateMap;
}
