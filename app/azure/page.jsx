"use client";
import { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import {
  Home,
  Mic,
  Settings,
  Headphones,
  Music,
  Zap,
  Menu,
  X,
  Download,
} from "lucide-react";

export default function Dashboard() {
  const [languages] = useState([
    { code: "en-US", name: "English (United Kingdom)" },
    { code: "hi-IN", name: "Hindi (India)" },
  ]);

  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [inputText, setInputText] = useState("");
  const [creditsRemaining] = useState(9724);
  const [characterCount, setCharacterCount] = useState(0);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  // New states for speech generation
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  /** Static voices for Hindi and English */
  const hindiVoices = [
    { key: "hi-IN-AaravNeural", displayName: "Aarav", description: "Male, Adult (Hindi)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=A" },
    { key: "hi-IN-AartiNeural", displayName: "Aarti", description: "Female, Adult (Hindi)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=AA" },
    { key: "hi-IN-KavyaNeural", displayName: "Kavya", description: "Female, Adult (Hindi)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=K" },
    { key: "hi-IN-RehaanNeural", displayName: "Rehaan", description: "Male, Adult (Hindi)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=R" },
    { key: "hi-IN-SwaraNeural", displayName: "Swara", description: "Female, Adult (Hindi)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=S" },
    { key: "hi-IN-MadhurNeural", displayName: "Madhur", description: "Male, Adult (Hindi)", picture: "https://placehold.co/40x40/E2E8F0/A0AEC0?text=M" },
  ];

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


  /** Update voices when language changes */
  useEffect(() => {
    if (selectedLanguage === "hi-IN") {
      setVoices(hindiVoices);
      setSelectedVoice(hindiVoices[0].key);
    } else {
      setVoices(englishVoices);
      setSelectedVoice(englishVoices[0].key);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    setCharacterCount(inputText.length);
  }, [inputText]);

  const toggleNav = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setAudioUrl("");
    setMessage("");

    try {
      const { data } = await axios.post("/api/azure", {
        text: inputText,
        language: selectedLanguage,
        voice: selectedVoice,
      });

      setAudioUrl(data.url);
      setMessage("Audio generated successfully!");
    } catch (error) {
      console.error("Error generating speech", error);
      setMessage("Failed to generate speech. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 font-sans flex text-gray-800">
      {/* Sidebar - Desktop and Tablet */}
      <aside
        className={`bg-white border-r border-gray-200 p-4 hidden md:flex flex-col transition-all duration-300 ${isNavCollapsed ? "w-20" : "w-64"
          }`}
      >
        <div>
          <div className="flex items-center space-x-2 text-xl font-bold mb-6 text-pink-600">
            <Zap className="h-6 w-6 text-pink-600" />
            <span className={isNavCollapsed ? "hidden" : "block"}>HEaro</span>
          </div>
          <nav className="space-y-2">
            {[
              { icon: <Home className="h-5 w-5" />, label: "Home" },
              { icon: <Mic className="h-5 w-5" />, label: "Voices" },
              { icon: <Headphones className="h-5 w-5" />, label: "Text to Speech", active: true },
              { icon: <Settings className="h-5 w-5" />, label: "Voice Changer" },
              { icon: <Music className="h-5 w-5" />, label: "Sound Effects" },
            ].map(({ icon, label, active }) => (
              <button
                key={label}
                className={`flex items-center space-x-3 w-full text-left px-3 py-2 rounded-lg transition-colors ${active
                  ? "bg-pink-50 text-pink-600 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                {icon}
                <span className={isNavCollapsed ? "hidden" : "block"}>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-2 text-xl font-bold text-pink-600">
            <Zap className="h-6 w-6" />
            <span>HEaro</span>
          </div>
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={toggleNav}
          >
            {isNavCollapsed ? <Menu className="h-6 w-6 text-gray-600" /> : <X className="h-6 w-6 text-gray-600" />}
          </button>
        </header>

        {/* Mobile Nav Menu (Visible when isNavCollapsed is false on small screens) */}
        {!isNavCollapsed && (
          <nav className="fixed inset-0 z-50 bg-white md:hidden p-4 space-y-4">
            <div className="flex items-center justify-between text-xl font-bold text-pink-600 mb-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6" />
                <span>HEaro</span>
              </div>
              <button className="p-2 rounded-md hover:bg-gray-100" onClick={toggleNav}>
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            {[
              { icon: <Home className="h-6 w-6" />, label: "Home" },
              { icon: <Mic className="h-6 w-6" />, label: "Voices" },
              { icon: <Headphones className="h-6 w-6" />, label: "Text to Speech", active: true },
              { icon: <Settings className="h-6 w-6" />, label: "Voice Changer" },
              { icon: <Music className="h-6 w-6" />, label: "Sound Effects" },
            ].map(({ icon, label, active }) => (
              <button
                key={label}
                className={`flex items-center space-x-4 w-full text-left px-4 py-3 rounded-lg text-lg transition-colors ${active
                  ? "bg-pink-50 text-pink-600 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
                  }`}
                onClick={toggleNav}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>
        )}

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Text Input Area */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <h1 className="text-3xl font-bold mb-6 hidden md:block">Text to Speech</h1>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 h-[70vh] flex flex-col">
              <textarea
                placeholder="Type something here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 w-full text-lg p-2 border-none resize-none outline-none focus:ring-0"
              />
              <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t mt-4">
                {/* <span>{creditsRemaining} credits remaining</span> */}
                <span>{characterCount} / 5,000 characters</span>
              </div>
            </div>

            {/* Audio Player and Download button */}
            {audioUrl && (
              <div className="mt-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  {/* Audio Player */}
  <audio
    controls
    src={audioUrl}
    className="w-full md:flex-1 md:mr-4"
  ></audio>

  {/* Download Button */}
  <button
    onClick={async () => {
      try {
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

            )}
            {/* Generation Status Message */}
            {message && (
              <div className={`mt-4 p-3 rounded-md text-sm ${message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message}
              </div>
            )}
          </div>

          {/* Settings Panel */}
          <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-gray-200 bg-white p-6 md:p-8 flex flex-col overflow-y-auto">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-4">Settings</h2>

              {/* Language Selector */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voices List */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Voice</label>
                {voices.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {voices.map((voice) => (
                      <div
                        key={voice.key}
                        onClick={() => setSelectedVoice(voice.key)}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition ${selectedVoice === voice.key
                          ? "bg-pink-50 border border-pink-500"
                          : "hover:bg-gray-100 border border-transparent"
                          }`}
                      >
                        <img
                          src={voice.picture}
                          alt={voice.displayName}
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{voice.displayName}</div>
                          <div className="text-sm text-gray-500">{voice.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No voices available</p>
                )}
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-6">
              <button
                className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition"
                onClick={handleGenerate}
                disabled={isGenerating || !inputText || !selectedVoice}
              >
                {isGenerating ? "Generating..." : "Generate Speech"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}