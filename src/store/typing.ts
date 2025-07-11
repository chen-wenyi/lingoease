import type { ApiKey } from "~/typings";

export type ConfigSlice = {
  activeApiKeyId: string;
  apikeys: ApiKey[];
  currentStep: 0 | 1 | 2 | 3;
  uploadContentType: "audioVideo" | "text";
  selectApiKey: (id: string) => void;
  addApiKey: (label: string, value: string) => string;
  removeApiKey: (id: string) => void;
  updateApiKey: (id: string, label: string, value: string) => void;
  updateCurrentStep: (step: 0 | 1 | 2 | 3) => void;
  updateUploadContentType: (type: "audioVideo" | "text") => void;
};

export type StoreState = ConfigSlice;
