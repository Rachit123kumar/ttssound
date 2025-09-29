// app/generate/page.jsx
"use client";
import React, { useState, useRef } from "react";

export default function Page() {
  const [text, setText] = useState(`यहाँ एक छोटी प्रेरक कहानी है जिसे आप रील्स के लिए इस्तेमाल कर सकते हैं:\n\nमंज़िल की तलाश\n\nएक छोटे से गाँव में रमेश नाम का एक लड़का रहता था...`);
  const [audioUrl, setAudioUrl] = useState("");
  const [status, setStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const audioRef = useRef(null);

  const VIDEO_API = process.env.NEXT_PUBLIC_VIDEO_API_URL || "http://localhost:4000";

  async function generateAudio() {
    setStatus(""); setAudioUrl(""); setVideoUrl("");
    if (!text || text.trim().length < 5) { setStatus("Enter story text"); return; }
    try {
      setLoadingAudio(true);
      setStatus("Requesting Azure TTS...");
      const res = await fetch("/api/azure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: "hi-IN", voice: "hi-IN-SwaraNeural" })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || JSON.stringify(j));
      setAudioUrl(j.url);
      setStatus("Audio ready. You may preview and then generate video.");
      setTimeout(()=> audioRef.current?.play().catch(()=>{}), 200);
    } catch (err) {
      console.error(err);
      setStatus("Audio generation failed: " + (err.message || err));
    } finally { setLoadingAudio(false); }
  }

  async function generateVideo() {
    if (!audioUrl) { setStatus("Generate audio first"); return; }
    try {
      setLoadingVideo(true);
      setStatus("Requesting video generation...");
      const res = await fetch(`${VIDEO_API.replace(/\/+$/, "")}/api/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, audioUrl, aspect: "vertical", fps: 20 })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || JSON.stringify(j));
      let p = j.url || j.path;
      if (p && p.startsWith("/")) p = VIDEO_API.replace(/\/+$/, "") + p;
      setVideoUrl(p);
      setStatus("Video ready.");
    } catch (err) {
      console.error(err);
      setStatus("Video generation failed: " + (err.message || err));
    } finally { setLoadingVideo(false); }
  }

  return (
    <main style={{ padding: 20, fontFamily: "Inter, Arial" }}>
      <h1>Create Reel from Story</h1>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={10} style={{ width: '100%', padding: 12, borderRadius: 8 }} />
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={generateAudio} disabled={loadingAudio} style={{ padding: '10px 12px' }}>{loadingAudio ? 'Generating audio...' : 'Generate Audio'}</button>
        <button onClick={generateVideo} disabled={loadingVideo || !audioUrl} style={{ padding: '10px 12px' }}>{loadingVideo ? 'Generating video...' : 'Generate Video'}</button>
      </div>

      <div style={{ marginTop: 12 }}>{status}</div>

      {audioUrl && (<div style={{ marginTop: 12 }}>
        <h3>Audio</h3>
        <audio ref={audioRef} src={audioUrl} controls style={{ width: 360 }} />
      </div>)}

      {videoUrl && (<div style={{ marginTop: 12 }}>
        <h3>Video</h3>
        <video src={videoUrl} controls style={{ width: 360 }} />
        <div style={{ marginTop: 8 }}>
          <a href={videoUrl} target="_blank" rel="noreferrer">Open</a>
          <a href={videoUrl} download style={{ marginLeft: 12 }}>Download</a>
        </div>
      </div>)}
    </main>
  );
}
