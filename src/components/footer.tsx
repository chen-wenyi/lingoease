"use client";

import { useStore } from "~/store";
import Keyconfig from "./keyconfig";
import { Button } from "./ui/button";
import Upload from "./upload";

export default function Footer() {
  const currentStep = useStore((state) => state.currentStep);

  const renederStepContent = () => {
    switch (currentStep) {
      case 0:
        return <SetAPIKey />;
      case 1:
        return <Upload />;
      case 2:
        return <Button className="w-full">Simplify</Button>;
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-end">
      <div className="mb-6 w-full px-6">{renederStepContent()}</div>
    </div>
  );
}

function SetAPIKey() {
  return (
    <Keyconfig>
      <Button className="h-12 w-full">Set API Key</Button>
    </Keyconfig>
  );
}
