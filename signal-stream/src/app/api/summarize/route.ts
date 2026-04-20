import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

export async function POST(request: Request) {
  if (!groq) {
    return NextResponse.json(
      { error: "GROQ_API_KEY not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { title, excerpt, url } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Missing title field." },
        { status: 400 }
      );
    }

    const prompt = `You are a senior intelligence analyst. Given the following news article title and excerpt, produce a concise 3-4 sentence briefing that:
1. Summarizes the core news/development
2. Explains why it matters (impact)
3. Identifies who or what is affected

Title: "${title}"
Excerpt: "${excerpt || 'No excerpt available.'}"
${url ? `Source URL: ${url}` : ""}

Write the briefing in a professional, direct tone. Do NOT use bullet points. Do NOT add any preamble like "Here is..." — jump straight into the analysis.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 250,
    });

    const summary =
      completion.choices[0]?.message?.content?.trim() ||
      "Unable to generate summary.";

    return NextResponse.json({ summary });
  } catch (err: any) {
    console.error("[SUMMARIZE API ERROR]", err);
    return NextResponse.json(
      { error: "Failed to generate summary." },
      { status: 500 }
    );
  }
}
