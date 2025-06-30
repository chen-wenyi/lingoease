"use client";

import { useState, useTransition } from "react";
import { getOpenAIResponse } from "~/actions";
import { useStore } from "~/store";
import { Button } from "./ui/button";
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
        const content = await getOpenAIResponse(apikey.value);
        startTransition(() => {
          setResponse(content);
        });
      }
    });
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <Textarea
        className="flex-1"
        value={content}
        onChange={({ target }) => setContent(target.value)}
      />
      <div className="flex-1">{response}</div>
      <Button
        disabled={!apikey || !content || isPending}
        onClick={() => {
          handleResponse();
        }}
        className="m-4"
      >
        {isPending ? (
          <span className="loading loading-ring loading-md"></span>
        ) : (
          "Submit"
        )}
      </Button>
    </div>
  );
}
