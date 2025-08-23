import type { ApiKey } from '@/typings';

export type ConfigSlice = {
  activeApiKeyId: string;
  apikeys: ApiKey[];
  currentStep: 0 | 1 | 2 | 3;
  uploadContentType: 'audioVideo' | 'text';
  content: string;
  file: File | null;
  fileUrl: string;
  wordFreq: 500 | 1000;
  simplifiedResult: {
    audioFileUrl: string;
    audioDownloadUrl: string;
    simplifiedText: { text: string; newWords: string[] }[];
    totalLemmasCount: number;
    totalNewWordsCount: number;
    newWordsRate: string;
  } | null;
  selectApiKey: (id: string) => void;
  addApiKey: (label: string, value: string) => string;
  removeApiKey: (id: string) => void;
  updateApiKey: (key: ApiKey) => void;
  updateCurrentStep: () => void;
  updateUploadContentType: (type: 'audioVideo' | 'text') => void;
  updateApiKeyStatus: (
    id: string,
    status: 'valid' | 'invalid' | 'pending'
  ) => void;
  setContent: (content: string) => void;
  setFile: (file: File | null) => void;
  setFileUrl: (url: string) => void;
  setSimplifiedResult: ({
    url,
    downloadUrl,
    simplifiedText,
  }: {
    url: string;
    downloadUrl: string;
    simplifiedText: {
      text: string;
      newWords: string[];
    }[];
    totalLemmasCount: number;
    totalNewWordsCount: number;
    newWordsRate: string;
  }) => void;
  resetAll: () => void;
};

export type StoreState = ConfigSlice;
