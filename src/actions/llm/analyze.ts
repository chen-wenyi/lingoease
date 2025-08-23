'use server';

import { analyzeChunks } from './utils';

const topK = 50;

export async function analyze(chunks: string[], wordFreq: 500 | 1000) {
  return analyzeChunks(chunks, wordFreq);
}
