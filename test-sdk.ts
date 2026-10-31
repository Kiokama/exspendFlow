import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: "hello",
  });
  console.log("type of text:", typeof response.text);
  console.log("text:", response.text);
}
run();
