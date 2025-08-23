'use server';

const url = process.env.NEXT_PUBLIC_WEB_URL + '/wordlist/1000raw.txt';
// const url = process.env.NEXT_PUBLIC_WEB_URL + '/wordlist/500raw.txt';

export async function convertWordList() {
  const response = await fetch(url);
  const data = await response.text();

  const words = [...data.matchAll(/^[\t ]*([A-Z]+)\b.*$/gm)].map((m) =>
    m[1].toLowerCase()
  );

  const wordlist = Array.from(new Set(words)).sort();
  return wordlist;
}
