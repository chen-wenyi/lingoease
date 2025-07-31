"use server";

import axios from "axios";
import { cookies } from "next/headers";

const API_URL = "https://lingoease-api.onrender.com/transcript";

interface TranscriptResponse {
  output: string;
}

export async function transcript(file: File): Promise<string> {
  const apikey = (await cookies()).get("api-key")?.value;

  if (!apikey) {
    throw new Error("Cannot get API key");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post<TranscriptResponse>(API_URL, formData, {
    headers: {
      "x-api-key": apikey,
      "Content-Type": "multipart/form-data",
    },
  });

  if (!response.data) {
    throw new Error("Failed to transcribe audio/video");
  }

  return response.data.output;
}
