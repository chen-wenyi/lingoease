import model from 'wink-eng-lite-web-model';
import winkNLP, { TokenItsFunction } from 'wink-nlp';
import word1000 from './wordlist/1000.json' with { type: 'json' };
import word500 from './wordlist/500.json' with { type: 'json' };

const word500Set = new Set(word500);
const word1000Set = new Set(word1000);

export function analyzeChunks(chunks: string[], wordFreq: 500 | 1000) {
  const wordSet = wordFreq === 500 ? word500Set : word1000Set;

  const nlp = winkNLP(model);
  const { its, as } = nlp;

  const lemmaFunc = its.lemma as TokenItsFunction<string>;

  const totalLemmasSet = new Set<string>();

  const analyzedChunks = chunks.map((c) => {
    const doc = nlp.readDoc(c);

    const tokens = doc.tokens();
    const filteredTokens = tokens.filter(
      (t) => t.out(its.type) !== 'punctuation' && t.out(lemmaFunc) !== 'in.'
    );
    const lemmas = filteredTokens.out(lemmaFunc);
    const words = filteredTokens.out();

    const lemmasOriginalWordsMap = new Map<string, string>();
    lemmas.forEach((l, i) => {
      const originalWord = words[i];
      if (originalWord) {
        lemmasOriginalWordsMap.set(l, originalWord);
      }
    });

    const uniqueLemmas = Array.from(new Set(lemmas));

    uniqueLemmas.forEach((l) => totalLemmasSet.add(l));

    const newWords = uniqueLemmas.filter((l) => {
      if (wordSet.has(l)) return false;
      if (!isNaN(Number(l))) return false;
      if (/^(i|you|he|she|it|we|they)'[a-z]+$/i.test(l)) return false;
      if (/^[a-z]+'s$/i.test(l)) return false;
      return true;
    });

    return {
      text: c,
      lemmas,
      lemmasOriginalWordsMap,
      newWords,
    };
  });

  const totalLemmas = Array.from(totalLemmasSet);

  const totalNewWords = Array.from(
    new Set(analyzedChunks.flatMap((chunk) => chunk.newWords))
  );

  return {
    analyzedChunks,
    totalNewWords,
    totalLemmasCount: totalLemmas.length,
    totalNewWordsCount: totalNewWords.length,
    newWordsRate: (totalNewWords.length / totalLemmas.length).toFixed(2),
  };
}
