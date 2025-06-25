import { v4 as uuidv4 } from "uuid";
import type { StateCreator } from "zustand";
import type { ConfigSlice, StoreState } from "./typing";

export const createConfigSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  ConfigSlice
> = (set, get) => ({
  activeApiKeyId: "",
  apikeys: [],
  addApiKey: (label: string, value: string) => {
    set((state) => {
      state.apikeys.push({
        id: uuidv4(),
        label,
        value,
      });
    });
  },
});
