"use client"
import React, { useState } from "react";
import axios from "axios";

// Replaced react-icons with inline SVG components to resolve compilation error
const FaHome = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" {...props}>
    <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H400c-22.1 0-40-17.9-40-40v-88c0-17.7-14.3-32-32-32h-64c-17.7 0-32 14.3-32 32v88c0 22.1-17.9 40-40 40H168c-22.1 0-40-17.9-40-40v-83.3c-.3-2.7-.5-5.4-.5-8.1l.7-160.2h-32c-17 0-32-14.1-32-32.1 0-9 4.3-17.1 11.4-22.8L265.4 9.4c16.3-12.9 45.4-12.9 61.7 0L564.4 232.7c7.1 5.6 11.4 13.8 11.4 22.8z"></path>
  </svg>
);
const FaMicrophone = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" {...props}>
    <path d="M192 0C134.3 0 88 46.3 88 104v48H48c-26.5 0-48 21.5-48 48v24c0 26.5 21.5 48 48 48h24c0 14.7 3.3 28.5 9.3 41.2-8.1 4.5-16 10.3-22.7 17.5-12.9 13.5-12.9 35.3 0 48.8 12.9 13.5 33.7 13.5 46.6 0 11.8-12.3 20-27.7 24.3-44.2 12.2 2.7 24.9 4.2 38.2 4.2 13.3 0 26.1-1.5 38.2-4.2 4.3 16.5 12.5 31.9 24.3 44.2 12.9 13.5 33.7 13.5 46.6 0 12.9-13.5 12.9-35.3 0-48.8-6.7-7.2-14.6-13-22.7-17.5 6-12.7 9.3-26.5 9.3-41.2h24c26.5 0 48-21.5 48-48v-24c0-26.5-21.5-48-48-48h-40v-48c0-57.7-46.3-104-104-104zM240 104v48h-96v-48c0-26.5 21.5-48 48-48s48 21.5 48 48z"></path>
  </svg>
);
const FaPlayCircle = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" {...props}>
    <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm-16 150v196c0 13.3 10.7 24 24 24h64c13.3 0 24-10.7 24-24V158c0-13.3-10.7-24-24-24h-64c-13.3 0-24 10.7-24 24zm128 0v196c0 13.3 10.7 24 24 24h64c13.3 0 24-10.7 24-24V158c0-13.3-10.7-24-24-24h-64c-13.3 0-24 10.7-24 24z"></path>
  </svg>
);
const FaVolumeUp = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" {...props}>
    <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm-16 150v196c0 13.3 10.7 24 24 24h64c13.3 0 24-10.7 24-24V158c0-13.3-10.7-24-24-24h-64c-13.3 0-24 10.7-24 24z"></path>
  </svg>
);
const FaBolt = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" {...props}>
    <path d="M192 0C134.3 0 88 46.3 88 104v48H48c-26.5 0-48 21.5-48 48v24c0 26.5 21.5 48 48 48h24c0 14.7 3.3 28.5 9.3 41.2-8.1 4.5-16 10.3-22.7 17.5-12.9 13.5-12.9 35.3 0 48.8 12.9 13.5 33.7 13.5 46.6 0 11.8-12.3 20-27.7 24.3-44.2 12.2 2.7 24.9 4.2 38.2 4.2 13.3 0 26.1-1.5 38.2-4.2 4.3 16.5 12.5 31.9 24.3 44.2 12.9 13.5 33.7 13.5 46.6 0 12.9-13.5 12.9-35.3 0-48.8-6.7-7.2-14.6-13-22.7-17.5 6-12.7 9.3-26.5 9.3-41.2h24c26.5 0 48-21.5 48-48v-24c0-26.5-21.5-48-48-48h-40v-48c0-57.7-46.3-104-104-104zM240 104v48h-96v-48c0-26.5 21.5-48 48-48s48 21.5 48 48z"></path>
  </svg>
);
const FaMagic = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" {...props}>
    <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm-16 150v196c0 13.3 10.7 24 24 24h64c13.3 0 24-10.7 24-24V158c0-13.3-10.7-24-24-24h-64c-13.3 0-24 10.7-24 24z"></path>
  </svg>
);
const FaFileAudio = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" {...props}>
    <path d="M192 0C134.3 0 88 46.3 88 104v48H48c-26.5 0-48 21.5-48 48v24c0 26.5 21.5 48 48 48h24c0 14.7 3.3 28.5 9.3 41.2-8.1 4.5-16 10.3-22.7 17.5-12.9 13.5-12.9 35.3 0 48.8 12.9 13.5 33.7 13.5 46.6 0 11.8-12.3 20-27.7 24.3-44.2 12.2 2.7 24.9 4.2 38.2 4.2 13.3 0 26.1-1.5 38.2-4.2 4.3 16.5 12.5 31.9 24.3 44.2 12.9 13.5 33.7 13.5 46.6 0 12.9-13.5 12.9-35.3 0-48.8-6.7-7.2-14.6-13-22.7-17.5 6-12.7 9.3-26.5 9.3-41.2h24c26.5 0 48-21.5 48-48v-24c0-26.5-21.5-48-48-48h-40v-48c0-57.7-46.3-104-104-104zM240 104v48h-96v-48c0-26.5 21.5-48 48-48s48 21.5 48 48z"></path>
  </svg>
);
const FaCommentDots = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" {...props}>
    <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm-16 150v196c0 13.3 10.7 24 24 24h64c13.3 0 24-10.7 24-24V158c0-13.3-10.7-24-24-24h-64c-13.3 0-24 10.7-24 24z"></path>
  </svg>
);
const FaCode = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" {...props}>
    <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm-16 150v196c0 13.3 10.7 24 24 24h64c13.3 0 24-10.7 24-24V158c0-13.3-10.7-24-24-24h-64c-13.3 0-24 10.7-24 24z"></path>
  </svg>
);
const FaBell = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" {...props}>
    <path d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.66 64 63.97 64zm215.39-149.31c-19.16-16.14-38.35-32.22-48.4-44.11-20.91-24.32-31.53-56.16-31.53-91.89C359.46 95.14 286.99 15.11 224 15.11s-135.46 80.03-135.46 211.69c0 35.73-10.62 67.57-31.53 91.89-10.05 11.89-29.24 27.97-48.4 44.11C15.89 397.66 0 408.83 0 424h448c0-15.17-15.89-26.34-24.61-38.62z"></path>
  </svg>
);
const FaUserCircle = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" height="1em" width="1em" {...props}>
    <path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 112c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zm0 304c-60.5 0-113.8-31.4-144-79.6 20.6-28.4 61.6-48.4 116.5-54.6 22.1-2.5 44.1-3.8 67.5-3.8s45.4 1.3 67.5 3.8c54.9 6.2 95.9 26.2 116.5 54.6-30.2 48.2-83.5 79.6-144 79.6z"></path>
  </svg>
);


const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: FaHome, active: false },
    { name: 'Text to Speech', icon: FaMicrophone, active: true },
    { name: 'Voices', icon: FaVolumeUp, active: false },
    { name: 'Projects', icon: FaFileAudio, active: false },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-gray-950 text-gray-300 p-6 flex-col overflow-y-auto">
      <div className="flex items-center space-x-2 text-teal-400 text-3xl font-bold mb-10">
        <FaBolt className="text-teal-400" />
        <span>HEaro</span>
      </div>
      <nav className="flex-grow space-y-6">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Features</span>
          <ul className="space-y-2 mt-3">
            {navItems.map((item) => (
              <li
                key={item.name}
                className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-colors duration-200 ${item.active ? 'bg-gray-800 text-teal-400 font-medium' : 'hover:bg-gray-800 hover:text-white'}`}
              >
                <item.icon className="text-lg" />
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="mt-auto pt-6 border-t border-gray-800">
        <div className="flex items-center space-x-3 p-3 rounded-xl cursor-pointer hover:bg-gray-800 hover:text-white transition-colors duration-200">
          <FaUserCircle className="text-4xl text-gray-500" />
          <div className="flex flex-col">
            <span className="text-sm text-white">Guest User</span>
            <span className="text-xs text-gray-500">My Account</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

const MainContent = () => {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [voice, setVoice] = useState("en-US-AriaNeural");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'error' or 'success'

  const generateSpeech = async () => {
    setLoading(true);
    setAudioUrl("");
    setMessage("");

    try {
      const { data } = await axios.post("/api/azure", {
        text,
        language,
        voice,
      });

      setAudioUrl(data.url);
      setMessage("Audio generated successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Error generating speech", error);
      setMessage("Failed to generate speech. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow p-8 flex flex-col items-center justify-center bg-gray-900 overflow-y-auto">
      <div className="w-full max-w-2xl bg-gray-800 rounded-3xl shadow-xl p-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-100 text-center">AI Voice Generator</h1>

        {message && (
          <div className={`p-4 rounded-lg text-sm text-center ${messageType === 'error' ? 'bg-red-500 text-white' : 'bg-teal-500 text-white'}`}>
            {message}
          </div>
        )}

        <textarea
          className="w-full h-48 border-2 border-gray-700 rounded-2xl p-4 text-lg bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none placeholder-gray-400"
          placeholder="Type your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
            <select
              className="w-full p-4 border-2 border-gray-700 rounded-2xl bg-gray-900 text-gray-200 focus:ring-2 focus:ring-teal-400 appearance-none pr-10"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en-US">English (US)</option>
              <option value="hi-IN">Hindi</option>
              <option value="fr-FR">French</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-400 mb-2">Voice</label>
            <select
              className="w-full p-4 border-2 border-gray-700 rounded-2xl bg-gray-900 text-gray-200 focus:ring-2 focus:ring-teal-400 appearance-none pr-10"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
            >
              <option value="en-US-AriaNeural">Aria (Female)</option>
              <option value="en-US-GuyNeural">Guy (Male)</option>
              <option value="hi-IN-AaravNeural">Aarav (Male, India)</option>
              <option value="hi-IN-AartiNeural">Aarti (Female Adult, India)</option>
              <option value="hi-IN-ArjunNeural">Arjun (Male, India)</option>
              <option value="hi-IN-KavyaNeural">Kavya (Female Adult, India)</option>
              <option value="hi-IN-KunalNeural">Kunal (Male Adult, India)</option>
              <option value="hi-IN-RehanNeural">Rehan (Male Adult, India)</option>
              <option value="hi-IN-SwaraNeural">Swara (Female, India)</option>
              <option value="hi-IN-MadhuNeural">Madhu (Female, India)</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateSpeech}
          disabled={loading}
          className="w-full bg-teal-600 text-white font-semibold py-4 rounded-full shadow-lg hover:bg-teal-700 transition transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Audio"}
        </button>

        {audioUrl && (
          <div className="space-y-4">
            <audio controls className="w-full rounded-full">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <a
              href={audioUrl}
              download="speech.mp3"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full bg-blue-600 text-white font-semibold py-4 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
            >
              Download Audio
            </a>
          </div>
        )}
      </div>
    </main>
  );
};

export default function App() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Sidebar />
      <MainContent />
    </div>
  );
}
