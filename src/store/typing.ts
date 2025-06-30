import type { ApiKey } from "~/typings";

export type ConfigSlice = {
  activeApiKeyId: string;
  apikeys: ApiKey[];
  selectApiKey: (id: string) => void;
  addApiKey: (label: string, value: string) => string;
  removeApiKey: (id: string) => void;
  updateApiKey: (id: string, label: string, value: string) => void;
};

export type StoreState = ConfigSlice;
