"use server";

import OpenAI, { OpenAIError } from "openai";

export async function getOpenAIResponse(apiKey: string) {
  const client = new OpenAI({ apiKey });
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "user",
          content: "Write a one-sentence bedtime story about a unicorn.",
        },
      ],
    });
    if (!completion.choices || completion.choices.length === 0) {
      throw new Error("No choices returned from OpenAI API");
    } else {
      return completion.choices[0]?.message.content ?? "No content returned";
    }
  } catch (error) {
    if (error instanceof OpenAIError) {
      console.error("OpenAI API error:", error.message);
      return error.message;
    }
    throw error; // Re-throw other errors
  }
}
