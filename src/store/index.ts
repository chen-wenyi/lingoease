import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createConfigSlice } from "./configSlice";
import type { StoreState } from "./typing";
import { OUTPUT_STYLES, OUTPUT_LEVELS } from "./typing";

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
        outputOptions: state.outputOptions,
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== "object") {
          return currentState;
        }

        const typedPersistedState = persistedState as Partial<StoreState>;
        const merged = {
          ...currentState,
          ...typedPersistedState,
          apikeys:
            typedPersistedState.apikeys?.map((key) => ({
              ...key,
              status: "pending",
            })) ?? [],
        } as StoreState;

        // Migrate outputOptions.style from string -> object if needed
        const po = (typedPersistedState as any).outputOptions;
        if (po) {
          const style = po.style;
          if (typeof style === "string") {
            const found = OUTPUT_STYLES.find((s) => s.name === style) ?? OUTPUT_STYLES[0];
            merged.outputOptions = { ...merged.outputOptions, ...po, style: found };
          } else if (style && typeof style.name === "string" && !style.instruction) {
            const found = OUTPUT_STYLES.find((s) => s.name === style.name) ?? OUTPUT_STYLES[0];
            merged.outputOptions = { ...merged.outputOptions, ...po, style: found };
          }

          // Migrate outputOptions.level from string -> { level, wordFreq }
          const level = po.level;
          if (typeof level === "string") {
            const found = OUTPUT_LEVELS.find((l) => l.level === level) ?? OUTPUT_LEVELS[0];
            merged.outputOptions = { ...merged.outputOptions, ...po, level: found };
          } else if (level && typeof level.level === "string" && level.wordFreq == null) {
            const found = OUTPUT_LEVELS.find((l) => l.level === level.level) ?? OUTPUT_LEVELS[0];
            merged.outputOptions = { ...merged.outputOptions, ...po, level: found };
          }
        }

        return merged;
      },
    },
  ),
);
