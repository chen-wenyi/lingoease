import { useTransition } from "react";
import { simplify } from "~/actions/simplify";
import { useStore } from "~/store";
import { Button } from "./ui/button";

export default function Simplify() {
  const content = useStore((state) => state.content);
  const activeApiKeyId = useStore((state) => state.activeApiKeyId);
  const apikey = useStore((state) =>
    state.apikeys.find((key) => key.id === activeApiKeyId),
  )!;
  const updateCurrentStep = useStore((state) => state.updateCurrentStep);
  const setSimplifiedContent = useStore((state) => state.setSimplifiedContent);

  const [isPending, startTransition] = useTransition();

  const onSubmit = async () => {
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
    <Button className="h-12 w-full" onClick={onSubmit}>
      {isPending ? (
        <span className="loading loading-dots loading-sm"></span>
      ) : (
        "Simplify"
      )}
    </Button>
  );
}
