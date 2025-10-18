// app/api/saveChapter/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongoose";
import Book from "../../../models/Book";

import Chapter from "../../../models/Chapter";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      bookId,
      chapterTitle,
      chapterIndex = null,
      original = "",
      optimized = "",
      translations = [], // array of { lang, text, audioUrl }
      createdBy = null,
    } = body;

    if (!bookId || !chapterTitle) {
      return NextResponse.json({ error: "bookId and chapterTitle required" }, { status: 400 });
    }

    await dbConnect();

    // ensure book exists
    const bookObjId = mongoose.Types.ObjectId.isValid(bookId) ? new mongoose.Types.ObjectId(bookId) : null;
    if (!bookObjId) return NextResponse.json({ error: "Invalid bookId" }, { status: 400 });

    const book = await Book.findById(bookObjId).lean();
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    // Build multilingual maps
    const titles = { en: chapterTitle };
    const content = {};
    const audio = {};

    // English content: prefer optimized then original
    content.en = optimized || original || "";

    translations.forEach((t) => {
      if (!t || !t.lang) return;
      if (t.text) content[t.lang] = t.text;
      if (t.audioUrl) audio[t.lang] = t.audioUrl;
      // optionally: if translation includes title, set titles[t.lang]
      if (t.title) titles[t.lang] = t.title;
    });

    const chDoc = new Chapter({
      book: bookObjId,
      chapterIndex,
      titles,
      content,
      audio,
      createdBy,
    });

    const saved = await chDoc.save();

    // update book's chapterCount and updatedAt
    await Book.updateOne({ _id: bookObjId }, { $inc: { chapterCount: 1 }, $set: { updatedAt: new Date() } });

    return NextResponse.json({ chapterId: saved._id.toString() }, { status: 201 });
  } catch (err) {
    console.error("saveChapter error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
