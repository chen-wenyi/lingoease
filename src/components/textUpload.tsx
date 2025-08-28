'use client';

import { analyzeAndFindCandidateWords } from '@/actions/llm/analyzeAndFindCandidateWords';
import { segment } from '@/actions/llm/segment';
import { simplify } from '@/actions/llm/simplify';
import { tts } from '@/actions/llm/tts';
import { analyzeChunks } from '@/actions/llm/utils';
import { useStore } from '@/store';
import { useState, useTransition } from 'react';
import { Button } from './ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer';
import { Textarea } from './ui/textarea';

export default function TextUpload({
  children,
}: {
  children: React.ReactNode;
}) {
  const wordFreq = useStore((state) => state.outputOptions.level.wordFreq);
  const voice = useStore((state) => state.outputOptions.voice);
  const style = useStore((state) => state.outputOptions.style);

  const content = useStore((state) => state.content);
  const setContent = useStore((state) => state.setContent);
  const setSimplifiedResult = useStore((state) => state.setSimplifiedResult);
  const updateCurrentStep = useStore((state) => state.updateCurrentStep);

  const [simplifying, startSimplifyTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);

  const startSimplify = async () => {
    updateCurrentStep();
    startSimplifyTransition(async () => {
      const chunks = await segment(content);

      console.log('chunks:');
      console.log('------------- chunks ------------- ');
      console.log(chunks);

      // Analyze the chunks
      const analysisRes = await analyzeAndFindCandidateWords(chunks, wordFreq);
      console.log('------------- analysis ------------- ');
      console.log(analysisRes);

      const simplified = await simplify(
        analysisRes.analyzedChunks.map(({ text, newWords }) => ({
          text,
          newWords,
        })),
        analysisRes.candidateMap
      );
      console.log('------------- simplified ------------- ');
      console.log(simplified);

      console.log('------------- analyzeSimplified ------------- ');

      const analyzedSimplifiedChunks = analyzeChunks(simplified, wordFreq);
      console.log(analyzedSimplifiedChunks);

      console.log('------------- tts... ------------- ');
      const ttsResp = await tts(simplified.join(' '), { voice, style });

      if (ttsResp) {
        const { url, downloadUrl } = ttsResp;

        setIsOpen(false);
        setSimplifiedResult({
          url,
          downloadUrl,
          simplifiedText: analyzedSimplifiedChunks.analyzedChunks,
          totalLemmasCount: analyzedSimplifiedChunks.totalLemmasCount,
          totalNewWordsCount: analyzedSimplifiedChunks.totalNewWordsCount,
          newWordsRate: analyzedSimplifiedChunks.newWordsRate,
        });
        updateCurrentStep();
      }
    });
  };

  return (
    <Drawer onOpenChange={setIsOpen} open={isOpen}>
      <DrawerTrigger className='cursor-pointer' asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className='flex items-center justify-center gap-2'>
            Upload Text
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className='flex h-[60dvh] flex-col px-8'>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className='flex-1'
            placeholder='Type your text here...'
          />
        </div>
        <DrawerFooter className='px-8'>
          <Button disabled={!content || simplifying} onClick={startSimplify}>
            {simplifying ? (
              <span className='loading loading-dots loading-xs'></span>
            ) : (
              'Simplify'
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
