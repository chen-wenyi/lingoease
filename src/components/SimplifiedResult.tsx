import { useStore } from '@/store';

import { analyze } from '@/actions/llm/analyze';
import { useEffect, useMemo, useState } from 'react';
import Highlighter, { HighlighterProps } from 'react-highlight-words';
import AudioPlayer from './ui/audioPlayer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function SimplifiedResult() {
  const simplifiedResult = useStore((state) => state.simplifiedResult);
  return (
    <div className='flex flex-col items-center justify-center w-full px-8 overscroll-none'>
      {simplifiedResult?.audioFileUrl && <ResultTabs />}
    </div>
  );
}

function Highlight({ children, highlightIndex }: HighlighterProps) {
  return (
    <strong className='highlighted-text text-orange-500'>{children}</strong>
  );
}

function ResultTabs() {
  return (
    <Tabs defaultValue='simplified' className='w-full h-full'>
      <TabsList className='w-full'>
        <TabsTrigger value='simplified'>Simplified</TabsTrigger>
        <TabsTrigger value='original'>Original</TabsTrigger>
      </TabsList>
      <TabsContent
        value='simplified'
        forceMount
        className='data-[state=inactive]:hidden'
      >
        <SimplifiedTabContent />
      </TabsContent>
      <TabsContent
        value='original'
        forceMount
        className='data-[state=inactive]:hidden'
      >
        <OriginalTabContent />
      </TabsContent>
    </Tabs>
  );
}

function SimplifiedTabContent() {
  const simplifiedResult = useStore((state) => state.simplifiedResult);
  const chunks = simplifiedResult?.simplifiedText.map((s) => s.text);

  const wordFreq = useStore((state) => state.outputOptions.level.wordFreq);

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
    simplifiedResult && (
      <div className='flex items-center justify-center flex-col'>
        <div className='flex w-full items-center justify-center py-2 px-4'>
          Vocabulary Coverage:{' '}
          <span className='font-bold'>
            {(1 - Number(simplifiedResult.newWordsRate)) * 100}%
          </span>
        </div>
        <div className='flex  flex-col text-md mb-4 flex-1 w-full gap-4'>
          <AudioPlayer
            src={simplifiedResult.audioFileUrl}
            title='Simplified Audio'
            downloadUrl={simplifiedResult.audioDownloadUrl}
          />
          <div className='h-[calc(100dvh-30rem)] w-full rounded-md p-4 overflow-y-auto overscroll-none'>
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
        </div>
      </div>
    )
  );
}

function OriginalTabContent() {
  const file = useStore((state) => state.file);

  const originalChunks = useStore((state) => state.originalChunks);
  const chunks = useMemo(
    () => originalChunks?.map((chunk) => chunk.text),
    [originalChunks]
  );

  const wordFreq = useStore((state) => state.outputOptions.level.wordFreq);

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
    file && (
      <div className='flex items-center justify-center flex-col'>
        <div className='flex w-full items-center justify-center py-2 px-4'>
          Vocabulary Coverage:{' '}
          <span className='font-bold'>
            {analysedText && (1 - Number(analysedText.newWordsRate)) * 100}%
          </span>
        </div>
        <div className='flex  flex-col text-md mb-4 flex-1 w-full gap-4'>
          <AudioPlayer
            src={URL.createObjectURL(file)}
            title={file.name}
            type={file.type}
          />

          <div className='h-[calc(100dvh-30rem)] w-full rounded-md p-4 overflow-y-auto overscroll-none'>
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
        </div>
      </div>
    )
  );
}
