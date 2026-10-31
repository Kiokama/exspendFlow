import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  const model = "gemini-1.5-flash-latest";
  console.log("Trying model:", model);
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: "Hello",
    });
    console.log("Success with", model, response.text);
  } catch (err: any) {
    console.log("Failed with", model, ":", err.message);
  }
}
test();
