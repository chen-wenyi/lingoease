export type ApiKey = {
  id: string;
  label: string;
  value: string;
  status: "valid" | "invalid" | "pending";
};
