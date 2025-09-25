import { v4 as uuidv4 } from 'uuid';
import type { StateCreator } from 'zustand';
import type { ConfigSlice, OutputOptions, StoreState } from './typing';
import { OUTPUT_STYLES } from './typing';

export const createConfigSlice: StateCreator<
  StoreState,
  [['zustand/immer', never]],
  [],
  ConfigSlice
> = (set) => ({
  development: false,
  setDevelopment: (dev) => {
    set((state) => {
      state.development = dev;
    });
  },
  activeApiKeyId: '',
  apikeys: [],
  currentStep: 0,
  uploadContentType: 'audioVideo',
  content: '',
  file: null,
  fileUrl: '',
  outputOptions: {
    level: { level: 'Beginner', wordFreq: 500 },
    voice: 'alloy',
    style: OUTPUT_STYLES[0],
  } satisfies OutputOptions,
  contextWindowSize: 1,
  selectedModel: '',
  setSelectedModel: (model) => {
    set((state) => {
      state.selectedModel = model;
    });
  },
  setContextWindowSize: (size) => {
    set((state) => {
      state.contextWindowSize = size;
    });
  },
  originalChunks: [],
  simplifiedResult: null,
  simplificationProgress: {
    message: '',
    number: 0,
  },
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
        status: 'valid',
      });
    });
    return id;
  },
  removeApiKey: (id) => {
    set((state) => {
      state.apikeys = state.apikeys.filter((key) => key.id !== id);
      if (state.activeApiKeyId === id) {
        state.activeApiKeyId = '';
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
        (key) => key.id === state.activeApiKeyId
      );
      if (activeApiKey?.status === 'valid') {
        if (state.content || state.file) {
          state.currentStep = 2;
          if (state.simplifiedResult?.audioFileUrl) {
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
        state.simplifiedResult = null;
      }
      state.content = content;
    });
  },
  setFile: (file) => {
    set((state) => {
      state.file = file;
    });
  },
  setFileUrl: (url) => {
    set((state) => {
      state.fileUrl = url;
    });
  },
  setSimplifiedResult: ({
    url,
    downloadUrl,
    simplifiedText,
    totalLemmasCount,
    totalNewWordsCount,
    newWordsRate,
  }) => {
    set((state) => {
      state.simplifiedResult = {
        audioFileUrl: url,
        audioDownloadUrl: downloadUrl,
        simplifiedText,
        totalLemmasCount,
        totalNewWordsCount,
        newWordsRate,
      };
    });
  },
  resetAll: () => {
    set((state) => {
      state.currentStep = 1;
      state.content = '';
      state.file = null;
      state.fileUrl = '';
      state.simplifiedResult = null;
    });
  },
  setSimplificationProgress: (message) => {
    set((state) => {
      state.simplificationProgress.message = message;
      if (message === '') {
        state.simplificationProgress.number = 0;
      } else if (message === 'Extracting the scripts from audio...') {
        state.simplificationProgress.number = 33;
      } else if (message === 'Segmenting the scripts...') {
        state.simplificationProgress.number = 50;
      } else if (message === 'Analyzing the scripts...') {
        state.simplificationProgress.number = 66;
      } else if (message === 'Simplifying the scripts...') {
        state.simplificationProgress.number = 75;
      } else if (message === 'Generating audio...') {
        state.simplificationProgress.number = 95;
      }
    });
  },
  setOriginalChunks: (chunks) => {
    set((state) => {
      state.originalChunks = chunks;
    });
  },
  setOutputOptions: (opts) => {
    set((state) => {
      state.outputOptions = { ...state.outputOptions, ...opts };
    });
  },
});
