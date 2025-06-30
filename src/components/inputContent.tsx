"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { getOpenAIResponse } from "~/actions";
import { useStore } from "~/store";
import { Button } from "./ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { Toaster } from "./ui/sonner";
import { Textarea } from "./ui/textarea";

export default function InputContent() {
  const [isPending, startTransition] = useTransition();

  const [content, setContent] = useState<string>("");
  const apikey = useStore((state) =>
    state.apikeys.find((key) => key.id === state.activeApiKeyId),
  );

  const [response, setResponse] = useState<string>();

  const handleResponse = () => {
    startTransition(async () => {
      if (apikey) {
        const { content, errMessage } = await getOpenAIResponse(apikey.value);
        startTransition(() => {
          if (errMessage) {
            toast.error(errMessage);
          } else {
            setResponse(content);
          }
        });
      }
    });
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <Toaster />
      <div className="flex-1">
        {!response ? (
          <div className="flex h-full w-full items-center justify-center px-2">
            <Textarea
              className="h-full w-full touch-none resize-none"
              placeholder="Type your text here..."
              value={content}
              onChange={({ target }) => setContent(target.value)}
              draggable={true}
            />
          </div>
        ) : (
          <ResizablePanelGroup
            direction="vertical"
            className="min-h-[calc(100dvh-10rem)] border-none active:border-none"
          >
            <ResizablePanel defaultSize={20} minSize={20}>
              <div className="flex h-full items-center justify-center p-2">
                <Textarea
                  className="h-full w-full touch-none resize-none"
                  placeholder="Type your text here..."
                  value={content}
                  onChange={({ target }) => setContent(target.value)}
                  draggable={true}
                />
              </div>
            </ResizablePanel>
            <div
              className="my-2 touch-none px-2 select-none"
              onTouchMove={(e) => e.preventDefault()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <ResizableHandle
                className="before:absolute before:inset-0 before:-inset-y-4 before:h-full before:min-h-[40px] before:w-full before:content-['']"
                withHandle
              />
            </div>
            <ResizablePanel defaultSize={80} minSize={20}>
              <div className="flex h-full w-full p-2">
                <div className="w-full overflow-x-auto rounded-md border p-2">
                  {response}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
      <div className="flex h-16 w-full items-center justify-center">
        <Button
          disabled={!apikey || !content || isPending}
          onClick={() => {
            handleResponse();
          }}
          className="w-full"
        >
          {isPending ? (
            <span className="loading loading-ring loading-md"></span>
          ) : !apikey ? (
            "Please set your API Key"
          ) : (
            "Simplify"
          )}
        </Button>
      </div>
    </div>
  );
}
