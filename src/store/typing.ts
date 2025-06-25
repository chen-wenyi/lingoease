type ApiKey = {
  id: string;
  label: string;
  value: string;
};

export type ConfigSlice = {
  activeApiKeyId: string;
  apikeys: ApiKey[];
  addApiKey: (label: string, value: string) => void;
};

export type StoreState = ConfigSlice;
