"use server";

import OpenAI, { APIError } from "openai";

type ChatCompletionResponse = {
  content: string;
  errMessage?: string;
};

export async function getChatCompletion(
  apiKey: string,
): Promise<ChatCompletionResponse> {
  const client = new OpenAI({ apiKey });
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "user",
          content: "Write a 100 words bedtime story about a unicorn.",
        },
      ],
    });
    if (!completion.choices || completion.choices.length === 0) {
      throw new Error("No choices returned from OpenAI API");
    } else {
      return {
        content:
          completion.choices[0]?.message.content ?? "No content returned",
      };
    }
  } catch (error) {
    if (error instanceof APIError) {
      console.error("OpenAI API error:", error.message);
      return {
        errMessage: error.message ?? "An OpenAI API error occurred",
        content: "",
      };
    }

    // Handle other types of errors
    if (error instanceof Error) {
      console.error("Error:", error.message);
      return {
        errMessage: error.message,
        content: "",
      };
    }

    // Handle unknown error types
    console.error("Unknown error:", error);
    return {
      errMessage: "An unexpected error occurred",
      content: "",
    };
  }
}
