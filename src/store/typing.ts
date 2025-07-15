import type { ApiKey } from "~/typings";

export type ConfigSlice = {
  activeApiKeyId: string;
  apikeys: ApiKey[];
  currentStep: 0 | 1 | 2 | 3;
  uploadContentType: "audioVideo" | "text";
  content: string;
  simplifiedContent?: string;
  selectApiKey: (id: string) => void;
  addApiKey: (label: string, value: string) => string;
  removeApiKey: (id: string) => void;
  updateApiKey: (key: ApiKey) => void;
  updateCurrentStep: () => void;
  updateUploadContentType: (type: "audioVideo" | "text") => void;
  updateApiKeyStatus: (
    id: string,
    status: "valid" | "invalid" | "pending",
  ) => void;
  setContent: (content: string) => void;
  setSimplifiedContent: (content: string) => void;
};

export type StoreState = ConfigSlice;
