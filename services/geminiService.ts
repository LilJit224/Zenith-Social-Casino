
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getGameCommentary = async (
  game: 'plinko' | 'mines',
  outcome: 'win' | 'loss',
  amount: number,
  balance: number
) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a charismatic, slightly sarcastic high-stakes casino host named 'The Dealer'.
      A player just ${outcome} ${amount} coins playing ${game}. 
      Their current balance is ${balance}.
      Give a one-sentence, punchy commentary on their performance.`,
      config: {
        temperature: 0.8,
        maxOutputTokens: 60,
      }
    });
    return response.text || "Place your bets, folks.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return outcome === 'win' ? "Impressive streak! Keep it up." : "Better luck next time, champ.";
  }
};
