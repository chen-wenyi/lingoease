"use client";

import { useStore } from "~/store";

export default function Header() {
  const state = useStore();
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <div className="">
        <div className="text-4xl font-bold" onClick={() => console.log(state)}>
          LingoEase
        </div>
        <div className="flex flex-col items-center justify-center p-2 text-sm font-semibold">
          <div>Simplify Language</div>
          <div>Amplify Understanding</div>
        </div>
      </div>
    </div>
  );
}
