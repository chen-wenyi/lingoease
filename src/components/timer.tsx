"use client";

import React from "react";

type TimerProps = {
  // The first value to display after one interval (default: 1)
  start?: number;
  // Interval between ticks in milliseconds (default: 1000)
  intervalMs?: number;
  // Optional className for styling
  className?: string;
  // Optional callback invoked on each tick with the current value
  onTick?: (value: number) => void;
};

/**
 * Timer component that counts up from `start` every `intervalMs` until unmounted.
 * By default it starts at 1 and increments every 1s.
 */
export default function Timer({
  start = 1,
  intervalMs = 1000,
  className,
  onTick,
}: TimerProps) {
  // Initialize to `start - 1` so the first tick shows `start`
  const [value, setValue] = React.useState<number>(start - 1);

  React.useEffect(() => {
    let isMounted = true;
    const id = window.setInterval(() => {
      if (!isMounted) return;
      setValue((prev) => {
        const next = prev + 1;
        if (onTick) onTick(next);
        return next;
      });
    }, intervalMs);

    return () => {
      isMounted = false;
      window.clearInterval(id);
    };
  }, [intervalMs, onTick]);

  return <span className={className}>{value}s</span>;
}

