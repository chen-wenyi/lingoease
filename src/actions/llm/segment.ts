'use server';

import model from 'wink-eng-lite-web-model';
import winkNLP from 'wink-nlp';

export async function segment(text: string) {
  const nlp = winkNLP(model);
  const doc = nlp.readDoc(text);
  const sentences = doc.sentences().out();
  return sentences;
}
