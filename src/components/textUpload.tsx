'use client';

import { analyzeAndFindCandidateWords } from '@/actions/llm/analyzeAndFindCandidateWords';
import { segment } from '@/actions/llm/segment';
import { simplify } from '@/actions/llm/simplify';
import { tts } from '@/actions/llm/tts';
import { analyzeChunks } from '@/actions/llm/utils';
import { useStore } from '@/store';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import AudioOptions from './AudioOptions';
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
  const model = useStore((s) => s.selectedModel);
  const wordFreq = useStore((state) => state.outputOptions.level.wordFreq);
  const voice = useStore((state) => state.outputOptions.voice);
  const style = useStore((state) => state.outputOptions.style);

  const content = useStore((state) => state.content);
  const setContent = useStore((state) => state.setContent);
  const setSimplifiedResult = useStore((state) => state.setSimplifiedResult);
  const updateCurrentStep = useStore((state) => state.updateCurrentStep);
  const setSimplificationProgress = useStore(
    (state) => state.setSimplificationProgress
  );
  const setOriginalChunks = useStore((state) => state.setOriginalChunks);
  const contextWindowSize = useStore((state) => state.contextWindowSize);

  const [simplifying, startSimplifyTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);

  const startSimplify = () => {
    updateCurrentStep();
    setIsOpen(false);
    startSimplifyTransition(async () => {
      // const transcription = await transcribe(fileUrl);
      try {
        setSimplificationProgress('Segmenting the scripts...');

        const chunks = await segment(content);

        console.log('chunks:');
        console.log('------------- chunks ------------- ');
        console.log(chunks);

        setSimplificationProgress('Analyzing the scripts...');

        // Analyze the chunks
        const analysisRes = await analyzeAndFindCandidateWords(
          chunks,
          wordFreq
        );
        console.log('------------- analysis ------------- ');
        console.log(analysisRes);

        setOriginalChunks(analysisRes.analyzedChunks);

        setSimplificationProgress('Simplifying the scripts...');

        const simplified = await simplify(
          model,
          analysisRes.analyzedChunks.map(({ text, newWords }) => ({
            text,
            newWords,
          })),
          analysisRes.candidateMap,
          contextWindowSize
        );
        console.log('------------- simplified ------------- ');
        console.log(simplified);

        console.log('------------- analyzeSimplified ------------- ');

        const analyzedSimplifiedChunks = analyzeChunks(simplified, wordFreq);

        console.log(analyzedSimplifiedChunks);

        setSimplificationProgress('Generating audio...');

        const simplifiedContent = simplified.join(' ');

        const ttsResp = await tts(simplifiedContent, { voice, style });

        if (!ttsResp) {
          console.error('TTS failed');
          toast.error('TTS failed');
          return;
        }

        const { url, downloadUrl } = ttsResp;

        setSimplificationProgress('');

        // const url = `/api/tts?content=${encodeURIComponent(simplifiedContent)}`;
        // const url = `https://gggr3f0tgjgai8sk.public.blob.vercel-storage.com/ted1-aIKJe4NgUrJmb2e7wxFShGE3Xj6PmC.mp3`;

        // const downloadUrl = '';

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
      } catch (error) {
        console.error('Error during simplification:', error);
        // Include stack if available for more detail
        const description = (error as Error)?.message ?? String(error);
        const stack = (error as Error)?.stack;
        toast.error('Error during simplification', {
          description: stack ? `${description}\n\n${stack}` : description,
        });
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
        <AudioOptions />

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
