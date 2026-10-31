import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
].filter(Boolean);

async function test() {
  for (const model of new Set(GEMINI_MODELS)) {
    console.log("Trying model:", model);
    try {
      const response = await ai.models.generateContent({
        model: model as string,
        contents: "Hello",
      });
      console.log("Success with", model);
      return;
    } catch (err: any) {
      console.log("Failed with", model, ":", err.message);
    }
  }
}
test();
