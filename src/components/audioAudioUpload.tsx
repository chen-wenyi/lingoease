'use client';

import { analyzeAndFindCandidateWords } from '@/actions/llm/analyzeAndFindCandidateWords';
import { segment } from '@/actions/llm/segment';
import { simplify } from '@/actions/llm/simplify';
import { tts } from '@/actions/llm/tts';
import { analyzeChunks } from '@/actions/llm/utils';
import { useStore } from '@/store';
import { KokoroTTS } from 'kokoro-js';
import { useState, useTransition } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { toast } from 'sonner';
import AudioOptions from './AudioOptions';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import AudioPlayer from './ui/audioPlayer';
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
import UploadMedia from './ui/uploadMedia';

export default function AudioVideoUpload({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wordFreq = useStore((state) => state.outputOptions.level.wordFreq);
  const file = useStore((state) => state.file);
  const setFile = useStore((state) => state.setFile);
  const setFileUrl = useStore((state) => state.setFileUrl);
  const updateCurrentStep = useStore((state) => state.updateCurrentStep);
  const voice = useStore((state) => state.outputOptions.voice);
  const style = useStore((state) => state.outputOptions.style);
  // const kokoroModel = useKokoroModel();]
  const setSimplificationProgress = useStore(
    (state) => state.setSimplificationProgress
  );

  const [simplifying, startSimplifyTransition] = useTransition();
  const setSimplifiedResult = useStore((state) => state.setSimplifiedResult);

  const setOriginalChunks = useStore((state) => state.setOriginalChunks);

  // const kokoroModel = useKokoroModel();

  const onFileUpload = async (file: File | null) => {
    if (!file) return;
    setFile(file);
  };

  const startSimplify = () => {
    updateCurrentStep();
    setIsOpen(false);
    startSimplifyTransition(async () => {
      // const transcription = await transcribe(fileUrl);
      try {
        setSimplificationProgress('Extracting the scripts from audio...');

        const form = new FormData();

        const file_ = await file?.arrayBuffer();

        if (file_) {
          form.append(
            'blob',
            new Blob([file_], { type: file!.type }),
            file!.name
          );
        }
        form.append('filename', file!.name);

        const res = await fetch('/api/transcribe', {
          method: 'POST',
          body: form,
        });

        const transcription = await res.json();

        // const transcription = await res.data;

        console.log('------------- transcription ------------- ');
        console.log(transcription);
        if (!transcription.ok) {
          console.error('Transcription failed:', transcription.error);
          toast.error(transcription.error);
          return;
        }

        setSimplificationProgress('Segmenting the scripts...');

        const chunks = await segment(transcription.text);

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

        setSimplificationProgress('Generating audio...');

        const simplifiedContent = simplified.join(' ');

        const ttsResp = await tts(simplifiedContent, { voice, style });

        if (!ttsResp) {
          console.error('TTS failed');
          toast.error('TTS failed');
          return;
        }

        const { url, downloadUrl } = ttsResp;

        // setSimplificationProgress('');

        // Using kokoro-js for TTS
        // const url = await kokoroTTS(simplifiedContent, kokoroModel);
        // const url = await kokoroTTSStreamWaitUrl(simplifiedContent);
        // const downloadUrl = url;

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

  const handleRemove = () => {
    setFile(null);
    setFileUrl('');
  };

  return (
    <Drawer onOpenChange={setIsOpen} open={isOpen}>
      <DrawerTrigger className='cursor-pointer' asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DrawerHeader>
          <DrawerTitle className='flex items-center justify-center gap-2'>
            Upload Audio/Video
            <Instructions />
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className='flex h- px-8 w-full flex-col gap-4'>
          {file ? (
            <div key={file.name}>
              {/* <audio controls className='w-full'>
                <source src={URL.createObjectURL(file)} type={file.type} />
                Your browser does not support the audio element.
              </audio> */}
              <AudioPlayer src={URL.createObjectURL(file)} title={file.name} />
            </div>
          ) : (
            <UploadMedia onChange={onFileUpload} />
          )}
        </div>
        <AudioOptions />

        <DrawerFooter className='px-8 flex gap-2 flex-row'>
          {file && (
            <Button
              variant='destructive'
              onClick={handleRemove}
              disabled={simplifying}
            >
              Remove
            </Button>
          )}
          <Button className='flex-1' disabled={!file} onClick={startSimplify}>
            {!file ? (
              'Simplify'
            ) : simplifying ? (
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

function Instructions() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <FaQuestionCircle className='cursor-pointer' />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Support Formats</AlertDialogTitle>
          <AlertDialogDescription className='text-left'>
            flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Got it</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

async function kokoroTTS(text: string, model: KokoroTTS | null) {
  if (!model) {
    throw new Error('Kokoro model is not loaded yet');
  }

  const ttsStartTime = Date.now();
  console.log('Generating audio...');
  // Example text
  // const text =
  //   "Life is like a box of chocolates. You never know what you're gonna get.";
  const audio = await model.generate(text, {
    // Use `tts.list_voices()` to list all available voices
    voice: 'am_adam',
    speed: 0.7,
  });
  const ttsEndTime = Date.now();
  console.log(
    `Audio generated in ${(ttsEndTime - ttsStartTime) / 1000} seconds`
  );

  const blob = audio.toBlob();
  const audioUrl = URL.createObjectURL(blob);
  return audioUrl;
}
