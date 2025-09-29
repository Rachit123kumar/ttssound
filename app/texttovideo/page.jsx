// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import { FFmpeg } from "@ffmpeg/ffmpeg";
// import { fetchFile, toBlobURL } from "@ffmpeg/util";

// export default function Page() {
//   const [inputVideo, setInputVideo] = useState(null);
//   const [status, setStatus] = useState(null);
//   const [error, setError] = useState(null);
//   const [outputVideo, setOutputVideo] = useState(null);

//   const [startTime, setStartTime] = useState(0);
//   const [endTime, setEndTime] = useState(10);

//   const ffmpegRef = useRef(null);

//   // Handle file input
//   function handleChange(e) {
//     if (!e.target.files?.[0]) {
//       alert("Please select a video file");
//       return;
//     }
//     setInputVideo(e.target.files[0]);
//   }

//   // Load FFmpeg
//   async function loadFFmpeg() {
//     try {
//       setStatus("loading");
//       console.log("Loading FFmpeg...");

//       const baseURL =
//         "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

//       const ffmpeg = new FFmpeg();
//       ffmpegRef.current = ffmpeg;

//       ffmpeg.on("log", ({ message }) => {
//         console.log("FFmpeg Log:", message);
//       });

//       await ffmpeg.load({
//         coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
//         wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
//       });

//       setStatus("ready");
//       console.log("✅ FFmpeg loaded successfully");
//     } catch (err) {
//       setError("Failed to load ffmpeg-core.js");
//       setStatus("error");
//       console.error(err);
//     }
//   }

//   useEffect(() => {
//     loadFFmpeg();
//   }, []);

//   // Convert video
//   async function convertToMp4() {
//     try {
//       if (!inputVideo) {
//         alert("Please select a video file first");
//         return;
//       }

//       const ffmpeg = ffmpegRef.current;
//       if (!ffmpeg) {
//         alert("FFmpeg is not loaded yet");
//         return;
//       }

//       setStatus("converting");
//       setError(null);

//       // Use a simple fixed name to avoid FS issues
//       const inputFileName = "input.mp4";
//       const outputFileName = "trimmed_output.mp4";

//       // Write file to virtual FS
//       await ffmpeg.writeFile(inputFileName, await fetchFile(inputVideo));

//       // Trim video
//       await ffmpeg.exec([
//         "-ss", String(startTime), // start time
//         "-t", String(endTime),    // duration
//         "-i", inputFileName,
//         "-c", "copy",             // no re-encoding
//         outputFileName,
//       ]);

//       // Read the trimmed video
//       const data = await ffmpeg.readFile(outputFileName);

//       // Create video URL
//       const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));

//       setOutputVideo(url);
//       setStatus("completed");
//       setInputVideo(null);

//     } catch (err) {
//       setError("Failed to trim video");
//       setStatus("error");
//       console.error("FFmpeg error:", err);
//     }
//   }

//   return (
//     <div className="p-6 space-y-4">
//       <h1 className="text-xl font-bold">FFmpeg Video Trimmer</h1>

//       <input type="file" accept="video/*" onChange={handleChange} />

//       {inputVideo && (
//         <div>
//           <div className="space-x-2 mt-2">
//             <input
//               type="number"
//               value={startTime}
//               placeholder="Start time (sec)"
//               onChange={(e) => setStartTime(Number(e.target.value))}
//               className="border px-2 py-1"
//             />
//             <input
//               type="number"
//               value={endTime}
//               placeholder="Duration (sec)"
//               onChange={(e) => setEndTime(Number(e.target.value))}
//               className="border px-2 py-1"
//             />
//           </div>

//           <button
//             onClick={convertToMp4}
//             disabled={status === "converting"}
//             className="bg-blue-500 text-white px-4 py-2 mt-3 rounded disabled:opacity-50"
//           >
//             {status === "converting" ? "Converting..." : "Convert to MP4"}
//           </button>
//         </div>
//       )}

//       {status === "loading" && <p>Loading FFmpeg...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {outputVideo && (
//         <div className="mt-4">
//           <p className="font-medium">Output Video</p>
//           <video controls className="mt-2 border rounded" width="400">
//             <source src={outputVideo} type="video/mp4" />
//             Your browser does not support this video format.
//           </video>
//         </div>
//       )}
//     </div>
//   );
// }












////////////
///////////////
"use client";
import React, { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export default function SlideshowPage() {
  const [images, setImages] = useState([]);
  const [audio, setAudio] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [outputVideo, setOutputVideo] = useState(null);

  const ffmpegRef = useRef(null);

  // Load FFmpeg
  async function loadFFmpeg() {
    try {
      setStatus("loading");
      console.log("Loading FFmpeg...");

      const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on("log", ({ message }) => console.log("FFmpeg Log:", message));

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      setStatus("ready");
      console.log("✅ FFmpeg loaded successfully");
    } catch (err) {
      setError("Failed to load FFmpeg");
      setStatus("error");
      console.error(err);
    }
  }

  useEffect(() => {
    loadFFmpeg();
  }, []);

  // Handle image upload
  function handleImageChange(e) {
    if (!e.target.files) return;
    setImages([...e.target.files]);
  }

  // Handle audio upload
  function handleAudioChange(e) {
    if (!e.target.files?.[0]) return;
    setAudio(e.target.files[0]);
  }

  // Convert images + audio into a single video
  async function createVideo() {
    if (images.length === 0) {
      alert("Please upload at least 5 images");
      return;
    }
    if (!audio) {
      alert("Please upload an audio file");
      return;
    }

    setStatus("processing");
    setError(null);

    const ffmpeg = ffmpegRef.current;

    try {
      // Step 1: Write all images into FFmpeg virtual FS
      for (let i = 0; i < images.length; i++) {
        const fileName = `img${i + 1}.png`;
        await ffmpeg.writeFile(fileName, await fetchFile(images[i]));
      }

      // Step 2: Write audio into FFmpeg FS
      await ffmpeg.writeFile("audio.mp3", await fetchFile(audio));

      // Step 3: Create a text file listing the images
      const listContent = images
        .map((_, i) => `file 'img${i + 1}.png'\nduration 3`)
        .join("\n");

      await ffmpeg.writeFile("file_list.txt", new TextEncoder().encode(listContent));

      // Step 4: Generate video from images (each 3 seconds)
      // -r 30 → 30 FPS
      await ffmpeg.exec([
        "-f", "concat",
        "-safe", "0",
        "-i", "file_list.txt",
        "-r", "30",
        "-pix_fmt", "yuv420p",
        "temp_video.mp4",
      ]);

      console.log("✅ Slideshow video created");

      // Step 5: Merge audio with the slideshow
      await ffmpeg.exec([
        "-i", "temp_video.mp4",
        "-i", "audio.mp3",
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",  // stop when shortest ends
        "final_video.mp4",
      ]);

      console.log("✅ Audio merged with video");

      // Step 6: Get final video
      const data = await ffmpeg.readFile("final_video.mp4");
      const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
      setOutputVideo(url);

      setStatus("completed");
    } catch (err) {
      console.error("FFmpeg error:", err);
      setError("Failed to create video");
      setStatus("error");
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Image Slideshow with Audio</h1>

      <div>
        <label className="block mb-2">Upload 5 Images</label>
        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
      </div>

      <div>
        <label className="block mb-2 mt-4">Upload Background Audio</label>
        <input type="file" accept="audio/*" onChange={handleAudioChange} />
      </div>

      <button
        onClick={createVideo}
        disabled={status === "processing"}
        className="bg-blue-500 text-white px-4 py-2 mt-4 rounded disabled:opacity-50"
      >
        {status === "processing" ? "Processing..." : "Create Video"}
      </button>

      {status === "loading" && <p>Loading FFmpeg...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {outputVideo && (
        <div className="mt-4">
          <h2 className="font-medium">Final Video</h2>
          <video controls className="mt-2 border rounded" width="400">
            <source src={outputVideo} type="video/mp4" />
            Your browser does not support this video format.
          </video>

          <a
            href={outputVideo}
            download="slideshow.mp4"
            className="block mt-3 text-blue-600 underline"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}
