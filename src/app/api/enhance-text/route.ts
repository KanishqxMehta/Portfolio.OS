import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { text, type } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing GEMINI_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const contextStr = type === 'experience' 
      ? 'professional experience bullet point or paragraph'
      : 'project description';

    const prompt = `
    You are an expert resume writer and career coach. Your goal is to rewrite the following ${contextStr} to be highly professional, impactful, and optimized for Applicant Tracking Systems (ATS).

    CRITICAL INSTRUCTIONS:
    1. Use strong action verbs.
    2. Focus on achievements, metrics, and impact if they are implied, or leave room for them.
    3. Remove fluff, passive voice, and weak phrasing (e.g., "I did", "Responsible for").
    4. Keep it concise but powerful.
    5. RETURN ONLY THE REWRITTEN TEXT. Do not include quotes, markdown formatting, prefixes like "Here is the rewritten text:", or any other conversational filler. Just the raw text.

    Original Text:
    ${text}
    `;

    const generateConfig = {
      responseMimeType: 'text/plain',
    };

    const fallbackModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash', 'gemini-3.1-flash-lite', 'gemini-1.5-flash'];
    let responseText = null;
    let lastError = null;

    for (const model of fallbackModels) {
      try {
        console.log(`[Enhancer] Attempting enhancement with model: ${model}`);
        
        const response = await Promise.race([
          ai.models.generateContent({
            model: model,
            contents: prompt,
            config: generateConfig as any,
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout after 8000ms using ${model}`)), 8000)
          )
        ]) as any;

        if (response && response.text) {
          responseText = response.text;
          console.log(`[Enhancer] Success with ${model}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[Enhancer] Model ${model} failed:`, err.message || err);
        lastError = err;
      }
    }

    if (!responseText) {
      console.error("[Enhancer] All models in the fallback cascade failed.");
      return NextResponse.json(
        { error: 'Failed to enhance text. All AI models timed out or failed.', details: lastError?.message },
        { status: 503 }
      );
    }

    return NextResponse.json({ enhancedText: responseText.trim() });

  } catch (error: any) {
    console.error('Enhance API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while enhancing text', details: error.message },
      { status: 500 }
    );
  }
}
