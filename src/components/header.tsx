'use client';
import React from 'react';

import { useStore } from '@/store';
import { Toaster } from './ui/sonner';

export default function Header() {
  const state = useStore();

  // Detect 'dev' query string and set development mode
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('dev') && state.setDevelopment) {
        state.setDevelopment(true);
      }
    }
  }, [state]);

  return (
    <div className='flex w-full h-36 flex-col items-center justify-end'>
      <Toaster />
      <div className=''>
        <div className='text-4xl font-bold' onClick={() => console.log(state)}>
          LingoEase
        </div>
        <div className='flex flex-col items-center justify-center p-2 text-sm font-semibold'>
          <div>Simplify Language</div>
          <div>Amplify Understanding</div>
        </div>
      </div>
    </div>
  );
}
