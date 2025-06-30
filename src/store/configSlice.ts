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
  selectApiKey: (id: string) => {
    set((state) => {
      state.activeApiKeyId = id;
    });
  },
  addApiKey: (label: string, value: string) => {
    const id = uuidv4();
    set((state) => {
      state.apikeys.push({
        id,
        label,
        value,
      });
    });
    return id;
  },
  removeApiKey: (id: string) => {
    set((state) => {
      state.apikeys = state.apikeys.filter((key) => key.id !== id);
      if (state.activeApiKeyId === id) {
        state.activeApiKeyId = "";
      }
    });
  },
  updateApiKey: (id: string, label: string, value: string) => {
    set((state) => {
      const apikey = state.apikeys.find((key) => key.id === id);
      if (apikey) {
        apikey.label = label;
        apikey.value = value;
      }
    });
  },
});
