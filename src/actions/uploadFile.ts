"use server";

import { put } from "@vercel/blob";

export async function uploadFile(file: File): Promise<string> {
  const { url } = await put(`uploaded_audio_video/${file.name}`, file, {
    access: "public",
    allowOverwrite: true,
  });
  return url;
}
