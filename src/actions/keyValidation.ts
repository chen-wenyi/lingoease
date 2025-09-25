'use server';

import { getProviderFromApiKey } from '@/lib/utils';
import { GoogleGenAI } from '@google/genai';
import OpenAI, { APIError } from 'openai';

export async function validateAPIKey(apiKey: string) {
  const provider = getProviderFromApiKey(apiKey);

  if (provider === 'google') {
    const client = new GoogleGenAI({ apiKey });
    try {
      const { text } = await client.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: 'Explain how AI works in a few words',
      });
      if (text && text.length > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Google API error:', error);
      if (error instanceof Error) {
        // Handle other types of errors
        console.error('Error:', error.message);
      } else {
        // Handle unknown error types
        console.error('Unknown error:', error);
      }
      return false;
    }
  } else if (provider === 'openai') {
    const client = new OpenAI({ apiKey });
    try {
      const models = await client.models.list();
      return models.data.length > 0;
    } catch (error) {
      console.error('OpenAI API error:', error);
      if (error instanceof APIError) {
        console.error('OpenAI API error:', error.message);
      } else if (error instanceof Error) {
        // Handle other types of errors
        console.error('Error:', error.message);
      } else {
        // Handle unknown error types
        console.error('Unknown error:', error);
      }
      return false;
    }
  }
  return false;
}
