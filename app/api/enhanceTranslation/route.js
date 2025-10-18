// app/api/enhanceTranslation/route.js
import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req) {
  try {
    const { language, text, bookName, chapterTitle } = await req.json();

    if (!text || !language)
      return NextResponse.json({ error: "Missing text or language" }, { status: 400 });

    const prompt = `
You are a native-level storyteller and language expert.
Your task: rewrite the given text in ${language} to make it more fun, emotionally engaging, and easy to read.
Keep the full context and meaning intact.
Add one or two short examples or idioms that local readers of ${language} can relate to naturally.

Book: ${bookName}
Chapter: ${chapterTitle}

Text to enhance:
"""${text}"""
`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a creative writer and cultural storyteller." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      }),
    });

    const data = await res.json();
    const enhanced =
      data.choices?.[0]?.message?.content?.trim() ||
      "Enhancement failed, please try again.";

    return NextResponse.json({ enhanced });
  } catch (err) {
    console.error("Enhance API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
