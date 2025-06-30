"use client";

import { useState } from "react";
import { getOpenAIResponse } from "~/actions";
import { useStore } from "~/store";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export default function InputContent() {
  const [content, setContent] = useState<string>("");
  const apikey = useStore((state) =>
    state.apikeys.find((key) => key.id === state.activeApiKeyId),
  );

  const [response, setResponse] = useState<string>();

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <Textarea
        className="flex-1"
        value={content}
        onChange={({ target }) => setContent(target.value)}
      />
      <div className="flex-1">{response}</div>
      <Button
        disabled={!apikey || !content}
        onClick={() => {
          if (apikey) {
            void getOpenAIResponse(apikey.value).then(setResponse);
          }
        }}
        className="m-4"
      >
        Submit
      </Button>
    </div>
  );
}
