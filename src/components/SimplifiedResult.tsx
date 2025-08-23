import { useStore } from '@/store';

import { analyze } from '@/actions/llm/analyze';
import { useEffect, useState } from 'react';
import Highlighter, { HighlighterProps } from 'react-highlight-words';
import AudioPlayer from './ui/audioPlayer';

export default function SimplifiedResult() {
  const simplifiedResult = useStore((state) => state.simplifiedResult);
  const chunks = simplifiedResult?.simplifiedText.map((s) => s.text);

  const wordFreq = useStore((state) => state.wordFreq);

  const [analysedText, setAnalysedText] =
    useState<Awaited<ReturnType<typeof analyze>>>();

  useEffect(() => {
    if (chunks) {
      analyze(chunks, wordFreq).then((result) => {
        setAnalysedText(result);
      });
    }
  }, []);

  return (
    <div className='flex flex-col items-center justify-center w-full px-8 overscroll-none'>
      {simplifiedResult?.audioFileUrl && (
        <div className='flex  flex-col text-md mb-4 flex-1 w-full gap-4'>
          <AudioPlayer
            src={simplifiedResult.audioFileUrl}
            title='Simplified Audio'
            downloadUrl={simplifiedResult.audioDownloadUrl}
          />
          <audio controls>
            <source src={simplifiedResult.audioFileUrl} />
            Your browser does not support the audio element.
          </audio>

          {/* <ScrollArea className='h-[350px] w-full rounded-md p-4 overscroll-none'> */}
          <div className='h-[350px] w-full rounded-md p-4 overflow-y-auto overscroll-none'>
            {analysedText?.analyzedChunks.map(
              ({ text, newWords, lemmasOriginalWordsMap }, index) => (
                <div className='mb-6 select-text' key={index}>
                  <Highlighter
                    highlightClassName='YourHighlightClass'
                    searchWords={newWords.map(
                      (word) =>
                        new RegExp(
                          `\\b${lemmasOriginalWordsMap.get(word) ?? ''}\\b`,
                          'i'
                        )
                    )}
                    autoEscape={false}
                    textToHighlight={text}
                    highlightTag={Highlight}
                  />
                </div>
              )
            )}
          </div>
          {/* </ScrollArea> */}
        </div>
      )}
    </div>
  );
}

function Highlight({ children, highlightIndex }: HighlighterProps) {
  return (
    <strong className='highlighted-text text-orange-500'>{children}</strong>
  );
}
