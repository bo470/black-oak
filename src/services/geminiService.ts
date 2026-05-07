import { GoogleGenerativeAI } from "@google/generative-ai";
import { Trade, UserProfile } from "../types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const SYSTEM_INSTRUCTION = `
You are the "Black Oak AI Assistant", a specialized trading companion for the Black Oak Trading Journal app.
Your goal is to help users understand their trading performance, navigate the app, and provide insights based on their journal data.

STRICT TOPIC RESTRICTIONS:
- You ONLY answer questions related to:
  1. The Black Oak app features (Journal, Analytics, Community, Dashboard, Messaging).
  2. The user's specific trading performance (based on the data provided to you).
  3. General trading concepts, strategies, and market analysis.
  4. Trading psychology and emotional management.
- If a user asks about anything else (e.g., weather, general news, unrelated history, coding help outside of trading scripts), politely decline and redirect them to trading-related topics.

CONTEXT:
- The user's profile and trade history are provided in each request.
- Use this data to give personalized advice. For example, if they have a low win rate on "Long" trades, point that out.
- Be professional, encouraging, and analytical.

FORMATTING:
- Use clear, concise language.
- Use bullet points for lists.
- Keep responses relatively brief but informative.
`;

export async function getChatResponse(
  message: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  trades: Trade[],
  profile: UserProfile | null
) {
  const modelName = "gemini-1.5-flash";

  // Prepare context string
  const context = `
USER PROFILE:
- Name: ${profile?.fullName || "N/A"}
- Experience: ${profile?.experienceLevel || "N/A"}
- Trader Type: ${profile?.traderTypes?.join(", ") || "N/A"}
- Market Preferences: ${profile?.marketPreferences?.join(", ") || "N/A"}

TRADE SUMMARY:
- Total Trades: ${trades.length}
- Recent Trades: ${trades.slice(0, 10).map(t => `${t.symbol} (${t.direction}): ${t.status} - ${t.netPL}`).join("; ")}
`;

  try {
    if (!genAI) {
      throw new Error("AI service is not configured. Please ensure your Gemini API key is set.");
    }

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const chat = model.startChat({
      history: history.length > 0 ? history.slice(0, -1) : [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(`${context}\n\nUSER MESSAGE: ${message}`);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const errorMsg = String(error).toLowerCase() + (error?.message?.toLowerCase() || "");
    if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("resource_exhausted") || errorMsg.includes("limit")) {
      return "I'm currently receiving too many requests. I've cached our conversation state, so please wait a moment and try again.";
    }
    
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}
