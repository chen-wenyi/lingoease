import type { ApiKey } from '@/typings';

type SimplificationProgressMessage =
  | 'Extracting the scripts from audio...'
  | 'Segmenting the scripts...'
  | 'Analyzing the scripts...'
  | 'Simplifying the scripts...'
  | 'Generating audio...'
  | '';

export type ConfigSlice = {
  activeApiKeyId: string;
  apikeys: ApiKey[];
  currentStep: 0 | 1 | 2 | 3;
  uploadContentType: 'audioVideo' | 'text';
  content: string;
  file: File | null;
  fileUrl: string;
  outputOptions: OutputOptions;
  simplificationProgress: {
    message: SimplificationProgressMessage;
    number: number;
  };

  originalChunks: { text: string; newWords: string[] }[];
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
  setSimplificationProgress: (message: SimplificationProgressMessage) => void;
  setOriginalChunks: (chunks: { text: string; newWords: string[] }[]) => void;
  setOutputOptions: (opts: Partial<OutputOptions>) => void;
};

export type StoreState = ConfigSlice;

// Output options used for audio generation and guidance
// Output level object with explicit vocabulary frequency
export const OUTPUT_LEVELS = [
  { level: 'Beginner', wordFreq: 500 },
  { level: 'Elementary', wordFreq: 1000 },
] as const;
export type OutputLevel = (typeof OUTPUT_LEVELS)[number];

// Centralized voice options
export const OUTPUT_VOICES = [
  'alloy',
  'ash',
  'ballad',
  'coral',
  'echo',
  'sage',
  'shimmer',
  'verse',
] as const;
export type OutputVoice = (typeof OUTPUT_VOICES)[number];

// Centralized style options with instructions
export const OUTPUT_STYLES = [
  {
    name: 'Teacher',
    instruction:
      'Speak like a patient English teacher: clear pronunciation, slightly slower than normal, with gentle pauses between phrases and emphasis on key vocabulary.',
  },
  {
    name: 'Pronunciation Coach',
    instruction:
      'Speak like a pronunciation coach: slow and deliberate, with exaggerated clarity on vowel and consonant sounds, pausing briefly after each sentence.',
  },
  {
    name: 'Audiobook',
    instruction:
      'Speak like an audiobook narrator for beginners: warm and engaging, slightly slower than conversational pace, with natural rhythm and clear emphasis on sentence structure.',
  },
] as const;
export type OutputStyle = (typeof OUTPUT_STYLES)[number];

export type OutputOptions = {
  level: OutputLevel;
  voice: OutputVoice;
  style: OutputStyle;
};
