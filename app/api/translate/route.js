// app/api/translate/route.js
import { NextResponse } from "next/server";

const TRANSLATOR_KEY = process.env.AZURE_TRANSLATOR_KEY;
if (!TRANSLATOR_KEY) console.warn("⚠️ AZURE_TRANSLATOR_KEY not set in .env");
const TRANSLATOR_ENDPOINT = "https://api.cognitive.microsofttranslator.com";
const REGION = process.env.AZURE_TRANSLATOR_REGION || "eastus";

// Tunables
const MAX_CHARS_PER_REQUEST = 4000; // per-request budget (keeps requests safe)
const MAX_PARAGRAPHS_PER_BATCH = 50; // safety cap on items per request
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 500;
const CHUNK_FALLBACK_SIZE = 1000; // when a paragraph fails alone, split into chunks of this size
const CHUNK_SPLIT_OVERLAP = 10; // small overlap to avoid losing punctuation boundaries

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function splitIntoParagraphs(text) {
  if (!text) return [];
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function makeBatches(paragraphs) {
  const batches = [];
  let cur = [];
  let curLen = 0;

  for (const p of paragraphs) {
    const pLen = p.length;
    if (pLen > MAX_CHARS_PER_REQUEST) {
      if (cur.length) {
        batches.push(cur);
        cur = [];
        curLen = 0;
      }
      batches.push([p]);
      continue;
    }
    if (cur.length >= MAX_PARAGRAPHS_PER_BATCH || curLen + pLen + 2 > MAX_CHARS_PER_REQUEST) {
      if (cur.length) batches.push(cur);
      cur = [p];
      curLen = pLen;
    } else {
      cur.push(p);
      curLen += pLen + 2;
    }
  }
  if (cur.length) batches.push(cur);
  return batches;
}

/** split a long paragraph into smaller chunks (try to split on whitespace) */
function splitParagraphIntoChunks(paragraph, maxLen = CHUNK_FALLBACK_SIZE) {
  if (!paragraph) return [];
  if (paragraph.length <= maxLen) return [paragraph];

  const chunks = [];
  let cursor = 0;
  const len = paragraph.length;

  while (cursor < len) {
    let end = Math.min(cursor + maxLen, len);
    if (end < len) {
      // try to move back to last whitespace for nicer split
      const slice = paragraph.slice(cursor, end + 1);
      const lastSpace = slice.lastIndexOf(" ");
      if (lastSpace > Math.max(10, maxLen * 0.4)) {
        end = cursor + lastSpace;
      }
    }
    // small overlap to preserve punctuation/context
    const chunk = paragraph.slice(Math.max(0, cursor - CHUNK_SPLIT_OVERLAP), end).trim();
    if (chunk) chunks.push(chunk);
    cursor = end;
  }
  return chunks;
}

/** low-level: translate an array bodyArray = [{ Text: "..." }, ...] with retries */
async function translateRequest(bodyArray, lang) {
  let attempt = 0;
  while (true) {
    attempt++;
    try {
      const url = `${TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to=${encodeURIComponent(lang)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": TRANSLATOR_KEY,
          "Ocp-Apim-Subscription-Region": REGION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyArray),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        if ((res.status === 429 || (res.status >= 500 && res.status < 600)) && attempt <= MAX_RETRIES) {
          const wait = RETRY_BASE_MS * Math.pow(2, attempt - 1);
          console.warn(`Translate request failed for ${lang} (status ${res.status}). retry ${attempt} after ${wait}ms`, txt);
          await sleep(wait);
          continue;
        }
        throw new Error(`Azure translation failed for ${lang}: ${res.status} ${txt}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      if (attempt <= MAX_RETRIES) {
        const wait = RETRY_BASE_MS * Math.pow(2, attempt - 1);
        console.warn(`Translate request error for ${lang} (attempt ${attempt}):`, String(err));
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
}

/**
 * Translate paragraphs in batches for one language, with fallback for empty/missing items:
 * - primary: batch translation with makeBatches
 * - if any returned translation is empty/missing -> try re-translating that paragraph alone
 * - if still empty -> split paragraph into chunks and translate chunks then rejoin
 */
async function translateParagraphBatchesForLang(paragraphs, lang) {
  if (!paragraphs.length) return "";

  const batches = makeBatches(paragraphs);
  const translatedParagraphs = [];

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    const bodyArray = batch.map((p) => ({ Text: p }));

    let data;
    try {
      data = await translateRequest(bodyArray, lang);
    } catch (err) {
      // entire batch failed after retries — fallback to translating paragraphs one-by-one
      console.warn(`Batch ${bi} failed for ${lang}, falling back to per-paragraph translate. Error:`, String(err));
      for (let pi = 0; pi < batch.length; pi++) {
        const p = batch[pi];
        try {
          const single = await translateParagraphWithChunkFallback(p, lang);
          translatedParagraphs.push(single);
        } catch (err2) {
          console.error(`Paragraph translate failed for ${lang} at batch ${bi} index ${pi}:`, err2);
          translatedParagraphs.push("");
        }
      }
      continue;
    }

    // If Azure response shape is unexpected or different length, fallback to per-paragraph
    if (!Array.isArray(data) || data.length !== bodyArray.length) {
      console.warn("Unexpected Azure response shape or length mismatch; falling back to per-paragraph for this batch.", { lang, batchIndex: bi, respShape: Array.isArray(data) ? data.length : typeof data });
      for (let pi = 0; pi < batch.length; pi++) {
        const p = batch[pi];
        try {
          const single = await translateParagraphWithChunkFallback(p, lang);
          translatedParagraphs.push(single);
        } catch (err2) {
          console.error(`Paragraph translate failed for ${lang} at fallback batch ${bi} index ${pi}:`, err2);
          translatedParagraphs.push("");
        }
      }
      continue;
    }

    // Normal path: collect translations, but detect empties and retry those
    for (let i = 0; i < bodyArray.length; i++) {
      const item = data[i];
      const translated = item?.translations?.[0]?.text ?? "";

      if (translated && String(translated).trim().length > 0) {
        translatedParagraphs.push(translated);
        continue;
      }

      // Empty translation for this paragraph: attempt fallback
      const originalParagraph = batch[i];
      console.warn(`Empty translation received for lang=${lang}, batch=${bi}, paragraphIndex=${i}. Attempting paragraph-level retry.`);
      try {
        const fixed = await translateParagraphWithChunkFallback(originalParagraph, lang);
        translatedParagraphs.push(fixed);
      } catch (err) {
        console.error(`Fallback paragraph translation failed for lang=${lang}:`, err);
        translatedParagraphs.push(""); // keep placeholder so positions align
      }
    }
  } // end batches

  // Reassemble using double-newline
  return translatedParagraphs.join("\n\n");
}

/** Attempt to translate a paragraph:
 * 1) try single-paragraph translateRequest
 * 2) if empty or fails -> split into chunks and translate each chunk sequentially then join
 */
async function translateParagraphWithChunkFallback(paragraph, lang) {
  if (!paragraph) return "";

  // Try single paragraph request first
  try {
    const singleResp = await translateRequest([{ Text: paragraph }], lang);
    const singleTranslated = Array.isArray(singleResp) ? (singleResp[0]?.translations?.[0]?.text ?? "") : (singleResp?.[0]?.translations?.[0]?.text ?? "");
    if (singleTranslated && String(singleTranslated).trim().length > 0) {
      return singleTranslated;
    }
    // empty: continue to chunk fallback
    console.warn("Single-paragraph translate returned empty — falling back to chunk-splitting.", { lang, length: paragraph.length });
  } catch (err) {
    console.warn("Single-paragraph translate error — trying chunk-splitting", err);
  }

  // Chunk fallback
  const chunks = splitParagraphIntoChunks(paragraph, CHUNK_FALLBACK_SIZE);
  const translatedChunks = [];

  for (let ci = 0; ci < chunks.length; ci++) {
    const chunk = chunks[ci];
    try {
      const resp = await translateRequest([{ Text: chunk }], lang);
      const translated = Array.isArray(resp) ? (resp[0]?.translations?.[0]?.text ?? "") : (resp?.[0]?.translations?.[0]?.text ?? "");
      if (translated && String(translated).trim().length > 0) {
        translatedChunks.push(translated);
      } else {
        console.warn(`Chunk translate returned empty for lang=${lang}, chunkIndex=${ci}. pushing empty string.`);
        translatedChunks.push("");
      }
    } catch (err) {
      console.error(`Chunk translate failed for lang=${lang}, chunkIndex=${ci}:`, err);
      translatedChunks.push("");
    }
  }

  return translatedChunks.join("\n\n");
}

export async function POST(req) {
  try {
    const { text, targetLanguages } = await req.json();
    if (!text || !targetLanguages || !Array.isArray(targetLanguages) || !targetLanguages.length) {
      return NextResponse.json({ error: "Missing text or targetLanguages" }, { status: 400 });
    }

    const paragraphs = splitIntoParagraphs(text);

    if (paragraphs.length === 0) {
      return NextResponse.json({ translations: targetLanguages.map((lang) => ({ lang, text: "" })) });
    }

    const translations = [];

    // sequential languages to be conservative about quota/concurrency
    for (const lang of targetLanguages) {
      try {
        const translated = await translateParagraphBatchesForLang(paragraphs, lang);
        translations.push({ lang, text: translated });
      } catch (err) {
        console.error(`Translation failed for language ${lang}:`, err);
        // include partial/empty result and error so frontend can resume or retry
        translations.push({ lang, text: "", error: String(err) });
      }
    }

    return NextResponse.json({ translations });
  } catch (err) {
    console.error("Translation error", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
