// app/books/BooksClient.jsx (replace your current file with this updated code)
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlayer } from "../_components/PlayerProvider"; // adjust path if different

// same helpers as before
const LANG_CODE_TO_NAME = {
  en: "English",
  zh: "Mandarin",
  hi: "Hindi",
  es: "Spanish",
  fr: "French",
  ar: "Arabic",
  bn: "Bengali",
  pt: "Portuguese",
  ru: "Russian",
  ur: "Urdu",
};
const NAME_TO_CODE = Object.fromEntries(Object.entries(LANG_CODE_TO_NAME).map(([k, v]) => [v, k]));

function getText(obj, prefer = "en") {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[prefer] ?? Object.values(obj)[0] ?? "";
}

export default function BooksClient({ books }) {
  const [chaptersCache, setChaptersCache] = useState({});
  const [hoveredBook, setHoveredBook] = useState(null);
  const [loadingChaptersFor, setLoadingChaptersFor] = useState(null);

  const player = usePlayer();
  const router = useRouter();

  async function fetchChapters(bookId) {
    if (chaptersCache[bookId]) return chaptersCache[bookId];
    try {
      setLoadingChaptersFor(bookId);
      const res = await fetch(`/api/books/${bookId}/chapters`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setChaptersCache((p) => ({ ...p, [bookId]: data.chapters || [] }));
      return data.chapters || [];
    } catch (err) {
      console.error("Failed to load chapters", err);
      return [];
    } finally {
      setLoadingChaptersFor(null);
    }
  }

  // when hovering, prefetch chapters
  async function onHoverBook(bookId) {
    setHoveredBook(bookId);
    if (!chaptersCache[bookId]) await fetchChapters(bookId);
  }

  // Start playing: build playlist and hand to global player
  async function startPlayingBook(book) {
    const chapters = await fetchChapters(book._id);
    if (!chapters || chapters.length === 0) {
      alert("No chapters found for this book");
      return;
    }
    const pl = chapters.map((ch) => ({
      chapterId: ch._id,
      title: getText(ch.titles || { en: `Chapter ${ch.chapterIndex ?? "?"}` }, "en"),
      audioMap: ch.audio || {},
    }));

    player.playPlaylist(pl, 0, { bookId: book._id, title: getText(book.name, "en") });
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {books.map((b) => {
          const title = getText(b.name, "en") || "Untitled";
          const author = getText(b.author, "en") || "";
          const img = b.images?.en || "/default-book.png";
          const languages = Array.isArray(b.languages) ? b.languages : Object.keys(b.name || { en: "" });

          return (
            <div
              key={String(b._id)}
              className="group relative block rounded overflow-hidden bg-neutral-800 hover:scale-[1.01] transition-transform"
              onMouseEnter={() => onHoverBook(b._id)}
              onMouseLeave={() => setHoveredBook((p) => (p === b._id ? null : p))}
            >
              <div className="w-full h-44 bg-gray-700 flex items-center justify-center relative">
                <img src={img} alt={title} className="object-cover w-full h-full" />
                {/* overlay actions on hover */}
                <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity ${hoveredBook === b._id ? "opacity-100" : "opacity-0"} `}>
                  <button
                    onClick={(e) => { e.stopPropagation(); startPlayingBook(b); }}
                    className="bg-white/90 text-black p-3 rounded-full shadow"
                    title="Play this book"
                  >
                    ▶
                  </button>

                  <Link href={`/books/${b._id}`} onClick={(e)=>{/* just link */}} className="bg-black/70 text-white px-3 py-2 rounded">
                    Explore
                  </Link>
                </div>
              </div>

              <div className="p-3">
                <div className="font-semibold line-clamp-2">{title}</div>
                <div className="text-xs text-gray-300 mt-1">{author}</div>
                <div className="mt-2 text-xs text-gray-400 line-clamp-3">{getText(b.summary || b.intro, "en")}</div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    {languages.slice(0, 6).map((l) => (
                      <div key={`${b._id}-${l}`} className="text-xs bg-neutral-700 px-2 py-0.5 rounded">{LANG_CODE_TO_NAME[l] ?? l}</div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400">{b.chapterCount} chapters</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* note: the persistent bottom player is provided by the PlayerProvider; this component no longer renders its own player */}
    </div>
  );
}
