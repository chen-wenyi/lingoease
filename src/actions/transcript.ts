"use server";

import axios from "axios";
import { cookies } from "next/headers";

const API_URL = "https://lingoease-api.onrender.com/transcript/stream";

interface TranscriptResponse {
  output: string;
}

export async function transcript(file: File): Promise<string> {
  const apikey = (await cookies()).get("api-key")?.value;

  if (!apikey) {
    throw new Error("Cannot get API key");
  }

  const response = await axios.post<TranscriptResponse>(API_URL, file, {
    headers: {
      "x-api-key": apikey,
      "X-Filename": file.name,
      "Content-Type": "application/octet-stream",
    },
  });

  if (!response.data) {
    throw new Error("Failed to transcribe audio/video");
  }

  return response.data.output;
}
