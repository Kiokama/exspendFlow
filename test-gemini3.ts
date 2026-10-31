import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelsToTest = [
  "gemini-2.5-pro",
  "gemini-1.5-pro",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash-lite",
  "gemini-2.0-pro-exp",
];

async function test() {
  for (const model of modelsToTest) {
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
