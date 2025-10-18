// app/_components/BookPlayerClient.jsx
"use client";

import React from "react";
import { usePlayer } from "../_components/PlayerProvider"; // adjust path if necessary

// Helper to get string from multilingual fields
function getText(multi, preferred = "en") {
  if (!multi) return "";
  if (typeof multi === "string") return multi;
  if (multi[preferred]) return multi[preferred];
  const vals = Object.values(multi || {});
  return vals.length ? String(vals[0]) : "";
}

export default function BookPlayerClient({ book, chapters }) {
  const player = usePlayer();

  // Build the full playlist from chapters (same order)
  function makePlaylistFromChaps(chaps) {
    return (chaps || []).map((c, idx) => ({
      chapterId: String(c._id ?? idx),
      title: getText(c.titles || { en: `Chapter ${c.chapterIndex ?? idx + 1}` }, "en"),
      audioMap: c.audio || {},
    }));
  }

  // play the entire book starting from index
  function playBookFromIndex(chaps, idx) {
    const pl = makePlaylistFromChaps(chaps);
    if (!pl.length) return alert("No chapters available to play");
    // clamp idx
    const start = Math.max(0, Math.min(idx, pl.length - 1));
    player.playPlaylist(pl, start, { bookId: book._id, title: getText(book.name, "en") });
  }

  // play the book from the start
  function onPlayBook() {
    playBookFromIndex(chapters, 0);
  }

  // play the first chapter only (keeps it single-item playlist)
  function onPlayFirstChapterAsSingle() {
    const first = chapters[0];
    if (!first) return alert("No chapters");
    player.playSingleChapter({
      chapterId: String(first._id),
      title: getText(first.titles || { en: `Chapter ${first.chapterIndex ?? 1}` }, "en"),
      audioMap: first.audio || {},
    }, { bookId: book._id, title: getText(book.name, "en") });
  }

  return (
    <div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayBook}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Play book
          </button>

          <button
            onClick={onPlayFirstChapterAsSingle}
            className="px-3 py-2 border rounded"
          >
            Play first chapter (single)
          </button>
        </div>

        <div className="grid gap-2 mb-30">
          {chapters.map((c, idx) => {
            const idStr = String(c._id ?? idx);
            const indexPart = c.chapterIndex != null ? c.chapterIndex : idx;
            const key = `${idStr}-${indexPart}`;
            const chapterLabel = getText(c.titles, "en") || `Chapter ${indexPart + 1}`;

            return (
              <div key={key} className="p-3  bg-neutral-800 rounded flex items-center justify-between">
                <div className="">
                  <div className="font-medium">{chapterLabel}</div>
                  <div className="text-xs text-gray-400">{(getText(c.content, "en") || "").slice(0, 120)}</div>
                </div>
                <div className="flex gap-2 ">
                  {/* PLAY THIS CHAPTER: use full playlist and jump to this index so Next works */}
                  <button
                    onClick={() => playBookFromIndex(chapters, idx)}
                    className="px-3 py-1 bg-white/90 text-black rounded"
                    title="Play this chapter and continue"
                  >
                    ▶
                  </button>

                  {/* Add-to-queue & jump: rebuild playlist and jump (same as above but explicit) */}
                  <button
                    onClick={() => playBookFromIndex(chapters, idx)}
                    className="px-3 py-1 border rounded"
                    title="Add whole book to queue and jump to this chapter"
                  >
                    Add to queue & jump
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
