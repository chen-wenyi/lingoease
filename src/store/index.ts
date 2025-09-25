import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createConfigSlice } from './configSlice';
import type {
  OutputLevel,
  OutputStyle,
  OutputVoice,
  StoreState,
} from './typing';
import { OUTPUT_LEVELS, OUTPUT_STYLES } from './typing';

export const useStore = create<StoreState>()(
  persist(
    immer((...args) => ({
      ...createConfigSlice(...args),
    })),
    {
      name: 'lingoease-store',
      partialize: (state) => ({
        activeApiKeyId: state.activeApiKeyId,
        apikeys: state.apikeys,
        uploadContentType: state.uploadContentType,
        outputOptions: state.outputOptions,
        selectedModel: state.selectedModel,
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return currentState;
        }

        const typedPersistedState = persistedState as Partial<StoreState>;
        const merged = {
          ...currentState,
          ...typedPersistedState,
          apikeys:
            typedPersistedState.apikeys?.map((key) => ({
              ...key,
              status: 'pending',
            })) ?? [],
        } as StoreState;

        // Migrate outputOptions from legacy shapes without using `any`
        const isRecord = (v: unknown): v is Record<string, unknown> =>
          typeof v === 'object' && v !== null;

        // Safely read possible persisted outputOptions of unknown shape
        const poUnknown: unknown =
          isRecord(typedPersistedState) &&
          'outputOptions' in typedPersistedState
            ? (typedPersistedState as Record<string, unknown>).outputOptions
            : undefined;

        if (isRecord(poUnknown)) {
          const next = { ...merged.outputOptions };

          // voice passthrough (if valid string)
          if (typeof poUnknown.voice === 'string') {
            next.voice = poUnknown.voice as OutputVoice;
          }

          // style migration: string -> object, or object missing instruction
          const styleVal = poUnknown.style;
          if (typeof styleVal === 'string') {
            const found: OutputStyle =
              OUTPUT_STYLES.find((s) => s.name === styleVal) ??
              OUTPUT_STYLES[0];
            next.style = found;
          } else if (isRecord(styleVal)) {
            const name = typeof styleVal.name === 'string' ? styleVal.name : '';
            const hasInstruction =
              typeof (styleVal as { instruction?: unknown }).instruction ===
              'string';
            if (name && !hasInstruction) {
              const found: OutputStyle =
                OUTPUT_STYLES.find((s) => s.name === name) ?? OUTPUT_STYLES[0];
              next.style = found;
            }
          }

          // level migration: string -> object, or object missing wordFreq
          const levelVal = poUnknown.level;
          if (typeof levelVal === 'string') {
            const found: OutputLevel =
              OUTPUT_LEVELS.find((l) => l.level === levelVal) ??
              OUTPUT_LEVELS[0];
            next.level = found;
          } else if (isRecord(levelVal)) {
            const lvl =
              typeof levelVal.level === 'string' ? levelVal.level : '';
            const hasWordFreq =
              typeof (levelVal as { wordFreq?: unknown }).wordFreq === 'number';
            if (lvl && !hasWordFreq) {
              const found: OutputLevel =
                OUTPUT_LEVELS.find((l) => l.level === lvl) ?? OUTPUT_LEVELS[0];
              next.level = found;
            }
          }

          merged.outputOptions = next;
        }

        return merged;
      },
    }
  )
);
