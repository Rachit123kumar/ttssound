// app/_components/PlayerProvider.jsx
"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";

// Shared language map (same as your client)
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

const PlayerContext = createContext(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}

export default function PlayerProvider({ children }) {
  // playlist: [ { chapterId, title, audioMap } ]
  const audioRef = useRef(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentBook, setCurrentBook] = useState(null); // { bookId, title }
  const [isPlaying, setIsPlaying] = useState(false);
  const [playLangCode, setPlayLangCode] = useState("en");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // helpers
  function getAudioUrlForLang(audioMap = {}, preferred = "en") {
    if (!audioMap) return null;
    if (audioMap[preferred]) return audioMap[preferred];
    if (audioMap.en) return audioMap.en;
    const vals = Object.values(audioMap);
    return vals.length ? vals[0] : null;
  }

  // core: load url and play
  function loadAndPlay(url) {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.src = url;
      const p = a.play();
      if (p && p.then) {
        p.then(() => setIsPlaying(true)).catch((e) => {
          console.warn("Playback error", e);
          setIsPlaying(false);
        });
      }
    } catch (e) {
      console.warn("loadAndPlay failed", e);
    }
  }

  // play a playlist object (replace entire playlist)
  function playPlaylist(pl = [], startIndex = 0, bookMeta = null) {
    if (!Array.isArray(pl) || pl.length === 0) {
      console.warn("empty playlist");
      return;
    }
    setPlaylist(pl);
    setCurrentBook(bookMeta);
    setCurrentIndex(startIndex);
    // choose url for start
    const first = pl[startIndex];
    const url = getAudioUrlForLang(first.audioMap || {}, playLangCode);
    if (!url) {
      const fallback = getAudioUrlForLang(first.audioMap || {}, "en");
      if (!fallback) {
        alert("No audio available for selected language (or fallback).");
        return;
      }
      loadAndPlay(fallback);
      return;
    }
    loadAndPlay(url);
  }

  // play a single chapter (insert as single-item playlist or play immediately)
  function playSingleChapter({ chapterId, title, audioMap }, bookMeta = null) {
    const pl = [{ chapterId, title, audioMap }];
    playPlaylist(pl, 0, bookMeta);
  }

  // toggle play/pause
  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
    } else {
      const p = a.play();
      if (p && p.then) p.catch((e) => console.warn("playcatch", e));
    }
  }

  // prev/next controls
  function nextTrack() {
    if (!playlist.length) return;
    const next = Math.min(currentIndex + 1, playlist.length - 1);
    if (next === currentIndex) return;
    const url = getAudioUrlForLang(playlist[next].audioMap, playLangCode);
    if (!url) {
      // find next with audio
      let found = null;
      for (let i = next; i < playlist.length; i++) {
        const u = getAudioUrlForLang(playlist[i].audioMap, playLangCode);
        if (u) { found = { idx: i, url: u }; break; }
      }
      if (!found) { alert("No further audio available"); return; }
      setCurrentIndex(found.idx);
      loadAndPlay(found.url);
      return;
    }
    setCurrentIndex(next);
    loadAndPlay(url);
  }

  function prevTrack() {
    if (!playlist.length) return;
    const prev = Math.max(0, currentIndex - 1);
    const url = getAudioUrlForLang(playlist[prev].audioMap, playLangCode);
    if (!url) { alert("No audio for previous track"); return; }
    setCurrentIndex(prev);
    loadAndPlay(url);
  }

  // switch language variant for current track
  useEffect(() => {
    if (!playlist.length) return;
    const current = playlist[currentIndex];
    const url = getAudioUrlForLang(current.audioMap, playLangCode);
    const fallback = getAudioUrlForLang(current.audioMap, "en");
    const final = url || fallback;
    if (!final) {
      console.warn("No audio for this track on selected language");
      return;
    }
    loadAndPlay(final);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playLangCode]);

  // audio element listeners
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    function onTime() {
      setProgress(a.currentTime);
      setDuration(a.duration || 0);
    }
    function onEnd() {
      if (currentIndex < playlist.length - 1) {
        setCurrentIndex((ci) => {
          const newIdx = ci + 1;
          const nextUrl = getAudioUrlForLang(playlist[newIdx].audioMap, playLangCode);
          if (nextUrl) loadAndPlay(nextUrl);
          return newIdx;
        });
      } else {
        setIsPlaying(false);
      }
    }
    function onPlay() { setIsPlaying(true); }
    function onPause() { setIsPlaying(false); }

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [playlist, currentIndex, playLangCode]);

  // context value
  const value = {
    audioRef,
    playlist,
    currentIndex,
    currentBook,
    isPlaying,
    playLangCode,
    progress,
    duration,
    setPlayLangCode,
    playPlaylist,
    playSingleChapter,
    togglePlay,
    nextTrack,
    prevTrack,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* Global bottom player UI (persistent) */}
      <div className="fixed left-0 right-0 bottom-0 z-50 bg-neutral-900 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto p-3 flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="font-semibold">{currentBook?.title ?? "Nothing playing"}</div>
              <div className="text-sm text-gray-400">{playlist[currentIndex]?.title ?? ""}</div>
            </div>

            {/* progress */}
            <div className="mt-2 md:mt-1">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={progress || 0}
                onChange={(e) => {
                  const a = audioRef.current;
                  if (!a) return;
                  a.currentTime = Number(e.target.value);
                  setProgress(a.currentTime);
                }}
                className="w-full"
              />
              <div className="text-xs text-gray-400 mt-1">{Math.floor(progress)} / {Math.floor(duration || 0)} sec</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={prevTrack} className="px-3 py-1 border rounded">Prev</button>
            <button onClick={togglePlay}  disabled={!(playlist && playlist.length) && !(audioRef.current && audioRef.current.src)} className={`px-4 py-2 text-white rounded ${(!(playlist && playlist.length) && !(audioRef.current && audioRef.current.src))
    ? "bg-gray-600 cursor-not-allowed"
    : "bg-indigo-600 hover:opacity-95"}`}>
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button onClick={nextTrack} className="px-3 py-1 border rounded">Next</button>

            {/* language selector */}
            <div className="flex items-center gap-2 ml-3">
              <label className="text-xs text-gray-400">Language</label>
              <select
                className="p-1 border rounded bg-neutral-800"
                value={LANG_CODE_TO_NAME[playLangCode] ?? playLangCode}
                onChange={(e) => {
                  const full = e.target.value;
                  const code = NAME_TO_CODE[full] ?? Object.keys(LANG_CODE_TO_NAME).find(k => LANG_CODE_TO_NAME[k] === full) ?? "en";
                  setPlayLangCode(code);
                }}
              >
                {Object.entries(LANG_CODE_TO_NAME).map(([code, name]) => (
                  <option key={code} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-gray-400 ml-3"> {playlist.length ? `${currentIndex + 1}/${playlist.length}` : ""}</div>
          </div>
        </div>
      </div>

      {/* hidden audio element */}
      <audio ref={audioRef} style={{ display: "none" }} />
    </PlayerContext.Provider>
  );
}
