"use server";

import axios from "axios";
import { cookies } from "next/headers";

const API_URL = "https://lingoease-api.onrender.com/transcript";

interface TranscriptResponse {
  output: string;
}

export async function transcript(fileUrl: string): Promise<string> {
  const apikey = (await cookies()).get("api-key")?.value;

  if (!apikey) {
    throw new Error("Cannot get API key");
  }

  const response = await axios.get<TranscriptResponse>(API_URL, {
    params: { fileUrl },
    headers: {
      "x-api-key": apikey,
    },
  });

  if (!response.data) {
    throw new Error("Failed to transcribe audio/video");
  }

  return response.data.output;
}
