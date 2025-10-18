// app/api/books/[id]/chapters/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/mongoose";
import Chapter from "../../../../../models/Chapter";

/** safely convert Mongoose Map / Map-like / plain object -> plain object */
function mapToObject(m) {
  if (!m) return {};
  // If it's a Map instance
  if (m instanceof Map) return Object.fromEntries(m);
  // If Mongoose returns a Map-like object with entries()
  if (typeof m.entries === "function") {
    try {
      return Object.fromEntries(Array.from(m.entries()));
    } catch {}
  }
  // If it's a plain object already
  if (typeof m === "object") return m;
  return {};
}

export async function GET(req, context) {
  try {
    // Next.js requires awaiting params in some environments:
    // this will work whether context.params is a promise or a plain object.
    const maybeParams = context?.params ? await context.params : undefined;
    let id = maybeParams?.id;

    // fallback: parse id from URL (robust if context.params isn't provided)
    if (!id) {
      try {
        const url = new URL(req.url);
        const segments = url.pathname.split("/").filter(Boolean);
        const idx = segments.findIndex((s) => s === "books");
        if (idx !== -1 && segments.length > idx + 1) {
          id = segments[idx + 1];
        } else {
          id = segments[segments.length - 1];
        }
      } catch (e) {
        // ignore URL parse errors — will validate id below
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Missing book id in URL" }, { status: 400 });
    }

    await dbConnect();
    const chapters = await Chapter.find({ book: id }).sort({ chapterIndex: 1 }).lean();

    const normalized = chapters.map((ch) => ({
      _id: String(ch._id),
      chapterIndex: ch.chapterIndex ?? null,
      titles: mapToObject(ch.titles),
      content: mapToObject(ch.content),
      audio: mapToObject(ch.audio),
      durationSec: mapToObject(ch.durationSec),
      createdAt: ch.createdAt,
      updatedAt: ch.updatedAt,
    }));

    return NextResponse.json({ chapters: normalized });
  } catch (err) {
    console.error("GET /api/books/[id]/chapters error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
