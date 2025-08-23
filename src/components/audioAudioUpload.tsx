'use client';

import { analyzeAndFindCandidateWords } from '@/actions/llm/analyzeAndFindCandidateWords';
import { segment } from '@/actions/llm/segment';
import { simplify } from '@/actions/llm/simplify';
import { analyzeChunks } from '@/actions/llm/utils';
import { useStore } from '@/store';
import { useState, useTransition } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { toast } from 'sonner';
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
  const wordFreq = useStore((state) => state.wordFreq);
  const file = useStore((state) => state.file);
  const fileUrl = useStore((state) => state.fileUrl);
  const setFile = useStore((state) => state.setFile);
  const setFileUrl = useStore((state) => state.setFileUrl);
  const updateCurrentStep = useStore((state) => state.updateCurrentStep);

  const [uploading, startUploadTransition] = useTransition();

  const [simplifying, startSimplifyTransition] = useTransition();
  const setSimplifiedResult = useStore((state) => state.setSimplifiedResult);

  const [debugContent, setDebugContent] = useState('');

  const onFileUpload = async (file: File | null) => {
    if (!file) return;
    setFile(file);

    // startUploadTransition(async () => {
    //   let payload: File = file;
    //   try {
    //     // why do this? when uploading from google drive, the file needs to be fully downloaded
    //     const ab = await file.arrayBuffer();
    //     console.log('file type:', file.type);
    //     payload = new File([ab], file.name, {
    //       type: file.type,
    //     });
    //     setFile(payload);
    //   } catch (readErr) {
    //     // If arrayBuffer fails, fall back to original file object but log the error
    //     console.warn(
    //       'Could not read file with arrayBuffer, falling back to original file',
    //       readErr
    //     );
    //   }
    //   // const { url } = await upload(file.name, file, {
    //   //   access: 'public',
    //   //   handleUploadUrl: '/api/upload',
    //   //   // multipart: true,
    //   // });

    //   // setFileUrl(url);
    // });
  };

  const startSimplify = () => {
    updateCurrentStep();
    startSimplifyTransition(async () => {
      // const transcription = await transcribe(fileUrl);
      try {
        const form = new FormData();

        setDebugContent('arrayBuffer');
        const file_ = await file?.arrayBuffer();
        setDebugContent('append form');

        if (file_) {
          form.append(
            'blob',
            new Blob([file_], { type: file!.type }),
            file!.name
          );
        }
        form.append('filename', file!.name);

        setDebugContent('fetching');

        const res = await fetch('/api/transcribe', {
          method: 'POST',
          body: form,
        });

        // const res = await Axios.post('/api/transcribe', form, {
        //   headers: { 'Content-Type': 'multipart/form-data' },
        // });

        const transcription = await res.json();

        // const transcription = await res.data;

        console.log('------------- transcription ------------- ');
        console.log(transcription);
        if (!transcription.ok) {
          console.error('Transcription failed:', transcription.error);
          toast.error(transcription.error);
          return;
        }

        const chunks = await segment(transcription.text);

        console.log('chunks:');
        console.log('------------- chunks ------------- ');
        console.log(chunks);

        // Analyze the chunks
        const analysisRes = await analyzeAndFindCandidateWords(
          chunks,
          wordFreq
        );
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

        const simplifiedContent = simplified.join(' ');
        // const ttsResp = await tts(simplified.join(' '));

        // if (ttsResp) {
        // const { url, downloadUrl } = ttsResp;

        const url = `/api/tts?content=${encodeURIComponent(simplifiedContent)}`;
        // const url = `https://gggr3f0tgjgai8sk.public.blob.vercel-storage.com/lingoease-simplified-mee3til75lmm.ogg`;

        const downloadUrl = '';

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
        const err = error as Error;
        setDebugContent(
          JSON.stringify({
            message: err?.message,
            stack: err?.stack,
          })
        );
        console.error('Error during simplification:', error);
        // Include stack if available for more detail
        const description = (error as Error)?.message ?? String(error);
        const stack = (error as Error)?.stack;
        toast.error('Error during simplification', {
          description: stack ? `${description}\n\n${stack}` : description,
        });
      }
      // }
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
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className='flex items-center justify-center gap-2'>
            Upload Audio/Video
            <Instructions />
          </DrawerTitle>
          <DrawerDescription>{debugContent}</DrawerDescription>
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
        <DrawerFooter className='px-8 flex gap-2 flex-row'>
          {file && (
            <Button
              variant='destructive'
              onClick={handleRemove}
              disabled={uploading || simplifying}
            >
              Remove
            </Button>
          )}
          <Button
            className='flex-1'
            disabled={!file || uploading}
            onClick={startSimplify}
          >
            {uploading ? (
              'Uploading...'
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
  const content = `
  Two years ago here at TED I reported that we had discovered at Saturn, with the Cassini Spacecraft, an anomalously warm and geologically active region at the southern tip of the small Saturnine moon Enceladus, seen here. This region seen here for the first time in the Cassini image taken in 2005. This is the south polar region, with the famous tiger-stripe fractures crossing the south pole. And seen just recently in late 2008, here is that region again, now half in darkness because the southern hemisphere is experiencing the onset of August and eventually winter. And I also reported that we'd made this mind-blowing discovery -- this once-in-a-lifetime discovery of towering jets erupting from those fractures at the south pole, consisting of tiny water ice crystals accompanied by water vapor and simple organic compounds like carbon dioxide and methane. And at that time two years ago I mentioned that we were speculating that these jets might in fact be geysers, and erupting from pockets or chambers of liquid water underneath the surface, but we weren't really sure. However, the implications of those results -- of a possible environment within this moon that could support prebiotic chemistry, and perhaps life itself -- were so exciting that, in the intervening two years, we have focused more on Enceladus. We've flown the Cassini Spacecraft by this moon now several times, flying closer and deeper into these jets, into the denser regions of these jets, so that now we have come away with some very precise compositional measurements. And we have found that the organic compounds coming from this moon are in fact more complex than we previously reported. While they're not amino acids, we're now finding things like propane and benzene, hydrogen cyanide, and formaldehyde. And the tiny water crystals here now look for all the world like they are frozen droplets of salty water, which is a discovery that suggests that not only do the jets come from pockets of liquid water, but that that liquid water is in contact with rock. And that is a circumstance that could supply the chemical energy and the chemical compounds needed to sustain life. 

  
  `;
  const onClick = async () => {
    const resp = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    console.log(resp);
  };

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
          <audio controls>
            <source src={`/api/tts?content=${encodeURIComponent(content)}`} />
            Your browser does not support the audio element.
          </audio>
          <AlertDialogCancel>Got it</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
