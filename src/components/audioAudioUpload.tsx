import { useState, useTransition } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { transcript } from "~/actions/transcript";
import { useStore } from "~/store";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function AudioVideoUpload({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const file = useStore((state) => state.file);
  const setFile = useStore((state) => state.setFile);
  const [transcription, setTranscription] = useState("");
  const [isPending, startTransition] = useTransition();

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (!selectedFile) return;
    setFile(selectedFile);
    startTransition(async () => {
      const transcription = await transcript(selectedFile);
      startTransition(() => {
        setTranscription(transcription);
      });
    });
  };

  return (
    <Drawer onOpenChange={setIsOpen} open={isOpen}>
      <DrawerTrigger className="cursor-pointer" asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center justify-center gap-2">
            Upload Audio/Video
            <Tooltip>
              <TooltipTrigger>
                <FaQuestionCircle />
              </TooltipTrigger>
              <TooltipContent>
                Supported Formats: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg,
                wav, webm
              </TooltipContent>
            </Tooltip>
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="h-[80dvh] px-8">
          <div className="flex h-full w-full flex-col">
            <Input
              type="file"
              accept=".flac,.m4a,.mp3,.mp4,.mpeg,.mpga,.oga,.ogg,.wav,.webm"
              onChange={onFileUpload}
            />

            {file && (
              <div key={file.name} className="mt-4">
                <audio controls className="w-full">
                  <source src={URL.createObjectURL(file)} type={file.type} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            <div className="flex flex-1 flex-col items-center justify-center">
              {isPending ? (
                <span className="loading loading-dots loading-lg"></span>
              ) : (
                transcription && (
                  <ScrollArea className="h-[calc(100vh-30rem)] w-full rounded-md border p-4">
                    {transcription}
                  </ScrollArea>
                )
              )}
            </div>
          </div>
        </div>
        <DrawerFooter>
          {/* <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose> */}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
