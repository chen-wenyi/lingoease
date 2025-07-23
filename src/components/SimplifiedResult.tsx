import { useTransition } from "react";
import { simplify } from "~/actions/simplify";
import { useStore } from "~/store";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

export default function SimplifiedResult() {
  const content = useStore((state) => state.content);
  const activeApiKeyId = useStore((state) => state.activeApiKeyId);
  const apikey = useStore((state) =>
    state.apikeys.find((key) => key.id === activeApiKeyId),
  )!;
  const updateCurrentStep = useStore((state) => state.updateCurrentStep);
  const simplifiedContent = useStore((state) => state.simplifiedContent);
  const setSimplifiedContent = useStore((state) => state.setSimplifiedContent);

  const [isPending, startTransition] = useTransition();

  const onRegenerate = async () => {
    startTransition(async () => {
      if (apikey) {
        const res = await simplify(content);
        startTransition(() => {
          setSimplifiedContent(res);
          updateCurrentStep();
        });
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {simplifiedContent && (
        <div className="text-md mb-4 flex-1">
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            {simplifiedContent}
          </ScrollArea>
        </div>
      )}
      <Button className="h-12 w-full" onClick={onRegenerate}>
        {isPending ? (
          <span className="loading loading-dots loading-sm"></span>
        ) : (
          "Regenerate"
        )}
      </Button>
    </div>
  );
}
