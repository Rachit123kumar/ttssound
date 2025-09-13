"use client";

import { useState } from 'react';
import Link from 'next/link'; // Import the Link component

// Custom message box function (kept for user feedback on other actions)
const showMessage = (message, type = 'info') => {
    const existingMsg = document.getElementById('status-message');
    if (existingMsg) existingMsg.remove();

    const msgDiv = document.createElement('div');
    msgDiv.id = 'status-message';
    let bgColor = 'bg-blue-500';
    if (type === 'error') bgColor = 'bg-red-500';
    if (type === 'success') bgColor = 'bg-green-500';

    msgDiv.className = `fixed bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-xl text-white font-semibold shadow-lg ${bgColor} z-50 transition-transform duration-300 transform scale-100`;
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);

    setTimeout(() => {
        msgDiv.style.transform = 'translate(-50%, 100%)';
        msgDiv.style.opacity = '0';
        setTimeout(() => msgDiv.remove(), 300);
    }, 3000);
};

export default function Home() {
    // State for mobile menu
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Hardcoded audio data
    const audioClips = [
        {
            id: 'clip-1',
            // The Hindi dialogue provided by the user
            text: 'एक पुरानी तस्वीर मेरे हाथ में थी। धुंधली, किनारों से फटी हुई, पर उसमें कैद वो पल आज भी मेरे ज़हन में ताज़ा था। वो बारिश की शाम थी, जब मैं और मेरी माँ गाँव के उस कच्चे रास्ते पर चले जा रहे थे। मेरे नंगे पाँव मिट्टी में धँस रहे थे और माँ का आँचल मेरे सिर पर था। हवा बहुत तेज़ थी, पेड़ों की पत्तियाँ नाच रही थीं और आसमान में बिजलियाँ चमक रही थीं। माँ ने मेरा हाथ कसकर पकड़ रखा था।',
            // The new audio URL
            url: 'https://pub-105fec70566540d1a4cf3698e960bfa4.r2.dev/speech/01dd11b1-c61d-4bff-9dd1-44f631015430.mp3',
        },
    ];

    // Placeholder functions since generation is removed
    const handleGenerateAudio = () => showMessage('Audio generation is currently disabled on the demo.', 'info');
    const handleMergeSelected = () => showMessage('Audio merging is not available on the demo.', 'info');

    // A simple function to handle the download
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
        <main className="min-h-screen bg-gray-100 antialiased">
            {/* SEO: Semantic tags and ARIA attributes */}
            {/* The nav bar has a more descriptive ARIA label for accessibility */}
            <header className="bg-white shadow-lg fixed w-full z-50">
                <nav className="container mx-auto px-4 py-4 md:flex md:justify-between md:items-center" role="navigation" aria-label="Main navigation">
                    <div className="flex items-center justify-between">
                        {/* SEO: Use a strong title for branding */}
                        <a href="/" className="text-3xl font-extrabold text-indigo-700 tracking-tight" aria-label="Hearo homepage">
                            Hearo
                        </a>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600 focus:outline-none focus:text-gray-800 md:hidden"
                            aria-expanded={isMenuOpen}
                            aria-controls="main-menu"
                            aria-label="Toggle main menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                                )}
                            </svg>
                        </button>
                    </div>

                    <div id="main-menu" className={`md:flex items-center space-x-8 mt-4 md:mt-0 ${isMenuOpen ? 'block' : 'hidden'}`}>
                        <Link href="/azure" className="block mt-4 md:mt-0 text-gray-700 hover:text-indigo-600 transition duration-200 font-medium">Generate</Link>
                        <a href="#features" className="block mt-4 md:mt-0 text-gray-700 hover:text-indigo-600 transition duration-200 font-medium">Features</a>
                        <a href="#how-it-works" className="block mt-4 md:mt-0 text-gray-700 hover:text-indigo-600 transition duration-200 font-medium">How It Works</a>
                        <a href="#contact" className="block mt-4 md:mt-0 text-gray-700 hover:text-indigo-600 transition duration-200 font-medium">Contact</a>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white py-24 px-4 sm:px-6 lg:px-8 text-center rounded-b-[40px] shadow-xl">
                <div className="container mx-auto max-w-4xl">
                    {/* SEO: H1 for the main topic */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">Generate AI Voices in Any Mood</h1>
                    {/* SEO: Meta description-like content in a paragraph */}
                    <p className="text-lg sm:text-xl lg:text-2xl font-light mb-8 opacity-90">
                        Create captivating voiceovers for your videos with our easy-to-use AI voice generator.
                    </p>
                    <Link href="/azure" className="inline-block bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105">
                        Start Generating
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    {/* SEO: H2 for a major section */}
                    <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Features that Elevate Your Content</h2>
                    <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
                        {/* Feature 1 */}
                        <div className="order-1 md:order-1">
                            {/* SEO: H3 for sub-sections */}
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">Emotional Voice Generation</h3>
                            <p className="text-gray-600 mb-6">
                                Bring your scripts to life with a range of moods including Laughing, Angry, Cheerful, and Sad. Our AI captures the nuance of human emotion, making your content more engaging.
                            </p>
                            <a href="#voice-generator" className="text-indigo-600 font-semibold hover:text-indigo-800 transition duration-200">
                                Try Emotional Voices &rarr;
                            </a>
                        </div>
                        <div className="order-2 md:order-2">
                           <div className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center p-4">
                               <img src="/emotional.png" alt="Abstract illustration of sound waves morphing into emotions, representing emotional voice generation." className="rounded-xl w-full h-full object-cover" />
                           </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="order-3 md:order-4">
                            <div className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center p-4">
                                <img src="/texttosound.png" alt="Illustration of easy text input field, showing the simplicity of our text-to-speech process." className="rounded-xl w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="order-4 md:order-3">
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">Easy Text Input</h3>
                            <p className="text-gray-600 mb-6">
                                Simply paste your script into our intuitive editor. We make text-to-speech effortless, so you can focus on creating.
                            </p>
                            <a href="#voice-generator" className="text-indigo-600 font-semibold hover:text-indigo-800 transition duration-200">
                                See How Simple It Is &rarr;
                            </a>
                        </div>

                        {/* Feature 3 */}
                        <div className="order-5 md:order-5">
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">Preview and Download</h3>
                            <p className="text-gray-600 mb-6">
                                Listen to your generated audio instantly. Download your clips as a single, high-quality WAV file, ready for your video projects.
                            </p>
                            <a href="#audio-manager" className="text-indigo-600 font-semibold hover:text-indigo-800 transition duration-200">
                                Check Downloads Manager &rarr;
                            </a>
                        </div>
                        <div className="order-6 md:order-6">
                            <div className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center p-4">
                                <img src="/previw.png" alt="Person listening to audio with headphones and a download icon, illustrating the preview and download feature." className="rounded-xl w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="container mx-auto text-center max-w-5xl">
                    <h2 className="text-4xl font-bold text-gray-800 mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-6 rounded-3xl shadow-lg mb-6">
                                <img src="/previwand.png" alt="Step 1: Write your script." className="rounded-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Write Your Script</h3>
                            <p className="text-gray-600">Simply type or paste the text you want to convert to speech. No complex setup required.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-6 rounded-3xl shadow-lg mb-6">
                                <img src="/voicetone.png" alt="Step 2: Choose your voice and mood." className="rounded-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Choose Your Voice & Mood</h3>
                            <p className="text-gray-600">Select from a variety of voices and apply a mood like Happy, Sad, or Angry to your text.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-6 rounded-3xl shadow-lg mb-6">
                                <img src="/previwhow.png" alt="Step 3: Generate and download your audio." className="rounded-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Generate & Download</h3>
                            <p className="text-gray-600">Click generate and download your high-quality audio file instantly. Merge multiple clips if needed.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main TTS Interface Section - Modified for showcase */}
            <section id="voice-generator" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-100">
                <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-6 md:p-12 space-y-8">
                    <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">AI Voice Preview</h2>
                    <p className="text-gray-600 text-center mb-6">Experience our high-quality AI voice generation with this pre-made audio clip.</p>
                    
                    {/* New Audio Player with Wave Animation */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative w-full max-w-xl">
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Wave animation - purely decorative, but adds visual interest */}
                                <div className="absolute w-3/4 h-3/4 animate-pulse-slow">
                                    <div className="w-full h-full rounded-full bg-indigo-200 opacity-50 absolute animate-wave1"></div>
                                    <div className="w-full h-full rounded-full bg-purple-200 opacity-50 absolute animate-wave2"></div>
                                    <div className="w-full h-full rounded-full bg-indigo-300 opacity-50 absolute animate-wave3"></div>
                                </div>
                            </div>
                            <div className="relative z-10 p-4 bg-gray-50 rounded-xl shadow-inner">
                                <audio controls className="w-full">
                                    <source src={audioClips[0].url} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        </div>
                        {/* Display the Hindi dialogue as the text caption */}
                        <p className="text-center font-medium text-gray-700">{audioClips[0].text}</p>
                        {/* <button
                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={() => handleDownload(audioClips[0].url, 'ai-voice-preview.mp3')}
                        >
                            <span className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                <span>Download this Preview</span>
                            </span>
                        </button> */}
                    </div>
                </div>
            </section>

            {/* Audio Manager Section - Removed since it's not needed */}

            {/* Testimonials Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="container mx-auto max-w-5xl text-center">
                    <h2 className="text-4xl font-bold text-gray-800 mb-12">What Our Creators Say</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg">
                            <p className="text-gray-600 mb-4 italic">"Hearo has transformed my YouTube channel. The emotional voices make my characters feel so real! It's a game-changer for my animation videos."</p>
                            <div className="font-semibold text-gray-800">- Jane D.</div>
                        </div>
                        {/* Testimonial 2 */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg">
                            <p className="text-gray-600 mb-4 italic">"The merge feature is a lifesaver. I can create an entire video script's voiceover in minutes without paying for a studio. Highly recommend this for any content creator."</p>
                            <div className="font-semibold text-gray-800">- Alex R.</div>
                        </div>
                        {/* Testimonial 3 */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg">
                            <p className="text-gray-600 mb-4 italic">"I use the angry mood for my gaming commentary, and it's perfect. The voice quality is fantastic, and it's incredibly fast. My editing workflow has never been smoother."</p>
                            <div className="font-semibold text-gray-800">- Chris B.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section id="contact" className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white py-20 px-4 sm:px-6 lg:px-8 text-center rounded-t-[40px] shadow-xl">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-4xl font-bold mb-4">Ready to Elevate Your Content?</h2>
                    <p className="text-lg mb-8 opacity-90">Join thousands of content creators who use Hearo to produce captivating voiceovers.</p>
                    <a href="#voice-generator" className="inline-block bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105">
                        Get Started for Free
                    </a>
                </div>
            </section>

            {/* New CSS for wave animations */}
            <style jsx>{`
                @keyframes wave1 {
                    0% { transform: scale(0.6); opacity: 0.5; }
                    50% { transform: scale(1); opacity: 0; }
                    100% { transform: scale(0.6); opacity: 0.5; }
                }
                @keyframes wave2 {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(0.3); opacity: 0; }
                }
                @keyframes wave3 {
                    0% { transform: scale(0); opacity: 0.2; }
                    50% { transform: scale(0.6); opacity: 0.6; }
                    100% { transform: scale(0); opacity: 0.2; }
                }
                .animate-wave1 {
                    animation: wave1 3s infinite ease-in-out;
                }
                .animate-wave2 {
                    animation: wave2 3s infinite 0.5s ease-in-out;
                }
                .animate-wave3 {
                    animation: wave3 3s infinite 1s ease-in-out;
                }
            `}</style>
        </main>
    );
}