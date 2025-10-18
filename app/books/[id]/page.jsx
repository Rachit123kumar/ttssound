// app/books/page.jsx
import React from "react";
import { dbConnect } from "../../../lib/mongoose";
import Book from "../../../models/Book";
import { normalizeAny } from "../../../lib/normalize";
import BookPlayerClient from "../../_components/BookPlayerClient"; // client component (below)
import Chapter from "../../../models/Chapter"
import Link from "next/link";

// client component (below)
function getText(multi, preferred = "en") {
  if (!multi) return "";
  if (typeof multi === "string") return multi;
  if (multi[preferred]) return multi[preferred];
  const vals = Object.values(multi || {});
  return vals.length ? String(vals[0]) : "";
}

export default async function Page({ params }) {
  const { id } = params;
  await dbConnect();

  // fetch book and its chapters (ordered)
  const bookDoc = await Book.findById(id).lean();
  if (!bookDoc) {
    return <div className="min-h-screen p-8">Book not found</div>;
  }

  // fetch chapters for this book
  const chapterDocs = await Chapter.find({ book: id }).sort({ chapterIndex: 1 }).lean();

  // Normalize to plain objects and convert Maps (if any) to POJOs
  const book = normalizeAny(bookDoc);
  const chapters = normalizeAny(chapterDocs);

  // ensure we pass only serializable data
  const simpleBook = {
    _id: String(book._id),
    name: book.name || {},
    intro: book.intro || {},
    summary: book.summary || {},
    images: book.images || {},
    languages: book.languages || [],
    chapterCount: book.chapterCount ?? (chapters.length || 0),
  };

  // prepare minimal chapters array
  const simpleChapters = chapters.map((c) => ({
    _id: String(c._id),
    chapterIndex: c.chapterIndex ?? null,
    titles: c.titles || {},
    content: c.content || {},
    audio: c.audio || {}, // map of lang code -> url
  }));

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <header className="flex items-center gap-6">
           <Link href="/books" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white">
      {/* optional: simple arrow */}
      <span className="inline-block rotate-180">➤</span>
      <span>Back to books</span>
    </Link>
          <div className="w-32 h-40 bg-gray-700 rounded overflow-hidden flex-shrink-0">
            <img src={simpleBook.images?.en || "/default-book.png"} alt={getText(simpleBook.name)} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{getText(simpleBook.name, "en")}</h1>
            <p className="text-sm text-gray-300 mt-2 max-w-2xl">{getText(simpleBook.summary, "en") || getText(simpleBook.intro, "en")}</p>
            <div className="mt-3 text-xs text-gray-400 flex items-center gap-4">
              <div>{simpleBook.chapterCount} chapters</div>
              <div>{(simpleBook.languages || []).length} languages</div>
            </div>
          </div>
        </header>

        {/* Client-side interactive player & chapter list */}
        <BookPlayerClient book={simpleBook} chapters={simpleChapters} />
      </div>
    </div>
  );
}