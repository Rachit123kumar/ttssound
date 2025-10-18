"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaVideo,
  FaMicrophone,
  FaUsers,
  FaHome,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { HiMenu, HiX, HiSpeakerphone } from 'react-icons/hi';

// Toast / status message helper
const showMessage = (message, type = 'info') => {
  const existing = document.getElementById('status-message');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.id = 'status-message';
  const color = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-indigo-500';
  div.className = `fixed bottom-6 left-1/2 -translate-x-1/2 p-3 sm:p-4 rounded-2xl text-white font-semibold shadow-2xl ${color} z-50 animate-pop`;
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const audioClips = [
    {
      id: 'clip-1',
      text: `यहाँ एक छोटी प्रेरक कहानी है जिसे आप रील्स के लिए इस्तेमाल कर सकते हैं...`,
      url: 'https://pub-105fec70566540d1a4cf3698e960bfa4.r2.dev/speech/1d7527bc-f396-479d-82c6-771d1c4ee832.mp3',
    },
  ];

  const handleDownload = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showMessage('Download started!', 'success');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-violet-50 antialiased relative overflow-hidden">
      {/* Decorative colorful blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 opacity-20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-40 -left-28 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-green-300 via-cyan-300 to-blue-400 opacity-18 blur-3xl animate-float-delayed" />

      {/* Header */}
      <header className={`fixed w-full z-50 transition-all ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/60' : 'bg-white/60 backdrop-blur-lg'}`}>
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between" aria-label="Main navigation">
          <Link href="/" className="flex items-center space-x-3 text-xl font-extrabold">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 flex items-center justify-center text-white">H</div>
            <span className="bg-gradient-to-r from-indigo-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">Hearo</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            <Link href="/generateVideo" className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition">
              <FaVideo className="w-4 h-4" />
              <span>Video Generator</span>
            </Link>
            <Link href="/multispeaker" className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition">
              <FaUsers className="w-4 h-4" />
              <span>Multi-Speaker</span>
            </Link>
            <Link href="/azure" className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition">
              <FaMicrophone className="w-4 h-4" />
              <span>Voice Generator</span>
            </Link>
            <a href="#features" className="text-gray-700 hover:text-indigo-600 transition">Features</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 transition">How It Works</a>
          </div>

          {/* Mobile button */}
          <div className="flex items-center lg:hidden">
            <button
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div id="mobile-menu" className={`lg:hidden transition-all ${isMenuOpen ? 'max-h-screen visible py-4 border-t border-gray-200' : 'max-h-0 overflow-hidden'}`}>
          <div className="container mx-auto px-4 flex flex-col gap-3">
            <Link href="/generateVideo" className="p-3 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 text-red-700 font-medium flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
              <FaVideo className="w-5 h-5" /> <span>Video Generator</span>
            </Link>
            <Link href="/multispeaker" className="p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
              <FaUsers className="w-5 h-5" /> <span>Multi-Speaker</span>
            </Link>
            <Link href="/azure" className="p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
              <FaMicrophone className="w-5 h-5" /> <span>Voice Generator</span>
            </Link>
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2">
              <HiSpeakerphone className="w-5 h-5" /> <span>Features</span>
            </a>
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2">
              <FaHome className="w-5 h-5" /> <span>How It Works</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[40px] p-10 sm:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 rounded-[40px]" />
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                Transform Text into <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">Engaging Content</span>
              </h1>
              <p className="text-sm sm:text-lg max-w-3xl mx-auto opacity-95 mb-6">Create captivating voiceovers and stunning videos with our AI-powered generators</p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <Link href="/video-generator" className="group relative inline-flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 px-6 rounded-2xl shadow-2xl hover:scale-105 transform transition-all">
                  <FaVideo className="w-4 h-4 mr-2" /> <span>Create Videos</span>
                </Link>
                <Link href="/azure" className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold py-3 px-6 rounded-2xl shadow transition-all hover:scale-105">
                  <FaMicrophone className="w-4 h-4 mr-2" /> <span>Generate Voices</span>
                </Link>
              </div>
            </div>

            {/* subtle decorative shapes inside hero */}
            <div className="absolute -right-20 -top-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-28 -bottom-20 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Powerful Features for Creators</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Everything you need to create professional audio and video content</p>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
   
            <article className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition">
              <div className="h-40 relative">
      
                <img src="https://source.unsplash.com/1200x600/?ai,video" alt="AI video preview" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 opacity-30 mix-blend-multiply" />
                <div className="absolute bottom-4 left-6">
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold">New Feature</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <FaVideo className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">AI Video Generation</h3>
                </div>
                <p className="text-gray-600 mb-6">Transform your text into engaging videos with AI. Create stunning visual content for social media, marketing, and more.</p>
                <Link href="/video-generator" className="text-red-500 font-semibold inline-flex items-center gap-2">Start Creating Videos →</Link>
              </div>
            </article>

      
            <article className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition">
              <div className="h-40 relative">
                <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=60" alt="Conversation illustration" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-32 mix-blend-multiply" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <FaUsers className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Multi-Speaker Dialogue</h3>
                </div>
                <p className="text-gray-600 mb-6">Create realistic conversations between multiple speakers. Perfect for podcasts, interviews, and storytelling.</p>
                <Link href="/multispeaker" className="text-indigo-500 font-semibold inline-flex items-center gap-2">Try Dialogue Generation →</Link>
              </div>
            </article>

    
            <article className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition">
              <div className="h-40 relative">
                <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=60" alt="Microphone and waveform" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 opacity-30 mix-blend-multiply" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <FaMicrophone className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Emotional Voice AI</h3>
                </div>
                <p className="text-gray-600 mb-6">Bring your scripts to life with emotional depth. Choose from various tones to match your content's mood perfectly.</p>
                <Link href="/azure" className="text-emerald-500 font-semibold inline-flex items-center gap-2">Explore Emotions →</Link>
              </div>
            </article>

            {/* Feature full-width callout (responsive) */}
            <div className="md:col-span-2 lg:col-span-3 mt-2">
              <div className="bg-gradient-to-r from-indigo-50 to-pink-50 border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">All-in-one Creator Suite</h4>
                  <p className="text-gray-600">Script, voice, and video tools built for creators — export optimized assets for social platforms in one click.</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/video-generator" className="py-2 px-4 rounded-lg font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white shadow">Try Video</Link>
                  <Link href="/azure" className="py-2 px-4 rounded-lg font-semibold border border-gray-200">Try Voices</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 px-4 sm:px-6 lg:px-8 bg-white/60">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-extrabold text-gray-900">How it works</h3>
            <p className="text-gray-600">From script to published asset in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow">
              <div className="w-12 h-12 rounded-md bg-indigo-100 flex items-center justify-center mb-4">1</div>
              <h4 className="font-bold mb-2">Write or paste script</h4>
              <p className="text-gray-600 text-sm">Enter your text or import a script — our editor supports timestamps and speaker labels.</p>
            </div>
            <div className="p-6 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow">
              <div className="w-12 h-12 rounded-md bg-pink-100 flex items-center justify-center mb-4">2</div>
              <h4 className="font-bold mb-2">Choose voices & visuals</h4>
              <p className="text-gray-600 text-sm">Pick from emotional voice presets and visual templates tailored to each platform.</p>
            </div>
            <div className="p-6 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow">
              <div className="w-12 h-12 rounded-md bg-emerald-100 flex items-center justify-center mb-4">3</div>
              <h4 className="font-bold mb-2">Export & share</h4>
              <p className="text-gray-600 text-sm">Export as MP3 / MP4 optimized for Reels, Shorts, or full-resolution downloads.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo / Audio Player */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-center">
              <h2 className="text-3xl font-black text-white mb-1">Experience AI Voice Quality</h2>
              <p className="text-indigo-100">Listen to our premium Hindi voice generation</p>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-full max-w-2xl bg-gray-50 rounded-xl p-6 shadow-inner">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    <span className="text-sm font-semibold text-gray-600">Now Playing</span>
                  </div>
                  <audio controls className="w-full h-12 rounded-lg bg-white shadow border border-gray-200" src={audioClips[0].url}>
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => handleDownload(audioClips[0].url, 'hearo-demo.mp3')} className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:scale-105 transition">
                    <span>⬇️</span>
                    <span>Download Demo Audio</span>
                  </button>

                  <button onClick={() => showMessage('Preview saved to your library!', 'success')} className="inline-flex items-center space-x-2 bg-white border border-gray-200 font-semibold py-3 px-5 rounded-xl">
                    Save to Library
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-3 text-2xl font-bold mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">H</div>
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Hearo</span>
              </Link>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">Transform your content creation with AI-powered voice and video generation tools. Create engaging, professional content in minutes.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white"><FaGithub className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><FaTwitter className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><FaLinkedin className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><FaEnvelope className="w-6 h-6" /></a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/video-generator" className="flex items-center gap-2"> <FaVideo className="w-4 h-4" /> Video Generator</Link></li>
                <li><Link href="/azure" className="flex items-center gap-2"> <FaMicrophone className="w-4 h-4" /> Voice Generator</Link></li>
                <li><Link href="/multispeaker" className="flex items-center gap-2"> <FaUsers className="w-4 h-4" /> Multi-Speaker</Link></li>
                <li><a href="#features" className="flex items-center gap-2">Features</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-3"><FaEnvelope className="w-4 h-4" /> <span>hello@hearo.ai</span></li>
                <li className="flex items-center gap-3"><FaPhone className="w-4 h-4" /> <span>+1 (555) 123-4567</span></li>
                <li className="flex items-center gap-3"><FaMapMarkerAlt className="w-4 h-4" /> <span>San Francisco, CA</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Hearo. All rights reserved.</p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Local styles & animations */}
      <style jsx>{`
        @keyframes pop { from { transform: scale(0.9); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        .animate-pop { animation: pop 0.28s ease-out; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
        .animate-fadeIn { animation: fadeIn 0.35s ease; }

        @keyframes float { 0% { transform: translateY(0px) } 50% { transform: translateY(-18px) } 100% { transform: translateY(0px) } }
        .animate-float { animation: float 9s ease-in-out infinite; }
        .animate-float-delayed { animation: float 11s ease-in-out infinite 3s; }
      `}</style>
    </main>
  );
}
