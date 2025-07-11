import { v4 as uuidv4 } from "uuid";
import type { StateCreator } from "zustand";
import type { ConfigSlice, StoreState } from "./typing";

export const createConfigSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  ConfigSlice
> = (set, _) => ({
  activeApiKeyId: "",
  apikeys: [],
  currentStep: 0,
  uploadContentType: "audioVideo",
  selectApiKey: (id) => {
    set((state) => {
      state.activeApiKeyId = id;
    });
  },
  addApiKey: (label, value) => {
    const id = uuidv4();
    set((state) => {
      state.apikeys.push({
        id,
        label,
        value,
        status: "valid",
      });
    });
    return id;
  },
  removeApiKey: (id) => {
    set((state) => {
      state.apikeys = state.apikeys.filter((key) => key.id !== id);
      if (state.activeApiKeyId === id) {
        state.activeApiKeyId = "";
      }
    });
  },
  updateApiKey: (key) => {
    set((state) => {
      state.apikeys = state.apikeys.map((k) => {
        if (k.id !== key.id) return k;
        return key;
      });
    });
  },
  updateCurrentStep: (step) => {
    set((state) => {
      state.currentStep = step;
    });
  },
  updateUploadContentType: (type) => {
    set((state) => {
      state.uploadContentType = type;
    });
  },
  updateApiKeyStatus: (id, status) => {
    set((state) => {
      const apikey = state.apikeys.find((key) => key.id === id);
      if (apikey) {
        apikey.status = status;
      }
    });
  },
});
