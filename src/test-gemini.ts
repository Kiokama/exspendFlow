import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const modelsToTest = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash"
  ];

  for (const model of modelsToTest) {
    try {
      console.log(`Testing model: ${model}...`);
      const res = await ai.models.generateContent({
        model,
        contents: "Hello"
      });
      console.log(` SUCCESS [${model}]:`, res.text ? res.text.trim() : "Empty response");
      return model;
    } catch (err: any) {
      console.error(` FAILED [${model}]:`, err.message.substring(0, 150));
    }
  }
}

testModels();
