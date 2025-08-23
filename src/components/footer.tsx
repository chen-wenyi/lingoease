'use client';

import { useStore } from '@/store';
import Keyconfig from './keyconfig';
import Simplify from './simplify';
import { Button } from './ui/button';
import Upload from './upload';

export default function Footer() {
  const currentStep = useStore((state) => state.currentStep);
  const resetAll = useStore((state) => state.resetAll);

  const renederStepContent = () => {
    switch (currentStep) {
      case 0:
        return <SetAPIKey />;
      case 1:
        return <Upload />;
      case 2:
        return <Simplify />;
      case 3:
        return (
          <Button className='h-12 w-full' onClick={resetAll}>
            Start Over
          </Button>
        );
    }
  };

  return (
    <div className='flex w-full h-24 flex-col items-center justify-end'>
      <div className='mb-6 w-full px-6'>{renederStepContent()}</div>
    </div>
  );
}

function SetAPIKey() {
  return (
    <Keyconfig>
      <Button className='h-12 w-full'>Set API Key</Button>
    </Keyconfig>
  );
}
