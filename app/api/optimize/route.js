// app/api/optimize/route.js
import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) console.warn("⚠️ OPENAI_API_KEY not set in .env");

const MODEL = "gpt-4o-mini";
const MAX_CHUNK_SIZE = 12000;

/** Split text into smaller chunks while preserving paragraph boundaries */
function chunkText(text, size = MAX_CHUNK_SIZE) {
  if (text.length <= size) return [text];
  const paragraphs = text.split(/\n{2,}/);
  const chunks = [];
  let current = "";
  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > size) {
      if (current.trim()) chunks.push(current.trim());
      current = p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** Call OpenAI Chat API with enforced JSON output */
async function callOpenAI(messages) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 6000,
    }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "OpenAI API error");

  try {
    return JSON.parse(text).choices?.[0]?.message?.content ?? "";
  } catch {
    return text; // fallback to raw text
  }
}

/** Clean AI response in case JSON parsing fails */
function cleanJSON(aiText) {
  let cleaned = aiText.trim().replace(/```json|```/g, "").replace(/[“”]/g, '"');
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON object found in AI response");
  return JSON.parse(cleaned.slice(first, last + 1));
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { bookName, chapterTitle, chapterContent, targetLanguages = ["en"] } = body;

    if (!bookName || !chapterTitle || !chapterContent) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const chunks = chunkText(chapterContent);
    const optimizedParts = [];
    const translationsAccum = Object.fromEntries(targetLanguages.map(l => [l, []]));

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const userInstruction = `
You are a professional editor and translator specialized in converting text into engaging, spoken-style storytelling suitable for short video scripts.

Input metadata:
- bookName: ${bookName}
- chapterTitle: ${chapterTitle}
- chunkIndex: ${i + 1} of ${chunks.length}

Task:
1. Produce an optimized English version of the input chunk that keeps the story intact, shortens sentences, and sounds natural for speech.
2. Include one short example (1–2 sentences) clarifying a key idea or term.
3. For each target language in [${targetLanguages.join(", ")}], translate and localize the optimized version with a culturally relevant example.
4. Respond only in JSON exactly in this format:
{
  "optimized": "Optimized English text",
  "translations": [
    { "lang": "hi", "text": "Localized translation with example" },
    ...
  ]
}

Here is the chunk:
"""${chunk}"""
`;

      const messages = [
        {
          role: "system",
          content: `You are an expert editor and translator.
Output MUST be valid JSON only. Preserve all paragraphs, ideas, and details.
Do not omit or merge content. Rephrase for clarity if needed.
For translations, maintain full meaning and add at most one short localized example.`,
        },
        { role: "user", content: userInstruction },
      ];

      let aiText = await callOpenAI(messages);
      let parsed;
      try {
        parsed = JSON.parse(aiText);
      } catch {
        parsed = cleanJSON(aiText);
      }

      // Add optimized part
      if (parsed.optimized) optimizedParts.push(parsed.optimized);

      // Add translations safely
      if (Array.isArray(parsed.translations)) {
        for (const t of parsed.translations) {
          if (t.lang && typeof t.text === "string" && targetLanguages.includes(t.lang)) {
            if (!translationsAccum[t.lang]) translationsAccum[t.lang] = [];
            translationsAccum[t.lang].push(t.text);
          }
        }
      }
    }

    const optimizedFull = optimizedParts.join("\n\n");
    const translations = Object.keys(translationsAccum).map(lang => ({
      lang,
      text: translationsAccum[lang].join("\n\n"),
    }));

    return NextResponse.json({ optimized: optimizedFull, translations });
  } catch (err) {
    console.error("❌ optimize error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
