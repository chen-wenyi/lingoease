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
  content: "",
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
  updateCurrentStep: () => {
    set((state) => {
      const activeApiKey = state.apikeys.find(
        (key) => key.id === state.activeApiKeyId,
      );
      if (activeApiKey?.status === "valid") {
        if (state.content) {
          state.currentStep = 2;
          if (state.simplifiedContent) {
            state.currentStep = 3;
          }
        } else {
          state.currentStep = 1;
        }
      } else {
        state.currentStep = 0;
      }
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
  setContent: (content) => {
    set((state) => {
      if (!content) {
        state.simplifiedContent = "";
      }
      state.content = content;
    });
  },
  setSimplifiedContent: (content) => {
    set((state) => {
      state.simplifiedContent = content;
    });
  },
});
