import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = "nodejs";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Cache prompts
const systemPromptCache = new Map();
function getSystemPrompt(role, level, profile) {
  const key = `${role}-${level}-${!!profile}`;
  if (systemPromptCache.has(key)) return systemPromptCache.get(key);

  const prompt =
    (role === "teacher" ? TEACHER_PROMPT : BASE_STUDENT_PROMPT) +
    (SOCRATIC_LEVELS[level] || SOCRATIC_LEVELS[2]) +
    (profile || "");

  systemPromptCache.set(key, prompt);
  return prompt;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY)
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });

    const { message, userRole, messageHistory = [], userId, socraticLevel = 2 } =
      await req.json();

    // reduce history for speed
    const limitedHistory = messageHistory.slice(-1);

    // TODO: Cache this or move out of route
    const profileSummary = userId
      ? await generateProfileSummaryForPrompt(userId)
      : "";

    const systemMessage = getSystemPrompt(userRole, socraticLevel, profileSummary);

    const messages = [
      { role: "system", content: systemMessage },
      ...limitedHistory,
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const token = chunk.choices?.[0]?.delta?.content || "";
          controller.enqueue(encoder.encode(token));
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

