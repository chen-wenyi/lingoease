import { useTransition } from "react";
import { simplify } from "~/actions/simplify";
import { useStore } from "~/store";
import { Button } from "./ui/button";

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
    <div>
      {simplifiedContent && (
        <div className="text-md mb-4 h-45 overflow-auto">
          <div className="mb-4 text-lg font-semibold">Simplified Text</div>
          <div>{simplifiedContent}</div>
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
