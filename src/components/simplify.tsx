'use client';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/store';
import clsx from 'clsx';
import Timer from './timer';

export default function Simplify() {
  const simplificationProgress = useStore(
    (state) => state.simplificationProgress
  );
  return (
    <div
      className={clsx(
        'flex flex-col justify-center items-center w-full mb-4 px-8 gap-2',
        { 'opacity-0': simplificationProgress.number === 0 }
      )}
    >
      <div className='animate-pulse text-sm text-nowrap'>
        {simplificationProgress.message} <Timer />
      </div>
      <Progress value={simplificationProgress.number} />
    </div>
  );
}
