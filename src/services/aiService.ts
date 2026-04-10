import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askAura(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are AURA Intelligence, a futuristic AI assistant integrated into a high-tech video calling platform. Your tone is professional, helpful, and slightly cybernetic. Keep responses concise and relevant to a video call context.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "I'm sorry, I'm having trouble connecting to my neural network right now.";
  }
}

export async function generateAuraVoice(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Error generating voice:", error);
    return null;
  }
}
