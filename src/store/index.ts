import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createConfigSlice } from "./configSlice";
import type { StoreState } from "./typing";

export const useStore = create<StoreState>()(
  persist(
    immer((...args) => ({
      ...createConfigSlice(...args),
    })),
    {
      name: "lingoease-store",
      partialize: (state) => ({
        activeApiKeyId: state.activeApiKeyId,
        apikeys: state.apikeys,
        uploadContentType: state.uploadContentType,
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== "object") {
          return currentState;
        }

        const typedPersistedState = persistedState as Partial<StoreState>;
        return {
          ...currentState,
          ...typedPersistedState,
          apikeys:
            typedPersistedState.apikeys?.map((key) => ({
              ...key,
              status: "pending",
            })) ?? [],
        };
      },
    },
  ),
);
