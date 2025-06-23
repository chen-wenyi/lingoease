"use client";
import { useConfigStore } from "~/store";

export default function Test() {
  const bear = useConfigStore((state) => state.bears);
  const addABear = useConfigStore((state) => state.addABear);
  return (
    <>
      {bear}
      <div onClick={addABear}>Add</div>
    </>
  );
}
