"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 MultiSpeakerStudio — single-file client component (hydration-safe)
 - Avoids Date.now()/Math.random()/localStorage reads during SSR.
 - Loads localStorage on client via useEffect.
 - Generates IDs only on client actions.
 - Preserves all previous functionality: raw->parse->review->run, download, templates,
   responsive settings icon, scrollable script builder, voice lists (English + Hindi).
 - Tailwind CSS utilities assumed.
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
        { id: generateId(), speaker: 1, text: "Hello — how can I help you today?", style: "friendly" },
        { id: generateId(), speaker: 2, text: "I need help booking a flight.", style: "calm" },
      ]);
      setRawImported(false);
    }
    if (type === "podcast") {
      setRawText("");
      setEntries([
        { id: generateId(), speaker: 1, text: "Welcome to the show — today we'll talk about building delightful audio UIs.", style: "warm" },
        { id: generateId(), speaker: 2, text: "Thanks — excited to be here!", style: "excited" },
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

  // UI (preserves design + responsiveness + scrollable script builder)
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
        {/* LEFT: Raw structure (hidden on mobile) */}
        <div className="hidden sm:block col-span-12 sm:col-span-4 lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <h3 className="font-semibold mb-2">Raw structure</h3>
            <p className="text-sm text-gray-500 mb-3">
              Paste or edit raw structured text here. If present it will be parsed into the script builder automatically for review.
            </p>

            <textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setRawImported(false);
              }}
              placeholder="Write raw structured text here (e.g. `Speaker 1: Hello` on each line)."
              className="w-full h-48 p-3 border rounded resize-none text-sm"
            />

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  if (!rawText || !rawText.trim()) return;
                  reimportRaw();
                }}
                className="px-3 py-1 border rounded text-sm"
              >
                Re-import raw
              </button>
              <div className="text-xs text-gray-500">{rawImported ? "Imported into script builder" : "Not yet imported"}</div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-1">Preview (what will be imported)</h4>
              <pre className="whitespace-pre-wrap text-xs text-gray-700 bg-gray-100 p-3 rounded h-40 overflow-auto">{generatedRaw}</pre>
            </div>
          </div>
        </div>

        {/* MIDDLE: Script builder (scrollable Y-axis) */}
        <div className="col-span-12 sm:col-span-8 lg:col-span-5">
          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <h3 className="font-semibold mb-2">Script builder</h3>

            <label className="block text-sm text-gray-600 mb-1">Style instructions</label>
            <input value={styleInstructions} onChange={(e) => setStyleInstructions(e.target.value)} className="w-full border p-2 rounded mb-4 text-sm" />

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[70vh]">
              {entries.map((en, idx) => (
                <div key={en.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: en.speaker === 1 ? "#fbbf24" : "#c7b9ff" }} />
                      <strong>{`Speaker ${en.speaker}`}</strong>
                      <span className="text-xs text-gray-500 ml-2">{`turn ${idx + 1}`}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => moveEntry(en.id, -1)} className="text-xs px-2 py-1 border rounded" title="Move up">
                        ↑
                      </button>
                      <button onClick={() => moveEntry(en.id, +1)} className="text-xs px-2 py-1 border rounded" title="Move down">
                        ↓
                      </button>
                      <button onClick={() => removeEntry(en.id)} className="text-xs px-2 py-1 border rounded text-red-600" title="Delete">
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <textarea value={en.text} onChange={(e) => updateEntry(en.id, { text: e.target.value })} className="w-full p-2 text-sm border rounded resize-none h-16" />
                    <div className="flex items-center gap-2">
                      <select value={en.style} onChange={(e) => updateEntry(en.id, { style: e.target.value })} className="text-sm border px-2 py-1 rounded">
                        <option value="calm">calm</option>
                        <option value="warm">warm</option>
                        <option value="excited">excited</option>
                        <option value="angry">angry</option>
                        <option value="friendly">friendly</option>
                      </select>
                      <div className="text-xs text-gray-500 ml-auto">Voice: {en.speaker === 1 ? (voiceS1 || "(not set)") : (voiceS2 || "(not set)")}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pb-6">
                <button onClick={addNextEntry} className="px-3 py-1 border rounded">
                  + Add dialog
                </button>
                <button onClick={() => setEntries((prev) => prev.map((p) => ({ ...p, text: "" })))} className="px-3 py-1 border rounded">
                  Clear texts
                </button>
                <button
                  onClick={() => {
                    setEntries((prev) =>
                      prev.map((p, i) => ({
                        ...p,
                        speaker: i % 2 === 0 ? 1 : 2,
                      }))
                    );
                  }}
                  className="px-3 py-1 border rounded"
                >
                  Normalize alternation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Run/Settings (desktop full panel) */}
        <div className="hidden lg:block col-span-3">
          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <h3 className="font-semibold mb-2">Run settings</h3>

            {/* <label className="text-sm text-gray-500">Model</label>
            <select className="w-full p-2 border rounded mb-4 text-sm">
              <option>Gemini 2.5 Pro Preview TTS</option>
            </select> */}

            <div className="mb-3">
              <div className="text-sm font-medium">Voice settings</div>
              <div className="text-xs text-gray-500">Customize each speaker voice (saved locally)</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Speaker 1</div>
                  <div className="text-xs text-gray-500">Primary voice for Speaker 1</div>
                </div>
                <select value={voiceS1} onChange={(e) => setVoiceS1(e.target.value)} className="px-2 py-1 border rounded text-sm">
                  {AVAILABLE_VOICES.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Speaker 2</div>
                  <div className="text-xs text-gray-500">Primary voice for Speaker 2</div>
                </div>
                <select value={voiceS2} onChange={(e) => setVoiceS2(e.target.value)} className="px-2 py-1 border rounded text-sm">
                  {AVAILABLE_VOICES.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    try {
                      localStorage.setItem("ms_voice_s1", voiceS1);
                      localStorage.setItem("ms_voice_s2", voiceS2);
                      window.dispatchEvent(new Event("storage"));
                    } catch (e) {}
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Save voices
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
                  className="px-3 py-1 border rounded"
                >
                  Reset to defaults
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium mb-1">Quick templates</div>
              <div className="flex gap-2">
                <button onClick={() => applyTemplate("voice-assistant")} className="px-3 py-1 border rounded text-sm">
                  Audio voice assistant
                </button>
                <button onClick={() => applyTemplate("podcast")} className="px-3 py-1 border rounded text-sm">
                  Podcast transcript
                </button>
                <button onClick={() => applyTemplate("movie")} className="px-3 py-1 border rounded text-sm">
                  Movie scene script
                </button>
              </div>
            </div>

            <div className="mt-auto">
              <button onClick={handleRun} disabled={isRunning || entries.length === 0} className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
                {isRunning ? "Running..." : "Run"}
              </button>

              {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

              {audioUrl && (
                <div className="mt-3">
                  <div className="text-sm text-gray-600">Output</div>
                  <audio controls src={audioUrl} className="mt-2 w-full" />
                  <div className="flex gap-2 mt-2">
                    {/* <a href={audioUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600">
                      Open in new tab
                    </a> */}
                    <button onClick={handleDownload} className="px-3 py-1 border rounded text-sm">
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings icon for tablet/mobile */}
        <button
          className="lg:hidden fixed bottom-6 right-4 z-40 bg-white p-3 rounded-full shadow border"
          title="Open voice settings"
          onClick={() => setShowSettingsOverlay(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0a1.724 1.724 0 002.547 1.01c.837-.5 1.84.22 1.62 1.176a1.724 1.724 0 001.564 2.254c.98.126 1.04 1.525.103 1.97a1.724 1.724 0 00-.96 1.566c.01.99-.9 1.69-1.746 1.248a1.724 1.724 0 00-1.873.37c-.66.6-1.9.29-2.18-.54-.3-.92-1.603-.92-1.902 0-.28.83-1.52 1.14-2.18.54a1.724 1.724 0 00-1.873-.37c-.847.442-1.757-.258-1.746-1.248a1.724 1.724 0 00-.96-1.566c-.937-.445-.877-1.844.103-1.97a1.724 1.724 0 001.564-2.254c-.22-.956.783-1.676 1.62-1.176.94.57 2.2-.09 2.547-1.01z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Settings overlay for mobile/tablet */}
        {showSettingsOverlay && (
          <div className="fixed inset-0 z-50 flex items-end lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowSettingsOverlay(false)}></div>
            <div className="relative w-full bg-white rounded-t-lg p-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Voice settings</h3>
                <button className="text-sm px-2 py-1 border rounded" onClick={() => setShowSettingsOverlay(false)}>
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Speaker 1</div>
                    <div className="text-xs text-gray-500">Primary voice for Speaker 1</div>
                  </div>
                  <select value={voiceS1} onChange={(e) => setVoiceS1(e.target.value)} className="px-2 py-1 border rounded text-sm">
                    {AVAILABLE_VOICES.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Speaker 2</div>
                    <div className="text-xs text-gray-500">Primary voice for Speaker 2</div>
                  </div>
                  <select value={voiceS2} onChange={(e) => setVoiceS2(e.target.value)} className="px-2 py-1 border rounded text-sm">
                    {AVAILABLE_VOICES.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      try {
                        localStorage.setItem("ms_voice_s1", voiceS1);
                        localStorage.setItem("ms_voice_s2", voiceS2);
                        window.dispatchEvent(new Event("storage"));
                      } catch (e) {}
                      setShowSettingsOverlay(false);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Save voices
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
                    className="px-3 py-1 border rounded"
                  >
                    Reset defaults
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer run/output */}
      <div className="max-w-[1400px] mx-auto mt-6 px-0 sm:px-6">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div>
              <button onClick={handleRun} disabled={isRunning || entries.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
                {isRunning ? "Running..." : "Run"}
              </button>
            </div>

            <div className="text-sm text-gray-600">
              <div>Entries: {entries.length}</div>
            </div>
          </div>

          <div className="flex gap-3 items-center w-full sm:w-auto">
            {audioUrl && (
              <>
                <audio controls src={audioUrl} className="w-full sm:w-auto" />
                <button onClick={handleDownload} className="px-3 py-1 border rounded text-sm">
                  Download
                </button>
                {/* <a href={audioUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600">
                  Open
                </a> */}
              </>
            )}

            {error && <div className="text-red-600 text-sm">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
