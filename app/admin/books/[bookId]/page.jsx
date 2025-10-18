// app/books/[bookId]/page.jsx
import React from "react";
import { dbConnect } from "../../../../lib/mongoose"; // adjust if your db helper path differs
import Book from "../../../../models/Book";
import Chapter from "../../../../models/Chapter";
import { normalizeAny } from "../../../../lib/normalize";
import ClientChapterDownloader from "./client-chapter-downloader"; // client component (below)

export default async function BookPublicPage({ params }) {
  const { bookId } = params;
  await dbConnect();

  const bookDoc = await Book.findById(bookId).lean();
  if (!bookDoc) return <div className="p-6">Book not found.</div>;

  const chaptersDoc = await Chapter.find({ book: bookId }).sort({ chapterIndex: 1 }).lean();

  const book = normalizeAny(bookDoc);
  const chapters = normalizeAny(chaptersDoc);

  // Build language list (union of book.languages and any audio keys from chapters)
  const langSet = new Set(Array.isArray(book.languages) ? book.languages : []);
  for (const ch of chapters) {
    if (ch.audio && typeof ch.audio === "object") {
      for (const k of Object.keys(ch.audio)) langSet.add(k);
    }
  }
  const languages = Array.from(langSet);
  // ensure there is at least one language to choose from
  if (languages.length === 0) languages.push("en");

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{(book.name && (book.name.en || Object.values(book.name)[0])) || "Untitled"}</h1>
          <div className="text-sm text-gray-600">Chapters: {chapters.length}</div>
        </div>
      </div>

      {/* Pass plain JSON-serializable data down to client component */}
      <ClientChapterDownloader initialLanguages={languages} initialChapters={chapters} book={book} />
    </div>
  );
}
