import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { auth } from '@/lib/auth';
import { captureException } from '@/lib/error-logger';
import { aiQuotaExceededResponse, aiServiceUnavailableResponse } from '@/lib/api/ai-usage-response';
import {
  checkAiBurstLimit,
  completeAiUsage,
  isAiProviderCapacityError,
  markAiServiceUnavailable,
  startAiUsage,
  reserveAiProviderAttempt,
  getAiServiceAvailability,
  isAiProviderBusyError,
  refundFailedAiUsage,
} from '@/lib/ai-usage';

export async function POST(req: Request) {
  const requestStartedAt = Date.now();
  let usageEventId: string | undefined;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const burstLimit = checkAiBurstLimit(session.user.id, 'text_replacement');
    if (!burstLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many AI requests. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(burstLimit.retryAfterSeconds) } }
      );
    }

    const usage = await startAiUsage(session.user.id, 'text_replacement', text.length);
    if (!usage.allowed) {
      if (usage.reason === 'service_unavailable') {
        return aiServiceUnavailableResponse(usage.resetsAt, usage.service.reason);
      }
      return aiQuotaExceededResponse(usage.limit, usage.resetsAt);
    }
    usageEventId = usage.eventId;

    // All retries are explicit and budgeted; disable the SDK's hidden retries.
    const ai = new GoogleGenAI({ apiKey, httpOptions: { retryOptions: { attempts: 1 }, timeout: 10000 } });

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

    for (const [attemptIndex, model] of fallbackModels.entries()) {
      if (attemptIndex > 0 && !(await reserveAiProviderAttempt())) {
        throw new Error("AI provider quota exceeded");
      }
      try {
        console.log(`[Enhancer] Attempting enhancement with model: ${model}`);
        
        const response = await Promise.race([
          ai.models.generateContent({
            model: model,
            contents: prompt,
            config: generateConfig as any,
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout after 10000ms using ${model}`)), 10000)
          )
        ]) as any;

        if (response && response.text) {
          responseText = response.text;
          console.log(`[Enhancer] Success with ${model}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[Enhancer] Model ${model} failed:`, err.message || err);
        providerCapacityExceeded ||= isAiProviderCapacityError(err);
        if (providerCapacityExceeded || isAiProviderBusyError(err)) throw err;
        lastError = err;
      }
    }

    if (!responseText) {
      throw providerCapacityExceeded
        ? new Error("AI provider quota exceeded")
        : lastError || new Error("All fallback models failed to enhance text");
    }

    const enhancedText = responseText.trim();
    await completeAiUsage(
      usageEventId,
      'succeeded',
      Date.now() - requestStartedAt,
      enhancedText.length
    );

    return NextResponse.json({
      enhancedText,
      aiUsage: { remaining: usage.remaining, limit: usage.limit },
      aiService: await getAiServiceAvailability(),
    });

  } catch (error: any) {
    if (usageEventId) {
      await refundFailedAiUsage(usageEventId, Date.now() - requestStartedAt).catch(() => {
        captureException(new Error('AI quota refund failed'), { tags: { feature: 'enhance-text', stage: 'refund' } });
      });
    }
    if (isAiProviderBusyError(error)) {
      const service = await markAiServiceUnavailable(true);
      return aiServiceUnavailableResponse(service.resetsAt, service.reason);
    }
    if (isAiProviderCapacityError(error)) {
      const service = await markAiServiceUnavailable();
      return aiServiceUnavailableResponse(service.resetsAt, service.reason);
    }
    captureException(new Error('Unexpected text enhancement failure'), { tags: { feature: 'text_replacement', stage: 'provider_or_processing' } });
    return NextResponse.json(
      { error: 'Unable to enhance text right now. Please try again.' },
      { status: 500 }
    );
  }
}
