import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelsToTest = [
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
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
