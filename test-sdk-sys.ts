import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: [
      {
        text: "Say hi in Vietnamese",
      }
    ],
    config: {
        systemInstruction: "You are a robot. End every sentence with BEEP.",
        responseMimeType: "application/json"
    }
  });
  console.log("text:", response.text);
}
run().catch(e => console.error(e));
