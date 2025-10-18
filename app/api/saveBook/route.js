// app/api/saveBook/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongoose";
import Book from "../../../models/Book";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      bookName,
      intro = "",
      summary = "",
      author = "",
      affiliateLink = "",
      imageUrl = "",
      languages = ["en"],
      tags = [],
      translations = {}, // optional: { name: { hi: "..." }, intro: { hi: "..." } }
      createdBy = null,
    } = body;

    if (!bookName) {
      return NextResponse.json({ error: "bookName required" }, { status: 400 });
    }

    await dbConnect();

    // Build multilingual maps - ensure english at minimum
    const name = { en: bookName, ...((translations.name) || {}) };
    const introMap = { en: intro, ...((translations.intro) || {}) };
    const summaryMap = { en: summary, ...((translations.summary) || {}) };
    const authorMap = { en: author, ...((translations.author) || {}) };
    const affiliateMap = { en: affiliateLink, ...((translations.affiliateLink) || {}) };
    const imagesMap = { en: imageUrl || "", ...((translations.images) || {}) };

    const bookDoc = new Book({
      name,
      intro: introMap,
      summary: summaryMap,
      author: authorMap,
      affiliateLink: affiliateMap,
      images: imagesMap,
      languages,
      tags,
      createdBy,
    });

    const saved = await bookDoc.save();

    return NextResponse.json({ bookId: saved._id.toString() }, { status: 201 });
  } catch (err) {
    console.error("saveBook error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
