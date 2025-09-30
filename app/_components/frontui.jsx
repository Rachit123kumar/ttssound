"use client";

import { useState } from 'react';
import Link from 'next/link';

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
            text: `यहाँ एक छोटी प्रेरक कहानी है जिसे आप रील्स के लिए इस्तेमाल कर सकते हैं:

मंज़िल की तलाश
एक छोटे से गाँव में रमेश नाम का एक लड़का रहता था। उसका सपना था कि वह एक दिन एक बड़ा पर्वतारोही बनेगा।

गाँव के लोग उस पर हँसते थे। "तुम? पर्वतारोही? यह तुम्हारे बस की बात नहीं," वे कहते थे। रमेश के पास महँगे उपकरण नहीं थे, और न ही कोई प्रशिक्षण। उसके पास थी तो बस अपनी टूटी-फूटी साइकिल और एक ज़बरदस्त इच्छाशक्ति।

एक दिन, उसने अपनी यात्रा शुरू करने का फैसला किया। उसके सामने था एक विशाल, पथरीला पहाड़। पहली कोशिश में वह फिसल गया, उसके घुटनों में चोट लगी, और वह बुरी तरह थक गया। निराशा ने उसे घेर लिया।

वह वहीं बैठ गया। तभी उसकी नज़र एक छोटी-सी चींटी पर पड़ी जो अपने से कई गुना भारी दाना लेकर पहाड़ पर चढ़ने की कोशिश कर रही थी। बार-बार वह फिसलती, गिरती, पर हर बार वह उठकर फिर से प्रयास करती।

रमेश ने उस चींटी को देखा और उसे एक प्रेरणा मिली। उसने सोचा, "अगर यह नन्ही-सी जान हार नहीं मान रही, तो मैं क्यों मानूँ?"

उसने अपनी चोटों को अनदेखा किया, अपनी साइकिल को एक तरफ़ रखा, और फिर से चढ़ना शुरू कर दिया। इस बार उसने छोटे-छोटे कदम लिए, पूरी एकाग्रता के साथ। जब भी वह थकने लगता, उसे उस चींटी की लगातार कोशिश याद आती।

कई दिनों और रातों की मेहनत के बाद, रमेश आखिरकार चोटी पर पहुँच गया। जब उसने नीचे देखा, तो पूरा गाँव एक छोटे से डिब्बे जैसा लग रहा था।

सीख
ज़िंदगी में सफलता का रास्ता कभी आसान नहीं होता। जब दुनिया कहे 'तुम नहीं कर सकते', तो चींटी की तरह बनो। अपनी मंज़िल पर आँखें रखो, और तब तक कोशिश करो जब तक तुम चोटी पर न पहुँच जाओ। आपकी सबसे बड़ी शक्ति आपकी 'इच्छाशक्ति' है।`,
            // The new audio URL
            url: 'https://pub-105fec70566540d1a4cf3698e960bfa4.r2.dev/speech/1d7527bc-f396-479d-82c6-771d1c4ee832.mp3',
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
                        {/* New link for the multi-speaker feature */}
                        <Link href="/multispeaker" className="block mt-4 md:mt-0 text-gray-700 hover:text-indigo-600 transition duration-200 font-medium">Multi-Speaker</Link>
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
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link href="/azure" className="inline-block bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105">
                            Start Generating
                        </Link>
                        {/* New CTA button for multi-speaker */}
                        <Link href="/multispeaker" className="inline-block bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-white hover:text-indigo-700 transition duration-300 transform hover:scale-105">
                            Multi-Speaker TTS
                        </Link>
                    </div>
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
                            <a href="/azure" className="text-indigo-600 font-semibold hover:text-indigo-800 transition duration-200">
                                Try Emotional Voices &rarr;
                            </a>
                        </div>
                        <div className="order-2 md:order-2">
                            <div className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center p-4">
                                <img src="/emotional.png" alt="Abstract illustration of sound waves morphing into emotions, representing emotional voice generation." className="rounded-xl w-full h-full object-cover" />
                            </div>
                        </div>

                        {/* New Feature Block for Multi-Speaker */}
                        <div className="order-3 md:order-4">
                            <div className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center p-4">
                                <img src="/multispeaker.png" alt="Illustration of two people talking, representing multi-speaker dialogue." className="rounded-xl w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="order-4 md:order-3">
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">Multi-Speaker Dialogue</h3>
                            <p className="text-gray-600 mb-6">
                                Create realistic conversations for your videos, podcasts, and audiobooks. Our new two-speaker feature allows you to generate dynamic dialogue between distinct voices.
                            </p>
                            <Link href="/multispeaker" className="text-indigo-600 font-semibold hover:text-indigo-800 transition duration-200">
                                Try Dialogue Generation &rarr;
                            </Link>
                        </div>

                        {/* Feature 2 (Original) */}
                        <div className="order-5 md:order-5">
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">Easy Text Input</h3>
                            <p className="text-gray-600 mb-6">
                                Simply paste your script into our intuitive editor. We make text-to-speech effortless, so you can focus on creating.
                            </p>
                            <a href="/azure" className="text-indigo-600 font-semibold hover:text-indigo-800 transition duration-200">
                                See How Simple It Is &rarr;
                            </a>
                        </div>
                        <div className="order-6 md:order-6">
                            <div className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center p-4">
                                <img src="/texttosound.png" alt="Illustration of easy text input field, showing the simplicity of our text-to-speech process." className="rounded-xl w-full h-full object-cover" />
                            </div>
                        </div>

                        {/* Feature 3 (Original) */}
                        <div className="order-7 md:order-7">
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">Preview and Download</h3>
                            <p className="text-gray-600 mb-6">
                                Listen to your generated audio instantly. Download your clips as a single, high-quality WAV file, ready for your video projects.
                            </p>
                            <a href="/azure" className="text-indigo-600 font-semibold hover:text-indigo-800 transition duration-200">
                                Check Downloads Manager &rarr;
                            </a>
                        </div>
                        <div className="order-8 md:order-8">
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
                            <p className="text-gray-600">Simply type or paste the text or dialogue you want to convert to speech. No complex setup required.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-6 rounded-3xl shadow-lg mb-6">
                                <img src="/voicetone.png" alt="Step 2: Choose your voice and mood." className="rounded-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Choose Your Voice & Mood</h3>
                            <p className="text-gray-600">Select from a variety of voices and apply a mood like Happy, Sad, or Angry to your text. Choose two for dialogue!</p>
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
           <section
  id="voice-generator"
  className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50"
>
  <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8">
    <h2 className="text-4xl font-extrabold text-center text-gray-800">
      AI Voice Preview
    </h2>
    <p className="text-gray-600 text-center max-w-lg mx-auto">
      Experience our high-quality AI voice generation with this pre-made
      motivational story.
    </p>

    {/* Audio Player with Wave Animation */}
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Decorative Wave Animation */}
          <div className="absolute w-3/4 h-3/4 animate-pulse-slow">
            <div className="w-full h-full rounded-full bg-indigo-200 opacity-40 absolute animate-wave1"></div>
            <div className="w-full h-full rounded-full bg-purple-200 opacity-40 absolute animate-wave2"></div>
            <div className="w-full h-full rounded-full bg-indigo-300 opacity-40 absolute animate-wave3"></div>
          </div>
        </div>
        <div className="relative z-10 p-4 bg-gray-50 rounded-2xl shadow-inner">
          <audio controls className="w-full">
            <source
              src={audioClips[0].url}
              type="audio/mpeg"
            />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>

      {/* Story with Expand/Collapse */}
      <div className="w-full max-w-2xl">
        <details className="group bg-gray-50 rounded-xl shadow-inner p-4 cursor-pointer">
          <summary className="flex justify-between items-center font-semibold text-gray-800">
            <span>Read the story in Hindi</span>
            <span className="text-indigo-500 group-open:rotate-180 transform transition-transform">
              ▼
            </span>
          </summary>
          <p className="mt-3 text-gray-700 leading-relaxed max-h-64 overflow-y-auto pr-2">
            {audioClips[0].text}
          </p>
        </details>
      </div>
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