import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function list() {
  try {
    const models = await ai.models.list();
    for await (const model of models) {
        console.log(model.name);
    }
  } catch (e: any) {
    console.error(e.message);
  }
}
list();
