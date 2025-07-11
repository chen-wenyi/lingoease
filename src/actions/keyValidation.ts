"use server";

import OpenAI, { APIError } from "openai";

export async function validateOpenAIAPIKey(apiKey: string) {
  const client = new OpenAI({ apiKey });
  try {
    const models = await client.models.list();
    return models.data.length > 0;
  } catch (error) {
    console.error("OpenAI API error:", error);
    if (error instanceof APIError) {
      console.error("OpenAI API error:", error.message);
    } else if (error instanceof Error) {
      // Handle other types of errors
      console.error("Error:", error.message);
    } else {
      // Handle unknown error types
      console.error("Unknown error:", error);
    }
    return false;
  }
}
