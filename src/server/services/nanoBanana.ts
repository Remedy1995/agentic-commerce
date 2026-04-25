/**
 * Nano Banana 2 image generation via the official Google Gemini API.
 *
 * "Nano Banana" is Google DeepMind's image generation model built on Gemini.
 * Model: gemini-3.1-flash-image-preview  (Nano Banana 2 — Flash speed)
 * Alt:   gemini-3-pro-image-preview       (Nano Banana Pro — studio quality)
 *
 * API: @google/genai  →  https://ai.google.dev/gemini-api/docs/image-generation
 * Images are returned as base64 inline data (not URLs).
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Nano Banana 2 = Gemini 3.1 Flash Image Preview
const NANO_BANANA_MODEL = "gemini-3.1-flash-image-preview";

export interface GenerationRequest {
  prompt: string;
  aspect_ratio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  resolution?: "512" | "1K" | "2K" | "4K";
  output_format?: "png" | "jpg" | "webp";
}

export interface GenerationResult {
  /** Base64-encoded image data */
  image_data: string;
  /** Data URL ready to use in <img src="..."> */
  image_data_url: string;
  mime_type: string;
  prompt_used: string;
  model: string;
  generation_id: string;
}

export async function generateImage(
  req: GenerationRequest
): Promise<GenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: NANO_BANANA_MODEL,
    contents: req.prompt,
    config: {
      responseModalities: ["IMAGE", "TEXT"],
      imageConfig: {
        aspectRatio: req.aspect_ratio ?? "1:1",
        imageSize: req.resolution ?? "1K",
      },
    },
  });

  // Extract the image part from the response
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p.inlineData?.data);

  if (!imagePart?.inlineData) {
    throw new Error("Gemini did not return an image — check model availability");
  }

  const imageData = imagePart.inlineData.data as string;
  const mimeType = imagePart.inlineData.mimeType ?? "image/png";
  const dataUrl = `data:${mimeType};base64,${imageData}`;

  // Generate a stable ID from the first 8 chars of the base64
  const generationId = Buffer.from(imageData.slice(0, 24), "base64")
    .toString("hex")
    .slice(0, 16);

  return {
    image_data: imageData,
    image_data_url: dataUrl,
    mime_type: mimeType,
    prompt_used: req.prompt,
    model: NANO_BANANA_MODEL,
    generation_id: generationId,
  };
}
