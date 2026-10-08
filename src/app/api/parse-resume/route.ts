import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { auth } from '@/lib/auth';
import { aiQuotaExceededResponse, aiServiceUnavailableResponse } from '@/lib/api/ai-usage-response';
import {
  checkAiBurstLimit,
  completeAiUsage,
  isAiProviderCapacityError,
  markAiServiceUnavailable,
  startAiUsage,
} from '@/lib/ai-usage';

export async function POST(req: Request) {
  const requestStartedAt = Date.now();
  let usageEventId: string | undefined;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();

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

    const burstLimit = checkAiBurstLimit(session.user.id, 'resume_import');
    if (!burstLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many AI requests. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(burstLimit.retryAfterSeconds) } }
      );
    }

    const usage = await startAiUsage(session.user.id, 'resume_import', text.length);
    if (!usage.allowed) {
      if (usage.reason === 'service_unavailable') {
        return aiServiceUnavailableResponse(usage.resetsAt);
      }
      return aiQuotaExceededResponse(usage.limit, usage.resetsAt);
    }
    usageEventId = usage.eventId;

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    You are an expert resume parser. I will provide you with the raw extracted text from a PDF resume.
    Your job is to extract the candidate's details and map them strictly to the following structure.
    CRITICAL INSTRUCTIONS:
    - You must extract the candidate's Email, GitHub, and LinkedIn URLs.
    - PDFs often have embedded links appended at the bottom as [Embedded Links: ...].
    - FIRST, identify any GitHub or LinkedIn URLs from this list and assign them to the root github/linkedin fields.
    - THEN, any remaining embedded links are almost certainly Project URLs. Do NOT ignore them!
    - You MUST assign these remaining URLs to the projects you found based on their order or context.
    - Even if the URL domain (e.g., vercel.app, custom names) does not match the project title, assign it to a project.
    - Return ONLY valid JSON.
    `;

    const generateConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The candidate's full name" },
          bio: { type: Type.STRING, description: "A short professional summary or objective" },
          email: { type: Type.STRING, description: "The candidate's email address" },
          github: { type: Type.STRING, description: "The candidate's GitHub URL" },
          linkedin: { type: Type.STRING, description: "The candidate's LinkedIn URL" },
          skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of skills, technologies, and tools" },
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Project title" },
                description: { type: Type.STRING, description: "Project description" },
                link: { type: Type.STRING, description: "Project URL if available" },
              },
              required: ["title", "description"],
            },
          },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING, description: "Company name" },
                role: { type: Type.STRING, description: "Job title or role" },
                years: { type: Type.STRING, description: "Duration" },
                description: { type: Type.STRING, description: "Key achievements" },
              },
              required: ["company", "role", "years", "description"],
            },
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                school: { type: Type.STRING, description: "University name" },
                degree: { type: Type.STRING, description: "Degree obtained" },
                year: { type: Type.STRING, description: "Graduation year" },
                grade: { type: Type.STRING, description: "GPA (optional)" },
              },
              required: ["school", "degree", "year"],
            },
          },
        },
        required: ["name", "skills", "experience"],
      },
    };

    const fallbackModels = [
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ];
    let responseText = null;
    let lastError = null;
    let providerCapacityExceeded = false;

    for (const model of fallbackModels) {
      try {
        console.log(`[Parser] Attempting extraction with model: ${model}`);
        const response = await Promise.race([
          ai.models.generateContent({
            model: model,
            contents: [prompt, text],
            config: generateConfig as any,
          }),
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error(`Model ${model} timed out after 15 seconds`)), 15000)
          )
        ]);

        if (response?.text) {
          responseText = response.text;
          console.log(`[Parser] Success using model: ${model}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[Parser] Model ${model} failed:`, err.message);
        providerCapacityExceeded ||= isAiProviderCapacityError(err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw providerCapacityExceeded
        ? new Error("AI provider quota exceeded")
        : lastError || new Error("All fallback models failed to generate content");
    }

    const parsedData = JSON.parse(responseText);

    await completeAiUsage(
      usageEventId,
      'succeeded',
      Date.now() - requestStartedAt,
      responseText.length
    );

    return NextResponse.json({
      data: parsedData,
      aiUsage: { remaining: usage.remaining, limit: usage.limit },
      aiService: usage.service,
    });
  } catch (error: any) {
    if (usageEventId) {
      await completeAiUsage(usageEventId, 'failed', Date.now() - requestStartedAt);
    }
    console.error('Error parsing resume:', error);
    if (isAiProviderCapacityError(error)) {
      const service = await markAiServiceUnavailable();
      return aiServiceUnavailableResponse(service.resetsAt);
    }
    return NextResponse.json(
      { error: 'Unable to import this resume right now. Please try again.' },
      { status: 500 }
    );
  }
}
