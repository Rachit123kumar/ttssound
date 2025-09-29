"use client";

// Dynamically import for client-side only
let createFFmpeg;
let fetchFile;

if (typeof window !== "undefined") {
  const ffmpegModule = require("@ffmpeg/ffmpeg");
  createFFmpeg = ffmpegModule.createFFmpeg;
  fetchFile = ffmpegModule.fetchFile;
}

const ffmpeg = createFFmpeg ? createFFmpeg({ log: true }) : null;

export async function initFFmpeg() {
  if (!ffmpeg) {
    throw new Error("FFmpeg is not available on the server side.");
  }

  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  return ffmpeg;
}

export { fetchFile };
