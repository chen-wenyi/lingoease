import type { StateCreator } from "zustand";
import type { ConfigSlice, StoreState } from "./typing";

export const createConfigSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  ConfigSlice
> = (set, get) => ({
  bears: 0,
  addABear: () => {
    set((state) => {
      state.bears += 1;
    });
  },
});
