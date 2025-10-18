// app/books/[bookId]/client-chapter-downloader.jsx
'use client';

import React, { useState, useMemo } from "react";

/**
 * Props:
 * - initialLanguages: string[]
 * - initialChapters: Array of chapters (plain objects)
 * - book: plain book object
 */
export default function ClientChapterDownloader({ initialLanguages = [], initialChapters = [], book = {} }) {
  const [lang, setLang] = useState(initialLanguages[0] || "en");
  const [downloading, setDownloading] = useState(null); // chapter id being downloaded

  const chapters = initialChapters || [];

  // helper to get safe title
  const getChapterTitle = (ch) => {
    if (!ch) return "";
    if (ch.titles && typeof ch.titles === "object") return ch.titles[lang] || ch.titles.en || Object.values(ch.titles)[0] || `Chapter ${ch.chapterIndex ?? ""}`;
    return ch.title || `Chapter ${ch.chapterIndex ?? ""}`;
  };

  // create a recommended filename for download
  const makeFilename = (bookObj, chapterObj, langCode, ext = "mp3") => {
    const bookName = (bookObj && (bookObj.name?.en || Object.values(bookObj.name || {})[0] || "book")).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-]/g, "");
    const chIndex = chapterObj?.chapterIndex ?? "";
    const chId = String(chapterObj?._id ?? "").slice(0, 8);
    return `${bookName}_ch${chIndex || chId}_${langCode}.${ext}`;
  };

  // Primary download method: try direct anchor download first (fast), else fetch as blob and download.
  const downloadUrl = async (url, filename) => {
    if (!url) throw new Error("No URL");

    // Try lightweight anchor + download (may be ignored for cross-origin or if server doesn't send right headers)
    try {
      // attempt a HEAD fetch to detect potential CORS issues quickly (optional)
      // but we will fallback to blob fetch if direct anchor isn't allowed
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.target = "_blank";
      a.rel = "noreferrer";
      document.body.appendChild(a);

      // try to click anchor. If browser blocks or download attribute ignored, we'll still fall back below.
      a.click();
      a.remove();

      // Wait small tick to let browser handle direct download on success
      // But we can't reliably know if download succeeded. We'll attempt fallback only on failure to fetch blob.
      return;
    } catch (e) {
      // ignore and try blob fallback
    }

    // Blob fallback (reliably forces download)
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a2 = document.createElement("a");
    a2.href = blobUrl;
    a2.download = filename;
    document.body.appendChild(a2);
    a2.click();
    a2.remove();
    // revoke later
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
  };

  const handleDownload = async (chapter) => {
    const url = chapter?.audio?.[lang];
    if (!url) {
      alert(`No audio available for language "${lang}" in this chapter.`);
      return;
    }

    const filename = makeFilename(book, chapter, lang, url.split('.').pop().split(/\#|\?/)[0] || 'mp3');
    try {
      setDownloading(chapter._id);
      // Optionally: if you prefer server proxy use `/api/download-audio?url=${encodeURIComponent(url)}&filename=${filename}`
      await downloadUrl(url, filename);
    } catch (err) {
      console.error("Download failed:", err);
      // fallback: open in new tab
      window.open(url, "_blank", "noreferrer");
    } finally {
      setDownloading(null);
    }
  };

  // Optional: convenience function to download all chapters one-by-one (respect user's bandwidth)
  const downloadAll = async () => {
    if (!confirm(`Download all ${chapters.length} chapters in "${lang}" one-by-one?`)) return;
    for (const ch of chapters) {
      const url = ch?.audio?.[lang];
      if (!url) continue;
      await handleDownload(ch);
      // small delay to avoid flooding browser/network
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 ">
        <label className="text-sm font-medium">Select language:</label>
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="px-2 py-1 border rounded">
          {initialLanguages.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        <button onClick={downloadAll} className="ml-4 px-3 py-1 bg-green-600 text-white rounded">Download all in "{lang}"</button>
      </div>

      <div className="space-y-3 mb-30">
        {chapters.length === 0 && <div>No chapters found.</div>}
        {chapters.map((ch,i) => (
          <div key={i} className="p-3 border rounded flex items-center justify-between  ">
            <div>
              <div className="font-medium">{getChapterTitle(ch)}</div>
              <div className="text-sm text-gray-600">Index: {ch.chapterIndex ?? '—'}</div>
              <div className="text-xs text-gray-500 mt-1">{ch.audio && ch.audio[lang] ? ch.audio[lang] : `No audio for ${lang}`}</div>
            </div>

            <div>
              {/* <button
                onClick={() => handleDownload(ch)}
                disabled={!!downloading}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                {downloading === ch._id ? "Downloading..." : "Download"}
              </button> */}

                <button
    onClick={async () => {
      try {
        const audioUrl=ch?.audio?.[lang]
        if(!audioUrl)return;
        const res = await fetch(audioUrl);
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "generated-speech.mp3";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Free memory
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download failed", err);
      }
    }}
    className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition w-full md:w-auto"
  >
    Download
  </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
