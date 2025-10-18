"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FaCog, FaPlay, FaDownload, FaArrowUp, FaArrowDown, FaTrash, FaPlus, FaUsers, FaMicrophone, FaVideo, FaHome, FaSave, FaRedo, FaSearch } from "react-icons/fa";

/**
 Enhanced MultiSpeakerStudio — UI/UX improvements
 - Preserves all original logic and behavior (no changes to API, buildPayload, run, download, templates, etc.)
 - Adds voice-language filtering, search-by-voice, nicer labels and badges
 - Improves spacing, buttons and accessibility hints
 - DOES NOT remove or change core functionality
*/

// Helper to generate an ID — called only client-side (safe)
function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Math.floor(Math.random() * 1e9) + "-" + Date.now();
}

export default function MultiSpeakerStudioSingleFile() {
  // deterministic initial entries (stable IDs - avoid Date.now in initial state)
  const [entries, setEntries] = useState(() => [
    { id: "e1", speaker: 1, text: "Hello! We're excited to show you our native speech capabilities.", style: "warm" },
    { id: "e2", speaker: 2, text: "Where you can direct a voice, create realistic dialog, and so much more. Edit these placeholders to get started.", style: "calm" },
  ]);

  // Raw text editor and import flag
  const [rawText, setRawText] = useState("");
  const [rawImported, setRawImported] = useState(false);

  const [styleInstructions, setStyleInstructions] = useState("Read aloud in a warm, welcoming tone");
  const [isRunning, setIsRunning] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");

  // voice defaults (deterministic)
  const DEFAULT_VOICE_S1 = "en-US-JennyNeural";
  const DEFAULT_VOICE_S2 = "hi-IN-AnanyaNeural";

  // voice state: initialize to defaults only (do NOT read localStorage here)
  const [voiceS1, setVoiceS1] = useState(DEFAULT_VOICE_S1);
  const [voiceS2, setVoiceS2] = useState(DEFAULT_VOICE_S2);

  // UI-only filters for better voice selection (no change to persisted voice variables)
  const [filterLangS1, setFilterLangS1] = useState("all");
  const [filterLangS2, setFilterLangS2] = useState("all");
  const [searchVoiceS1, setSearchVoiceS1] = useState("");
  const [searchVoiceS2, setSearchVoiceS2] = useState("");

  // responsive overlay state
  const [showSettingsOverlay, setShowSettingsOverlay] = useState(false);

  // Available voices (sample English + Hindi)
  const AVAILABLE_VOICES = [
    { label: "en-US-JennyNeural", value: "en-US-JennyNeural" },
    { label: "en-US-GuyNeural", value: "en-US-GuyNeural" },
    { label: "en-GB-LibbyNeural", value: "en-GB-LibbyNeural" },
    { label: "en-GB-SoniaNeural", value: "en-GB-SoniaNeural" },
    { label: "en-AU-NatashaNeural", value: "en-AU-NatashaNeural" },
    { label: "en-IN-NeerjaNeural", value: "en-IN-NeerjaNeural" },
    { label: "hi-IN-AaravNeural", value: "hi-IN-AaravNeural" },
    { label: "hi-IN-AnanyaNeural", value: "hi-IN-AnanyaNeural" },
    { label: "hi-IN-KavyaNeural", value: "hi-IN-KavyaNeural" },
    { label: "hi-IN-RehaanNeural", value: "hi-IN-RehaanNeural" },
    { label: "hi-IN-SwaraNeural", value: "hi-IN-SwaraNeural" },
    { label: "hi-IN-MadhurNeural", value: "hi-IN-MadhurNeural" },
    { label: "hi-IN-AartiNeural", value: "hi-IN-AartiNeural" },
    { label: "hi-IN-ArjunNeural", value: "hi-IN-ArjunNeural" },
  ];

  // compute unique language groups like 'en-US', 'hi-IN', 'en-GB', etc.
  const LANG_OPTIONS = useMemo(() => {
    const set = new Set();
    for (const v of AVAILABLE_VOICES) {
      const parts = v.value.split("-");
      const lang = parts.slice(0, 2).join("-");
      set.add(lang);
    }
    return ["all", ...Array.from(set)];
  }, [AVAILABLE_VOICES]);

  // load persisted voices from localStorage on client (useEffect)
  useEffect(() => {
    try {
      const s1 = localStorage.getItem("ms_voice_s1");
      const s2 = localStorage.getItem("ms_voice_s2");
      if (s1) setVoiceS1(s1);
      if (s2) setVoiceS2(s2);
    } catch (e) {
      // ignore errors (privacy / blocked storage)
    }
    // also keep storage events synced across tabs
    const onStorage = (ev) => {
      if (!ev.key) return;
      if (ev.key === "ms_voice_s1" && ev.newValue) setVoiceS1(ev.newValue);
      if (ev.key === "ms_voice_s2" && ev.newValue) setVoiceS2(ev.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // persist voice changes to localStorage on client
  useEffect(() => {
    try {
      localStorage.setItem("ms_voice_s1", voiceS1);
      localStorage.setItem("ms_voice_s2", voiceS2);
    } catch (e) {}
  }, [voiceS1, voiceS2]);

  // ----------------------------
  // Raw parsing logic — safe: runs on client only (useEffect / user action)
  // Accept lines like "Speaker 1: Hello" — unlabeled lines alternate starting at 1
  // ----------------------------
  function parseRawToEntries(raw) {
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) return [];

    const parsed = [];
    let autoSpeakerNext = 1;
    const labelRegex = /^Speaker\s*([12])\s*[:\-]\s*(.*)$/i;

    for (const line of lines) {
      const m = line.match(labelRegex);
      if (m) {
        const speaker = Number(m[1]);
        const text = m[2].trim();
        parsed.push({ id: generateId(), speaker, text, style: "calm" });
        autoSpeakerNext = speaker === 1 ? 2 : 1;
      } else {
        const speaker = autoSpeakerNext;
        parsed.push({ id: generateId(), speaker, text: line, style: "calm" });
        autoSpeakerNext = speaker === 1 ? 2 : 1;
      }
    }
    return parsed;
  }

  // Auto-import raw -> entries (client-only, via useEffect)
  useEffect(() => {
    if (rawText && rawText.trim() && !rawImported) {
      const imported = parseRawToEntries(rawText);
      if (imported.length > 0) {
        setEntries(imported);
        setRawImported(true);
      }
    }
    if (!rawText || !rawText.trim()) {
      setRawImported(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawText]);

  // manual re-import
  function reimportRaw() {
    if (!rawText || !rawText.trim()) return;
    const imported = parseRawToEntries(rawText);
    if (imported.length > 0) {
      setEntries(imported);
      setRawImported(true);
    }
  }

  // Editor helpers — generate IDs only on client interactions
  function addNextEntry() {
    const last = entries[entries.length - 1];
    const nextSpeaker = last ? (last.speaker === 1 ? 2 : 1) : 1;
    setEntries((prev) => [...prev, { id: generateId(), speaker: nextSpeaker, text: "", style: "calm" }]);
  }

  function updateEntry(id, patch) {
    setEntries((prev) => prev.map((en) => (en.id === id ? { ...en, ...patch } : en)));
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((en) => en.id !== id));
  }

  function moveEntry(id, dir) {
    setEntries((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = prev.slice();
      const [item] = copy.splice(idx, 1);
      copy.splice(newIdx, 0, item);
      return copy;
    });
  }

  // Preview (deterministic based on entries)
  const generatedRaw = useMemo(() => entries.map((en) => `Speaker ${en.speaker}: ${en.text || ""}`).join("\n"), [entries]);

  // Build payload from entries (always use entries — raw imported first)
  function buildPayload() {
    const payloadSpeakers = entries.map((en) => ({
      name: `Speaker ${en.speaker}`,
      voice: en.speaker === 1 ? voiceS1 : voiceS2,
      lines: [{ text: en.text || "", style: en.style || "calm" }],
    }));
    return { speakers: payloadSpeakers };
  }

  // Run — calls your /api/multispeaker endpoint
  async function handleRun() {
    setIsRunning(true);
    setError("");
    setAudioUrl("");

    try {
      const payload = buildPayload();
      const res = await fetch("/api/multispeaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Server returned an error");
      } else {
        setAudioUrl(json.url);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || String(err));
    } finally {
      setIsRunning(false);
    }
  }

  // Download — fetch blob (CORS may block; fallback opens URL)
  async function handleDownload() {
    if (!audioUrl) return;
    try {
      const res = await fetch(audioUrl, { mode: "cors" });
      if (!res.ok) throw new Error("Failed to fetch audio");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      a.href = blobUrl;
      a.download = `multispeaker-${ts}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      window.open(audioUrl, "_blank", "noopener");
    }
  }

  // Templates (create entries — use generateId client-side)
  function applyTemplate(type) {
    if (type === "voice-assistant") {
      setRawText("");
      setEntries([
     { id: generateId(), speaker: 1, text: "Welcome back to ‘Life Talks’ — आज हम बात करेंगे उन छोटे पलों की जो ज़िंदगी को ख़ास बनाते हैं।", style: "warm" },
{ id: generateId(), speaker: 2, text: "Yes! कभी-कभी एक छोटी सी मुस्कान या किसी अजनबी की मदद पूरा दिन बदल देती है।", style: "thoughtful" },
{ id: generateId(), speaker: 1, text: "Exactly. मुझे याद है एक बार बारिश में मेरी गाड़ी बीच रास्ते में बंद हो गई थी…", style: "narrative" },
{ id: generateId(), speaker: 1, text: "…और तभी एक unknown आदमी ने बिना कुछ कहे गाड़ी push की और मुझे बाहर निकलने में मदद की।", style: "emotional" },
{ id: generateId(), speaker: 2, text: "वाह! ऐसे moments हमें humanity की ताकत याद दिलाते हैं।", style: "inspired" },
{ id: generateId(), speaker: 1, text: "True. और अक्सर ये पल हमें बिना plan के मिलते हैं, लेकिन दिल पर गहरी छाप छोड़ जाते हैं।", style: "reflective" },
{ id: generateId(), speaker: 2, text: "Listeners, हमें भी बताइए — आपके साथ ऐसा कौन सा छोटा सा moment हुआ जिसने आपका दिन बना दिया?", style: "inviting" },
{ id: generateId(), speaker: 1, text: "आप हमें Instagram और X पर DM कर सकते हैं @LifeTalksPodcast पर. We’d love to feature your story!", style: "friendly" },
{ id: generateId(), speaker: 2, text: "Stay tuned — अगले segment में हम एक listener की कहानी सुनेंगे जिसने एक stranger से सीखी kindness की सबसे प्यारी lesson.", style: "teasing" },
{ id: generateId(), speaker: 1, text: "You’re listening to Life Talks. मैं हूँ आरव…", style: "warm" },
{ id: generateId(), speaker: 2, text: "…और मैं हूँ सिया. Let’s dive in!", style: "excited" }

      ]);
      setRawImported(false);
    }
    if (type === "podcast") {
      setRawText("");
      setEntries([
       { id: generateId(), speaker: 1, text: "Good morning! आज मौसम कितना सुहाना है ना?", style: "warm" },
{ id: generateId(), speaker: 2, text: "हाँ, बिलकुल! हल्की हवा और धूप — perfect Sunday vibe.", style: "cheerful" },
{ id: generateId(), speaker: 1, text: "सोचा था पार्क में थोड़ा walk कर लूँ, दिमाग fresh हो जाएगा.", style: "calm" },
{ id: generateId(), speaker: 2, text: "Great idea! वैसे भी पूरे हफ़्ते काम से थक गए थे।", style: "relaxed" },
{ id: generateId(), speaker: 1, text: "चलो फिर, coffee लेकर चलते हैं और थोड़ा gossip भी हो जाएगा।", style: "playful" },
{ id: generateId(), speaker: 2, text: "Perfect! तुम coffee लाओ, मैं bench पकड़ता हूँ — deal?", style: "excited" },
{ id: generateId(), speaker: 1, text: "Deal! आज का दिन अच्छा जाने वाला है।", style: "hopeful" }

      ]);
      setRawImported(false);
    }
    if (type === "movie") {
      setRawText("");
      setEntries([
        { id: generateId(), speaker: 1, text: "We can't go back — not now.", style: "angry" },
        { id: generateId(), speaker: 2, text: "There's always another way.", style: "calm" },
      ]);
      setRawImported(false);
    }
  }

  // UI helpers: compute filtered voice lists without changing stored voice values
  const filteredVoicesFor = (filterLang, search) => {
    const q = (search || "").trim().toLowerCase();
    return AVAILABLE_VOICES.filter((v) => {
      const parts = v.value.split("-");
      const lang = parts.slice(0, 2).join("-");
      const name = parts[parts.length - 1];
      if (filterLang && filterLang !== "all" && lang !== filterLang) return false;
      if (q && !(`${lang} ${name} ${v.label}`.toLowerCase().includes(q))) return false;
      return true;
    });
  };

  // UI (Enhanced design with modern styling)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/60">
        <nav className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span>Hearo</span>
              </Link>
              <div className="hidden md:flex items-center space-x-1 text-sm text-gray-600">
                <span>/</span>
                <span className="text-indigo-600 font-medium">Multi-Speaker Studio</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/" className="hidden sm:flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                <FaHome className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link href="/generateVideo" className="hidden sm:flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                <FaVideo className="w-4 h-4" />
                <span>Video Generator</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="p-4 sm:p-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
              Multi-Speaker <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Studio</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create realistic dialogues between multiple speakers with AI-powered voice generation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: Raw structure */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaUsers className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Script Import</h3>
                    <p className="text-sm text-gray-500">Paste structured text to auto-import</p>
                  </div>
                </div>

                <textarea
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    setRawImported(false);
                  }}
                  placeholder={`Speaker 1: Hello there!\nSpeaker 2: Hi! How are you doing?\nSpeaker 1: I'm great, thanks for asking!`}
                  className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                />

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={reimportRaw}
                    disabled={!rawText.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <span>Re-import Raw</span>
                  </button>
                  <div className={`text-sm px-3 py-1 rounded-full ${rawImported ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {rawImported ? "✓ Imported" : "Ready to import"}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Import Preview</h4>
                  <div className="bg-gray-50 rounded-xl p-4 h-40 overflow-y-auto border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">{generatedRaw}</pre>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE: Script builder */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FaMicrophone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Script Builder</h3>
                    <p className="text-sm text-gray-500">Build and edit your dialogue sequence</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 max-h-[60vh] pr-2">
                  {entries.map((en, idx) => (
                    <div key={en.id} className="border-2 border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors duration-200 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ background: en.speaker === 1 ? '#f59e0b' : '#8b5cf6' }}
                          >
                            S{en.speaker}
                          </div>
                          <div>
                            <strong className="text-gray-900">{`Speaker ${en.speaker}`}</strong>
                            <span className="text-xs text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded-full">Turn {idx + 1}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => moveEntry(en.id, -1)} 
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                            title="Move up"
                          >
                            <FaArrowUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => moveEntry(en.id, +1)} 
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                            title="Move down"
                          >
                            <FaArrowDown className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => removeEntry(en.id)} 
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <textarea 
                          value={en.text} 
                          onChange={(e) => updateEntry(en.id, { text: e.target.value })} 
                          className="w-full p-3 text-sm border-2 border-gray-200 rounded-xl resize-none h-20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                          placeholder="Enter dialogue text..."
                        />
                        <div className="flex items-center justify-between">
                          <select 
                            value={en.style} 
                            onChange={(e) => updateEntry(en.id, { style: e.target.value })} 
                            className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                          >
                            <option value="calm">😌 Calm</option>
                            <option value="warm">🔥 Warm</option>
                            <option value="excited">🎉 Excited</option>
                            <option value="angry">😠 Angry</option>
                            <option value="friendly">😊 Friendly</option>
                          </select>
                          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Voice: {en.speaker === 1 ? voiceS1.split('-').pop() : voiceS2.split('-').pop()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex space-x-3 pt-4">
                    <button 
                      onClick={addNextEntry} 
                      className="flex items-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <FaPlus className="w-4 h-4" />
                      <span>Add Dialogue</span>
                    </button>
                    <button 
                      onClick={() => setEntries((prev) => prev.map((p) => ({ ...p, text: "" })))} 
                      className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors duration-200"
                    >
                      Clear All Text
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Run/Settings */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FaCog className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Run Settings</h3>
                    <p className="text-sm text-gray-500">Configure voices and generate audio</p>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Voice Settings</h4>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-3 rounded-xl border">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Speaker 1</label>
                          <div className="text-xs text-gray-500">Selected: <strong>{voiceS1.split('-').pop()}</strong></div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <select value={filterLangS1} onChange={(e) => setFilterLangS1(e.target.value)} className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500">
                            {LANG_OPTIONS.map((l) => (
                              <option key={l} value={l}>{l === 'all' ? 'All languages' : l}</option>
                            ))}
                          </select>

                          <div className="relative flex-1">
                            <input
                              value={searchVoiceS1}
                              onChange={(e) => setSearchVoiceS1(e.target.value)}
                              placeholder="Search voice name..."
                              className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500"
                            />
                            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                          </div>
                        </div>

                        <select 
                          value={voiceS1} 
                          onChange={(e) => setVoiceS1(e.target.value)} 
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                        >
                          {filteredVoicesFor(filterLangS1, searchVoiceS1).map((v) => {
                            const parts = v.value.split('-');
                            const lang = parts.slice(0, 2).join('-');
                            const name = parts[parts.length - 1];
                            return (
                              <option key={v.value} value={v.value}>{`${lang} • ${name}`}</option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Speaker 2</label>
                          <div className="text-xs text-gray-500">Selected: <strong>{voiceS2.split('-').pop()}</strong></div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <select value={filterLangS2} onChange={(e) => setFilterLangS2(e.target.value)} className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500">
                            {LANG_OPTIONS.map((l) => (
                              <option key={l} value={l}>{l === 'all' ? 'All languages' : l}</option>
                            ))}
                          </select>

                          <div className="relative flex-1">
                            <input
                              value={searchVoiceS2}
                              onChange={(e) => setSearchVoiceS2(e.target.value)}
                              placeholder="Search voice name..."
                              className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500"
                            />
                            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                          </div>
                        </div>

                        <select 
                          value={voiceS2} 
                          onChange={(e) => setVoiceS2(e.target.value)} 
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                        >
                          {filteredVoicesFor(filterLangS2, searchVoiceS2).map((v) => {
                            const parts = v.value.split('-');
                            const lang = parts.slice(0, 2).join('-');
                            const name = parts[parts.length - 1];
                            return (
                              <option key={v.value} value={v.value}>{`${lang} • ${name}`}</option>
                            );
                          })}
                        </select>
                      </div>

                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Quick Templates</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <button 
                        onClick={() => applyTemplate("voice-assistant")} 
                        className="px-4 py-3 text-left border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
                      >
                        <div className="font-medium text-gray-900">Voice Assistant</div>
                        <div className="text-sm text-gray-500">Customer service dialogue</div>
                      </button>
                      <button 
                        onClick={() => applyTemplate("podcast")} 
                        className="px-4 py-3 text-left border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200"
                      >
                        <div className="font-medium text-gray-900">Podcast</div>
                        <div className="text-sm text-gray-500">Interview conversation</div>
                      </button>
                      <button 
                        onClick={() => applyTemplate("movie")} 
                        className="px-4 py-3 text-left border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-colors duration-200"
                      >
                        <div className="font-medium text-gray-900">Movie Scene</div>
                        <div className="text-sm text-gray-500">Dramatic dialogue</div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <button 
                    onClick={handleRun} 
                    disabled={isRunning || entries.length === 0}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <FaPlay className="w-5 h-5" />
                    <span className="font-semibold">{isRunning ? "Generating Audio..." : "Generate Audio"}</span>
                  </button>

                  {error && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <div className="text-red-700 text-sm font-medium">{error}</div>
                    </div>
                  )}

                  {audioUrl && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="text-green-700 text-sm font-medium mb-3">Audio Generated Successfully!</div>
                      <audio controls src={audioUrl} className="w-full mb-3 rounded-lg" />
                      <div className="flex space-x-3">
                        <button 
                          onClick={handleDownload}
                          className="flex items-center space-x-2 flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                        >
                          <FaDownload className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Settings Button */}
          <button
            className="lg:hidden fixed bottom-6 right-6 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-2xl border-2 border-white hover:bg-indigo-700 transition-colors duration-200"
            title="Open voice settings"
            onClick={() => setShowSettingsOverlay(true)}
          >
            <FaCog className="w-6 h-6" />
          </button>

          {/* Mobile Settings Overlay */}
          {showSettingsOverlay && (
            <div className="fixed inset-0 z-50 flex items-end lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowSettingsOverlay(false)}></div>
              <div className="relative w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl text-gray-900">Voice Settings</h3>
                  <button 
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    onClick={() => setShowSettingsOverlay(false)}
                  >
                    <FaCog className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Voice Configuration</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Speaker 1 Voice</label>
                        <select 
                          value={voiceS1} 
                          onChange={(e) => setVoiceS1(e.target.value)} 
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500"
                        >
                          {AVAILABLE_VOICES.map((v) => (
                            <option key={v.value} value={v.value}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Speaker 2 Voice</label>
                        <select 
                          value={voiceS2} 
                          onChange={(e) => setVoiceS2(e.target.value)} 
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500"
                        >
                          {AVAILABLE_VOICES.map((v) => (
                            <option key={v.value} value={v.value}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            try {
                              localStorage.setItem("ms_voice_s1", voiceS1);
                              localStorage.setItem("ms_voice_s2", voiceS2);
                              window.dispatchEvent(new Event("storage"));
                            } catch (e) {}
                            setShowSettingsOverlay(false);
                          }}
                          className="flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200"
                        >
                          <FaSave className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => {
                            setVoiceS1(DEFAULT_VOICE_S1);
                            setVoiceS2(DEFAULT_VOICE_S2);
                            try {
                              localStorage.setItem("ms_voice_s1", DEFAULT_VOICE_S1);
                              localStorage.setItem("ms_voice_s2", DEFAULT_VOICE_S2);
                              window.dispatchEvent(new Event("storage"));
                            } catch (e) {}
                          }}
                          className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-colors duration-200"
                        >
                          <FaRedo className="w-4 h-4" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add the missing Link component import
const Link = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
);
