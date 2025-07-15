"use server";

import axios from "axios";
import { cookies } from "next/headers";

interface SimplifyResponse {
  answer: string;
}

export async function simplify(text: string): Promise<string> {
  const apikey = (await cookies()).get("api-key")?.value;

  if (!apikey) {
    throw new Error("Cannot get API key");
  }

  const response = await axios.get<SimplifyResponse>(
    `https://lingoease-api.onrender.com/simplify`,
    {
      params: { text },
      headers: {
        "x-api-key": apikey,
      },
    },
  );

  if (!response.data) {
    throw new Error("Failed to simplify text");
  }

  return response.data.answer;
}
