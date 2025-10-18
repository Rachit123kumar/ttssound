// app/books/page.jsx
import React from "react";
import { dbConnect } from "../../lib/mongoose";
import Book from "../../models/Book";
import { normalizeAny } from "../../lib/normalize";
import BooksClient from "./BooksClient"; // client component (below)

export default async function BooksPage() {
  await dbConnect();
  const rawBooks = await Book.find().sort({ createdAt: -1 }).lean(); // lean() -> plain objects
  const books = rawBooks.map(b => ({
  ...b,
  _id: String(b._id),            // IMPORTANT: make id a string
  name: b.name || {},
  images: b.images || {},
  languages: Array.isArray(b.languages) ? b.languages : Object.keys(b.name || { en: "" }),
  chapterCount: b.chapterCount ?? 0,
}));


  // sanitize: ensure arrays / defaults
  const safe = books.map((b) => ({
    _id: String(b._id),
    name: b.name || {},
    intro: b.intro || {},
    summary: b.summary || {},
    author: b.author || {},
    images: b.images || {},
    languages: Array.isArray(b.languages) ? b.languages : Object.keys(b.name || { en: "" }),
    chapterCount: b.chapterCount ?? 0,
  }));

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Books</h1>
        </header>

        {/* Client UI receives books array */}
        <BooksClient books={safe} />
      </div>
    </div>
  );
}
