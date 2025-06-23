import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createConfigSlice } from "./configSlice";
import type { StoreState } from "./typing";

export const useConfigStore = create<StoreState>()(
  persist(
    immer((...args) => ({
      ...createConfigSlice(...args),
    })),
    { name: "lingoease-store" },
  ),
);
