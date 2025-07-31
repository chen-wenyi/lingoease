import { put } from "@vercel/blob";

import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const { url } = await put(file.name, file, {
    access: "public",
    allowOverwrite: true,
  });
  return Response.json({ url });
}
