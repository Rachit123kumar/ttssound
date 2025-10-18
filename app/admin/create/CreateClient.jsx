// app/admin/create/CreateClient.jsx
'use client';
import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { set } from "mongoose";

/* --- Config --- */
const TOP_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "Mandarin (中文)" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic" },
  { code: "bn", label: "Bengali" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "ur", label: "Urdu" },
];

const DEFAULT_VOICES = {
  en: "en-US-JennyNeural",
  zh: "zh-CN-XiaoxiaoNeural",
  hi: "hi-IN-SwaraNeural",
  es: "es-ES-ElviraNeural",
  fr: "fr-FR-DeniseNeural",
  ar: "ar-SA-ZariyahNeural",
  bn: "bn-BD-NabanitaNeural",
  pt: "pt-BR-FranciscaNeural",
  ru: "ru-RU-DariyaNeural",
  ur: "ur-PK-UzmaNeural",
};

/* --- New: english voices --- */
const englishVoices = [
  { key: "en-US-JennyNeural", displayName: "Jenny", description: "Female, Adult (English US)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=J" },
  { key: "en-US-GuyNeural", displayName: "Guy", description: "Male, Adult (English US)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=G" },
  { key: "en-US-AriaNeural", displayName: "Aria", description: "Female, Adult (English US)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=A" },
  { key: "en-US-EmmaMultilingualNeural", displayName: "Emma", description: "Female, Adult (English US, Multilingual)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=E" },
  { key: "en-US-AndrewNeural", displayName: "Andrew", description: "Male, Adult (English US)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=AN" },
  { key: "en-US-SaraNeural", displayName: "Sara", description: "Female, Adult (English US)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=S" },
  { key: "en-US-NancyNeural", displayName: "Nancy", description: "Female, Adult (English US)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=N" },
  { key: "en-GB-SoniaNeural", displayName: "Sonia", description: "Female, Adult (English UK)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=S" },
  { key: "en-GB-RyanNeural", displayName: "Ryan", description: "Male, Adult (English UK)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=R" },
  { key: "en-GB-LibbyNeural", displayName: "Libby", description: "Female, Adult (English UK)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=L" },
  { key: "en-GB-AbbiNeural", displayName: "Abbi", description: "Female, Adult (English UK)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=AB" },
  { key: "en-GB-AlfieNeural", displayName: "Alfie", description: "Male, Adult (English UK)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=AL" },
  { key: "en-GB-BellaNeural", displayName: "Bella", description: "Female, Adult (English UK)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=B" },
];

/* --- Helpers --- */
function stripMarkdownMarkers(input) {
  if (!input) return input;
  return input
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/\*(.*?)\*/gs, "$1")
    .replace(/__(.*?)__/gs, "$1")
    .replace(/_(.*?)_/gs, "$1")
    .replace(/```/g, "")
    .replace(/`/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// split same way server does: paragraphs separated by 2+ newlines
function splitIntoParagraphs(text) {
  if (!text) return [];
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Robust chapter parser:
 * - finds headings like "Chapter 1", "CHAPTER I", "Chapter II:", "chapter 3 - Title", etc.
 * - supports Arabic numerals and Roman numerals (i, ii, iii, iv, v, ...).
 * - case-insensitive.
 */
function parseChapters(text) {
  if (!text) return [];
  const regex = /(?:^|\n)(\s*chapter\s+([0-9]+|[ivxlcdm]+)\b[^\n]*)/gim;
  const matches = [...text.matchAll(regex)];

  if (matches.length === 0) {
    return [{ title: "Chapter 1", content: text.trim() }];
  }

  const chapters = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const start = match.index + match[0].length;
    const end = matches[i + 1]?.index ?? text.length;
    const title = match[1].trim();
    const content = text.slice(start, end).trim();
    chapters.push({ title, content });
  }

  return chapters;
}

/* --- Main component --- */
/**
 * initialSearchParams: server-passed searchParams (object or URLSearchParams-like).
 * Example: { bookId: "abc", chapterIndex: "2", edit: "true" }
 */
export default function ChapterFormatterPages({ initialSearchParams }) {
  /* raw & book */
  const [rawText, setRawText] = useState("");
  const [bookName, setBookName] = useState("");
  const [bookIntro, setBookIntro] = useState("");
  const [bookSummary, setBookSummary] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [bookId, setBookId] = useState("");

  /* pipeline & UI */
  const [selectedLangs, setSelectedLangs] = useState(TOP_LANGUAGES.map((l) => l.code));
  const [chapters, setChapters] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [globalProcessing, setGlobalProcessing] = useState(false);
  const [log, setLog] = useState("");

  /* --- Per-chapter editor state --- */
  const [editingOpen, setEditingOpen] = useState(false);
  const [editingText, setEditingText] = useState("");
  const [editingTitle, setEditingTitle] = useState("");

  const page = chapters[pageIndex] || null;

  const router = useRouter();
 const searchParams = useSearchParams()
 
  const search = searchParams.get('bookId')
  console.log(search || "nope")

  // helper to read a param from initialSearchParams (handles plain object or URLSearchParams-like)


  const getParam = (k) => {
    if (!initialSearchParams) return null;
    try {
      if (typeof initialSearchParams.get === "function") {
        // URLSearchParams-like
        return initialSearchParams.get(k);
      }
      const v = initialSearchParams[k];
      if (Array.isArray(v)) return v[0];
      return typeof v !== "undefined" ? v : null;
    } catch (e) {
      return null;
    }
  };

  // Read URL search params once and prefill when provided:
  useEffect(() => {
    // const qBookId = getParam('bookId');
    // const qChapterIndex = getParam('chapterIndex'); // human 1-based
    // const qEdit = getParam('edit');
    // console.log(qBookId || "error", qChapterIndex, qEdit);
    const nameOfBook=searchParams.get('nameOfBook')
    setBookName(nameOfBook || "")
    const qBookId = searchParams.get('bookId');
    const qChapterIndex= searchParams.get('chapterIndex'); // human 1-based
    const qEdit = searchParams.get('edit');
    console.log(nameOfBook, qBookId || "error", qChapterIndex, qEdit);

    if (qBookId) {
      setBookId(qBookId);
      appendLog('Prefilled bookId from URL: ' + qBookId);

      // If edit flag present, attempt to fetch book details for editing
      if (qEdit === 'true') {
        (async () => {
          try {
            const r = await fetch(`/api/getBook?bookId=${encodeURIComponent(qBookId)}`);
            if (r.ok) {
              const b = await r.json();
              if (b) {
                // safe extraction for possible Map-like shape
                try { setBookName(b.name?.en || Object.values(b.name || {})[0] || ''); } catch (e) {}
                try { setBookAuthor(b.author?.en || Object.values(b.author || {})[0] || ''); } catch (e) {}
                try { if (Array.isArray(b.languages)) setSelectedLangs(b.languages); } catch (e) {}
                try { setCoverImageUrl(b.images?.en || Object.values(b.images || {})[0] || ''); } catch (e) {}
                appendLog('Loaded book details for editing');
              }
            } else {
              appendLog('Could not load book details for edit: ' + (await r.text().catch(()=>'')));
            }
          } catch (e) {
            console.warn('Could not load book details for edit', e);
          }
        })();
      }
    }

    if (qChapterIndex) {
      const idx = parseInt(qChapterIndex, 10);
      if (!Number.isNaN(idx) && idx > 0) {
        // ensure chapters array has that many entries and set page index (0-based)
        setChapters(prev => {
          const next = [...prev];
          while (next.length < idx) {
            next.push({
              title: `Chapter ${next.length + 1}`,
              content: '',
              optimized: null,
              translations: [],
              loading: false,
              error: null,
              progress: {},
            });
          }
          return next;
        });
        setPageIndex(idx - 1);
        // open editor automatically for new chapter
        setEditingOpen(true);
        appendLog(`Prefilled to chapter ${idx} (from URL)`);
      }
    }
  }, [initialSearchParams]); // run when server-provided params change

  useEffect(() => {
    if (page) {
      setEditingText(page.content ?? page.optimized ?? "");
      setEditingTitle(page.title ?? `Chapter ${pageIndex + 1}`);
    } else {
      setEditingText("");
      setEditingTitle("");
    }
    setEditingOpen(false);
  }, [pageIndex, chapters]);

  function appendLog(s) {
    setLog((p) => (p ? p + "\n" + s : s));
  }

  function toggleLang(code) {
    setSelectedLangs((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  /* Formatting */
  function handleFormat() {
    const cleaned = stripMarkdownMarkers(rawText);
    const parsed = parseChapters(cleaned);
    const enriched = parsed.map((ch) => ({
      title: ch.title,
      content: ch.content,
      optimized: null,
      translations: [],
      loading: false,
      error: null,
      progress: {},
    }));
    setChapters(enriched);
    setPageIndex(0);
    setLog("");
    appendLog(`Formatted into ${enriched.length} chapter(s)`);
  }

  /* --- API wrappers --- (unchanged optimize/enhance/azure) */
  async function callOptimizeAPI(chapter) {
    const res = await fetch("/api/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookName,
        chapterTitle: chapter.title,
        chapterContent: chapter.content,
        targetLanguages: ["en"],
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Modified: support optional startParagraph (server supports it)
  async function callTranslateAPI(text, langs, startParagraph) {
    const body = { text, targetLanguages: langs };
    if (typeof startParagraph === "number") body.startParagraph = startParagraph;
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function callEnhanceAPI(lang, text, title) {
    const res = await fetch("/api/enhanceTranslation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang, text, bookName, chapterTitle: title }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function callGenerateSpeechAPI({ text, language, voice }) {
    const res = await fetch("/api/azure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language, voice }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "TTS failed");
    }
    return res.json(); // { url }
  }

  /* --- Book creation/saving --- */
  async function createBook() {
    if (!bookName) return alert("Please enter a book name");
    try {
      appendLog("Creating book...");
      const languages = selectedLangs;
      const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);

      const body = {
        bookName,
        intro: bookIntro,
        summary: bookSummary,
        author: bookAuthor,
        affiliateLink,
        imageUrl: coverImageUrl,
        languages,
        tags,
      };

      const res = await fetch("/api/saveBook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Create book failed");
      }
      const data = await res.json();
      const id = data.bookId || data.id || data._id;
      if (!id) throw new Error("No bookId returned from server");
      setBookId(id);
      appendLog("Book created: " + id);
      alert("Book created and bookId set");
    } catch (err) {
      console.error(err);
      appendLog("Create book error: " + (err.message || err));
      alert("Create book failed: " + (err.message || err));
    }
  }

  function setBookIdManually(val) {
    setBookId(val.trim());
  }

  /* --- New: resumable translate helper --- */
  async function translateWithResume(chIndex, text, langs) {
    const ch = chapters[chIndex];
    if (!ch) return langs.map(l => ({ lang: l, text: "", error: "No chapter" }));

    const paragraphs = splitIntoParagraphs(text);
    const totalParagraphs = paragraphs.length;

    function updateChapterProgress(lang, nextStart, accumulatedText) {
      setChapters(prev => prev.map((c, i) => i === chIndex ? { ...c, progress: { ...(c.progress || {}), [lang]: { nextStart, text: accumulatedText, totalParagraphs } } } : c));
    }

    const results = [];

    for (const lang of langs) {
      appendLog(`Translating ${lang} for chapter ${chIndex + 1} — starting/resuming...`);
      const existing = (ch.progress && ch.progress[lang]) || null;
      let start = existing?.nextStart ?? 0;
      let accumulated = existing?.text ?? "";

      if (start >= totalParagraphs) {
        appendLog(`Language ${lang} already complete for chapter ${chIndex + 1}`);
        results.push({ lang, text: accumulated });
        continue;
      }

      let finished = false;
      while (!finished) {
        try {
          const resp = await callTranslateAPI(text, [lang], start);
          const info = (Array.isArray(resp.translations) && resp.translations[0]) || null;
          if (!info) throw new Error("Bad response from translate API");

          if (typeof info.completed === "undefined" && typeof info.paragraphCount === "undefined") {
            accumulated = accumulated ? accumulated + "\n\n" + (info.text || "") : (info.text || "");
            updateChapterProgress(lang, totalParagraphs, accumulated);
            appendLog(`Translated ${lang} (full) for chapter ${chIndex + 1} — saved progress.`);
            results.push({ lang, text: accumulated });
            finished = true;
            break;
          }

          const returnedText = info.text || "";
          const returnedStart = typeof info.startParagraph === "number" ? info.startParagraph : start;
          const returnedCompleted = typeof info.completed === "number" ? info.completed : (typeof info.paragraphCount === "number" ? info.paragraphCount : 0);
          accumulated = accumulated ? accumulated + "\n\n" + returnedText : returnedText;
          const nextStart = returnedStart + returnedCompleted;
          updateChapterProgress(lang, nextStart, accumulated);
          appendLog(`Translated ${lang} chunk; chapter ${chIndex + 1}: paragraphs ${returnedStart}..${nextStart - 1} (nextStart=${nextStart})`);

          if (info.error) {
            appendLog(`Translate error for ${lang} (chapter ${chIndex + 1}): ${info.error}`);
            results.push({ lang, text: accumulated, error: info.error, nextStart });
            finished = true;
            break;
          }

          if (nextStart >= totalParagraphs) {
            appendLog(`Finished translate for ${lang} (chapter ${chIndex + 1})`);
            results.push({ lang, text: accumulated });
            finished = true;
            break;
          }

          start = nextStart;
        } catch (err) {
          const errMsg = String(err);
          updateChapterProgress(lang, start, accumulated);
          appendLog(`Translate request error for ${lang} (chapter ${chIndex + 1}): ${errMsg}`);
          results.push({ lang, text: accumulated, error: errMsg, nextStart: start });
          finished = true;
          break;
        }
      }
    }

    return results;
  }

  /* --- Processing pipeline --- */
  async function processChapter(index) {
    const ch = chapters[index];
    if (!ch) return;
    if (!bookName) return alert("Please enter book name");

    setChapters((prev) => prev.map((c, i) => (i === index ? { ...c, loading: true, error: null } : c)));
    appendLog(`Processing chapter ${index + 1}: ${ch.title}`);

    try {
      const optResp = await callOptimizeAPI(ch);
      const optimizedEnglish = optResp.optimized ?? optResp.optim ?? ch.content;
      appendLog(`Optimized English length: ${optimizedEnglish.length}`);

      const langsToTranslate = selectedLangs.filter((l) => l !== "en");
      let translations = [];

      if (langsToTranslate.length > 0) {
        const translateResults = await translateWithResume(index, optimizedEnglish, langsToTranslate);
        translations = translateResults.map(r => ({ lang: r.lang, text: r.text || "", error: r.error || null }));
      }

      const allTranslations = [
        { lang: "en", text: optimizedEnglish },
        ...translations.map((t) => ({ lang: t.lang, text: t.text })),
      ];

      const enhancedList = [];
      for (const t of allTranslations) {
        appendLog(`Enhancing ${t.lang} ...`);
        try {
          const enhResp = await callEnhanceAPI(t.lang, t.text, ch.title);
          const enhanced = enhResp.enhanced ?? t.text;
          enhancedList.push({
            lang: t.lang,
            text: t.text,
            enhanced,
            visible: true,
            cleaned: false,
            voice: DEFAULT_VOICES[t.lang] ?? "",
            audioUrl: null,
            audioLoading: false,
            audioError: null,
          });
        } catch (err) {
          enhancedList.push({
            lang: t.lang,
            text: t.text,
            enhanced: t.text,
            visible: true,
            cleaned: false,
            voice: DEFAULT_VOICES[t.lang] ?? "",
            audioUrl: null,
            audioLoading: false,
            audioError: String(err),
          });
          appendLog(`Enhance error for ${t.lang}: ${String(err)}`);
        }
      }

      setChapters((prev) =>
        prev.map((c, i) => (i === index ? { ...c, loading: false, optimized: optimizedEnglish, translations: enhancedList, progress: {} } : c))
      );

      appendLog(`Finished processing chapter ${index + 1}`);
    } catch (err) {
      console.error(err);
      setChapters((prev) => prev.map((c, i) => (i === index ? { ...c, loading: false, error: String(err) } : c)));
      appendLog(`Error: ${String(err)}`);
    }
  }

  /* --- TTS --- (unchanged) */
  async function generateSpeech(chIndex, lang) {
    const ch = chapters[chIndex];
    if (!ch) return;
    const t = (ch.translations || []).find((x) => x.lang === lang);
    if (!t) return alert("Translation not available for " + lang);
    const textToSpeak = (t.enhanced || t.text || "").trim();
    if (!textToSpeak) return alert("No text to synthesize");

    setChapters((prev) =>
      prev.map((c, i) =>
        i === chIndex ? { ...c, translations: c.translations.map(tr => tr.lang === lang ? { ...tr, audioLoading: true, audioError: null } : tr) } : c
      )
    );
    appendLog(`Generating speech for ${lang} (chapter ${chIndex + 1})`);

    try {
      const voice = t.voice || DEFAULT_VOICES[lang] || "";
      const json = await callGenerateSpeechAPI({ text: textToSpeak, language: lang, voice });
      if (!json?.url) throw new Error("No URL returned from TTS");

      setChapters((prev) =>
        prev.map((c, i) => i === chIndex ? { ...c, translations: c.translations.map(tr => tr.lang === lang ? { ...tr, audioUrl: json.url, audioLoading: false, audioError: null } : tr) } : c
        )
      );
      appendLog(`TTS ready: ${lang} -> ${json.url}`);
    } catch (err) {
      console.error("TTS error", err);
      setChapters((prev) =>
        prev.map((c, i) =>
          i === chIndex ? { ...c, translations: c.translations.map(tr => tr.lang === lang ? { ...tr, audioLoading: false, audioError: String(err) } : tr) } : c
        )
      );
      appendLog(`TTS error: ${String(err)}`);
    }
  }

  async function generateAllAudioForChapter(chIndex) {
    const ch = chapters[chIndex];
    if (!ch) return;
    if (!ch.translations || ch.translations.length === 0) return alert("No translations to generate audio for");

    appendLog(`Start Generate All Audio for chapter ${chIndex + 1}`);
    setChapters((prev) => prev.map((c, i) => i === chIndex ? { ...c, generatingAll: true } : c));

    for (const t of ch.translations) {
      if (t.audioUrl) {
        appendLog(`Skipping ${t.lang} (already has audio)`);
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      await generateSpeech(chIndex, t.lang);
    }

    setChapters((prev) => prev.map((c, i) => i === chIndex ? { ...c, generatingAll: false } : c));
    appendLog(`Finished Generate All Audio for chapter ${chIndex + 1}`);
  }

  /* --- Clear markdown functions --- */
  function clearMarkdownAllLanguages(chIndex) {
    setChapters((prev) =>
      prev.map((c, i) =>
        i === chIndex
          ? { ...c, translations: (c.translations || []).map(t => ({ ...t, enhanced: stripMarkdownMarkers(t.enhanced || t.text), cleaned: true })) }
          : c
      )
    );
  }

  /* --- Save chapter to DB (requires bookId) --- */
  async function saveChapterToDB(chIndex) {
    if (!bookId) return alert("Create or set bookId first");
    const c = chapters[chIndex];
    if (!c) return;

    try {
      const payload = {
        bookId,
        chapterTitle: c.title,
        chapterIndex: chIndex + 1,
        original: c.content,
        optimized: c.optim,
        translations: (c.translations || []).map(t => ({ lang: t.lang, text: t.enhanced || t.text, audioUrl: t.audioUrl || null })),
      };

      const res = await fetch("/api/saveChapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      appendLog(`Saved chapter to DB: ${data.chapterId}`);
      alert("Saved to DB");
    } catch (err) {
      console.error(err);
      appendLog("Save error: " + err.message);
      alert("Save failed: " + err.message);
    }
  }

  /* --- Full-run --- */
  async function processAllChapters() {
    if (!bookName) return alert("Please enter book name");
    if (!chapters.length) return alert("No chapters to process");
    setGlobalProcessing(true);
    appendLog("Starting full run");
    for (let i = 0; i < chapters.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await processChapter(i);
    }
    setGlobalProcessing(false);
    appendLog("Full run completed");
  }

  /* --- Dashboard counts --- */
  const dashboardCounts = useMemo(() => {
    if (!page) return {};
    const counts = {};
    if (page.optimized) counts["en"] = page.optimized.length;
    (page.translations || []).forEach((t) => {
      counts[t.lang] = (t.enhanced || t.text || "").length;
    });
    selectedLangs.forEach((l) => { if (!counts[l]) counts[l] = 0; });
    return counts;
  }, [page, selectedLangs]);

  /* --- Editor actions (unchanged) --- */

  function openEditor() {
    setEditingText(page?.content ?? page?.optimized ?? "");
    setEditingTitle(page?.title ?? `Chapter ${pageIndex + 1}`);
    setEditingOpen(true);
  }

  function cancelEdit() {
    setEditingText(page?.content ?? page?.optimized ?? "");
    setEditingTitle(page?.title ?? `Chapter ${pageIndex + 1}`);
    setEditingOpen(false);
  }

  function saveEditedChapter() {
    setChapters(prev => prev.map((c, i) => i === pageIndex ? {
      ...c,
      title: editingTitle || c.title,
      content: editingText,
      optimized: null,
      translations: [],
      loading: false,
      generatingAll: false,
      error: null,
      progress: {},
    } : c));
    setEditingOpen(false);
    appendLog(`Manual chapter text saved for ${editingTitle || page?.title || ("#" + (pageIndex + 1))}`);
    alert("Chapter text updated. Re-run 'Process This Chapter' to re-optimize/translate.");
  }

  /* --- Add chapter manually (one-by-one) --- */
  function addChapterManually() {
    setChapters(prev => {
      const idx = prev.length;
      const newTitle = `Chapter ${idx + 1}`;
      const newCh = {
        title: newTitle,
        content: "",
        optimized: null,
        translations: [],
        loading: false,
        error: null,
        progress: {},
      };
      const next = [...prev, newCh];
      setPageIndex(idx);
      setEditingText("");
      setEditingTitle(newTitle);
      setEditingOpen(true);
      appendLog(`Added manual chapter: ${newTitle}`);
      return next;
    });
  }

  /* --- UI --- */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-indigo-700">Chapter Pages — Translate, Enhance, TTS & Save</h1>
        <p className="text-sm text-gray-600">Create a book, split into chapters, optimize & translate, generate audio and save chapters to DB.</p>
      </header>

      {/* Book creation section */}
      <section className="p-4 border rounded bg-white grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <input value={bookName} onChange={(e) => setBookName(e.target.value)} placeholder="Book name (English)" className="w-full p-2 border rounded" />
          <input value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} placeholder="Author" className="w-full p-2 border rounded" />
          <input value={affiliateLink} onChange={(e) => setAffiliateLink(e.target.value)} placeholder="Affiliate link (optional)" className="w-full p-2 border rounded" />
          <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="Cover image URL (optional)" className="w-full p-2 border rounded" />
          <textarea value={bookIntro} onChange={(e) => setBookIntro(e.target.value)} placeholder="Intro (English)" rows={2} className="w-full p-2 border rounded" />
          <textarea value={bookSummary} onChange={(e) => setBookSummary(e.target.value)} placeholder="Summary (English)" rows={2} className="w-full p-2 border rounded" />
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Tags (comma separated)" className="w-full p-2 border rounded" />
        </div>

        <div className="p-2 border rounded">
          <div className="text-sm font-medium mb-2">Languages for book</div>
          <div className="grid grid-cols-2 gap-1 max-h-40 overflow-auto">
            {TOP_LANGUAGES.map(l => (
              <label key={l.code} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selectedLangs.includes(l.code)} onChange={() => toggleLang(l.code)} />
                <span>{l.label}</span>
              </label>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            <button onClick={createBook} className="w-full px-3 py-2 bg-indigo-600 text-white rounded">Create Book</button>
            <div className="flex gap-2">
              <input placeholder="Or paste existing bookId" className="flex-1 p-2 border rounded" value={bookId} onChange={(e) => setBookIdManually(e.target.value)} />
              <button onClick={() => { if (!bookId) return alert("Enter bookId"); appendLog("BookId set: " + bookId); }} className="px-3 py-2 border rounded">Set</button>
            </div>
            <div className="text-xs text-gray-600">Current bookId: <span className="font-mono">{bookId || "—"}</span></div>
          </div>
        </div>
      </section>

      {/* Raw text / controls */}
      <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} rows={8} className="w-full border p-3 rounded" placeholder="Paste your full text with 'Chapter 1:' or 'Chapter I' headers" />
      <div className="flex gap-2">
        <button onClick={handleFormat} className="px-4 py-2 bg-indigo-600 text-white rounded">Split into Chapters</button>
        <button onClick={() => { setChapters([]); setRawText(""); setLog(""); }} className="px-4 py-2 border rounded">Reset</button>
        <button onClick={processAllChapters} disabled={globalProcessing || !chapters.length} className="px-4 py-2 bg-green-600 text-white rounded">{globalProcessing ? "Processing..." : "Process All"}</button>
        <button onClick={addChapterManually} className="px-4 py-2 border rounded bg-yellow-50">Add Chapter Manually</button>
      </div>

      {/* Dashboard */}
      <section className="p-4 border rounded bg-gray-50">
        <h3 className="font-semibold">Dashboard — Chapter {pageIndex + 1 || "-"} / {chapters.length || 0}</h3>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-6 gap-3">
          {Object.entries(dashboardCounts || {}).map(([lang, count]) => (
            <div key={lang} className="p-2 bg-white border rounded text-sm">
              <div className="font-medium">{TOP_LANGUAGES.find(x => x.code === lang)?.label || lang}</div>
              <div className="text-xs text-gray-600">{count} chars</div>
            </div>
          ))}
        </div>
      </section>

      {/* Chapter viewer */}
      <section className="border rounded p-4 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-500">Viewing</div>
            <h2 className="text-xl font-semibold">{page?.title || "No chapter"}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setPageIndex(p => Math.max(0, p - 1))} className="px-3 py-2 border rounded">Prev</button>
            <button onClick={() => setPageIndex(p => Math.min(chapters.length - 1, p + 1))} className="px-3 py-2 border rounded">Next</button>
            <button onClick={() => processChapter(pageIndex)} disabled={!page || page.loading} className="px-3 py-2 bg-blue-600 text-white rounded">{page?.loading ? "Working..." : "Process This Chapter"}</button>
            <button onClick={() => generateAllAudioForChapter(pageIndex)} disabled={!page || page.generatingAll} className="px-3 py-2 bg-purple-600 text-white rounded">{page?.generatingAll ? "Generating All..." : "Generate All Audio"}</button>
            <button onClick={() => saveChapterToDB(pageIndex)} className="px-3 py-2 bg-amber-400 rounded">Save to DB</button>
            <button onClick={() => clearMarkdownAllLanguages(pageIndex)} className="px-3 py-2 border rounded">Clear markdown (all)</button>
            <button onClick={openEditor} disabled={!page} className="px-3 py-2 border rounded bg-yellow-50">Paste/Edit Text</button>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium mb-1">Original</div>

          {!editingOpen ? (
            <div className="whitespace-pre-wrap text-gray-700 p-3 border rounded bg-gray-50">{page?.content || "No content"}</div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Edit chapter title & content here. Saving replaces the chapter original content and clears any existing optimized/translations so you can re-run processing.</div>
              <input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} className="w-full p-2 border rounded" placeholder="Chapter title (e.g. Chapter I: The Beginning)" />
              <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} rows={8} className="w-full p-3 border rounded" />
              <div className="flex gap-2">
                <button onClick={saveEditedChapter} className="px-3 py-2 bg-green-600 text-white rounded">Save Chapter Text</button>
                <button onClick={cancelEdit} className="px-3 py-2 border rounded">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {page?.optimized && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-1">Optimized (English)</div>
            <div className="whitespace-pre-wrap text-gray-800 p-3 border rounded bg-gray-50">{page.optimized}</div>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {(page?.translations || []).map(t => (
            <div key={t.lang} className="p-3 border rounded bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {TOP_LANGUAGES.find(x => x.code === t.lang)?.label || t.lang}
                    {t.audioUrl ? <span className="text-green-600">✅</span> : null}
                  </div>
                  <div className="text-xs text-gray-500">{(t.enhanced || t.text || "").length} chars</div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setChapters(prev => prev.map((c,i) => i === pageIndex ? { ...c, translations: c.translations.map(tr => tr.lang === t.lang ? { ...tr, visible: !tr.visible } : tr) } : c))} className="px-2 py-1 border rounded text-sm">{t.visible ? "Hide" : "Show"}</button>
                  <button onClick={() => clearMarkdownAllLanguages(pageIndex)} className="px-2 py-1 border rounded text-sm">Clear markdown</button>
                </div>
              </div>

              {t.visible && (
                <>
                  <div className="mt-3 whitespace-pre-wrap text-gray-800 p-3 bg-gray-50 rounded">{t.enhanced || t.text}</div>

                  <div className="mt-3 flex flex-col md:flex-row md:items-center md:gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Voice:</label>
                      <select value={t.voice || DEFAULT_VOICES[t.lang] || ""} onChange={(e) => {
                        const val = e.target.value;
                        setChapters(prev => prev.map((c,i) => i === pageIndex ? { ...c, translations: c.translations.map(tr => tr.lang === t.lang ? {...tr, voice: val} : tr)} : c));
                      }} className="p-1 border rounded text-sm">
                        <option value="">{DEFAULT_VOICES[t.lang] ? `Recommended (${DEFAULT_VOICES[t.lang]})` : 'Default voice'}</option>
                        <option value={DEFAULT_VOICES[t.lang] || ""}>Recommended</option>
                        <option value="alloy">alloy (custom)</option>

                        {/* If language is English, show the englishVoices list */}
                        {t.lang === 'en' && englishVoices.map(v => (
                          <option key={v.key} value={v.key}>{v.displayName} — {v.description}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-2 md:mt-0 flex items-center gap-2">
                      <button onClick={() => generateSpeech(pageIndex, t.lang)} disabled={t.audioLoading} className="px-3 py-2 bg-indigo-600 text-white rounded">{t.audioLoading ? "Generating..." : "Generate Speech"}</button>
                      <button onClick={() => saveChapterToDB(pageIndex)} className="px-3 py-2 border rounded text-sm">Save this chapter</button>
                    </div>

                    <div className="mt-2 md:mt-0">
                      {t.audioUrl ? (
                        <div className="flex items-center gap-3">
                          <audio controls src={t.audioUrl} />
                          <a className="text-xs text-blue-600" href={t.audioUrl} target="_blank" rel="noreferrer">Open</a>
                        </div>
                      ) : t.audioError ? <div className="text-red-500 text-sm">TTS Error: {t.audioError}</div> : null}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Log */}
      <section className="p-3 border rounded bg-black text-white mb-30">
        <div className="text-xs font-semibold">Log</div>
        <pre className="text-xs whitespace-pre-wrap max-h-48 overflow-auto">{log || "No logs yet"}</pre>
      </section>
    </div>
  );
}
