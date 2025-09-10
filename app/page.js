"use client";

import { useState, useEffect } from 'react';

// SEO metadata is handled in layout.js or page.js in the App Router
// export const metadata = {
//     title: "AI Voice Generator & Audio Merger - Free TTS Tool",
//     description: "Generate high-quality AI voices from text. Merge multiple audio clips and download the combined file for free. A simple, fast text-to-speech tool.",
// };

// Utility function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Utility function to pack PCM data into a WAV file format
function pcmToWav(pcm16, sampleRate = 16000) {
    const numSamples = pcm16.length;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + numSamples * 2, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (1 = PCM)
    view.setUint16(20, 1, true);
    // number of channels
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate
    view.setUint32(28, sampleRate * 2, true);
    // block align
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, numSamples * 2, true);

    // write the PCM samples
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
        view.setInt16(offset, pcm16[i], true);
        offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}

// Custom message box function
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
    const [textInput, setTextInput] = useState('');
    const [voiceSelect, setVoiceSelect] = useState('Zephyr');
    const [isLoading, setIsLoading] = useState(false);
    const [audioQueue, setAudioQueue] = useState([]);
    const [mergedAudioBlob, setMergedAudioBlob] = useState(null);
    const [currentEmotionPrefix, setCurrentEmotionPrefix] = useState("");
    const [selectedAudios, setSelectedAudios] = useState([]);

    const emotions = [
        { label: "Cheerful", prefix: "Say cheerfully:" },
        { label: "Sad", prefix: "Say in a sad tone:" },
        { label: "Playful", prefix: "Say in a playful tone:" },
        { label: "Serious", prefix: "Say in a serious tone:" },
        { label: "Low Voice", prefix: "Say in a low voice:" },
        { label: "Angry Mood", prefix: "Say in an angry tone:" },
        { label: "High Volume", prefix: "Say loudly:" },
        { label: "Laughing", prefix: "Say with a laugh:" },
        { label: "Crying", prefix: "Say with a crying tone:" },
        { label: "Sleepy", prefix: "Say in a sleepy tone:" },
        { label: "Clear", prefix: "" },
    ];

    const handleGenerateAudio = async () => {
        const text = textInput.trim();
        if (!text) {
            showMessage('Please enter some text to generate audio.');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: currentEmotionPrefix + text, voice: voiceSelect }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to generate audio');
            }

            const data = await res.json();
            const audioData = data.audioData;
            const mimeType = data.mimeType;
            const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)[1], 10);
            const pcmData = base64ToArrayBuffer(audioData);
            const pcm16 = new Int16Array(pcmData);
            const wavBlob = pcmToWav(pcm16, sampleRate);
            const audioUrl = URL.createObjectURL(wavBlob);

            const newAudio = {
                id: Date.now(),
                text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
                url: audioUrl,
                blob: wavBlob
            };
            setAudioQueue(prevQueue => [...prevQueue, newAudio]);

        } catch (error) {
            console.error("Error generating audio:", error);
            showMessage(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMergeSelected = async () => {
        if (selectedAudios.length < 2) return;

        showMessage('Merging audio files...');

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffers = [];

        try {
            const selectedItems = audioQueue.filter(item => selectedAudios.includes(item.id));
            for (const item of selectedItems) {
                const arrayBuffer = await item.blob.arrayBuffer();
                const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);
                buffers.push(decodedAudio);
            }

            const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
            const mergedBuffer = audioContext.createBuffer(1, totalLength, audioContext.sampleRate);
            let offset = 0;
            for (const buffer of buffers) {
                mergedBuffer.copyToChannel(buffer.getChannelData(0), 0, offset);
                offset += buffer.length;
            }

            const float32Data = mergedBuffer.getChannelData(0);
            const pcm16 = new Int16Array(float32Data.length);
            for (let i = 0; i < float32Data.length; i++) {
                pcm16[i] = Math.max(-1, Math.min(1, float32Data[i])) * 0x7FFF;
            }

            const newMergedBlob = pcmToWav(pcm16, audioContext.sampleRate);
            setMergedAudioBlob(newMergedBlob);
            showMessage('Audio merged successfully!', 'success');

        } catch (error) {
            console.error("Error merging audio:", error);
            showMessage('Failed to merge audio. Please check console for details.', 'error');
        }
    };

    const handleDownloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDeleteAudio = (id) => {
        const audioToDelete = audioQueue.find(item => item.id === id);
        if (audioToDelete) {
            URL.revokeObjectURL(audioToDelete.url);
            setAudioQueue(prevQueue => prevQueue.filter(item => item.id !== id));
            setSelectedAudios(prevSelected => prevSelected.filter(audioId => audioId !== id));
            showMessage('Audio clip deleted.', 'info');
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedAudios(prevSelected => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter(audioId => audioId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    };

    return (
        <main className="bg-gray-100 flex items-center justify-center min-h-screen p-4 md:p-8">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 md:p-12 space-y-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-2">AI Voice Generator</h1>
                <p className="text-lg text-center text-gray-600 mb-8">Generate, manage, and merge your own unique voice clips.</p>

                {/* Main TTS Interface */}
                <div className="space-y-6">
                    <textarea
                        id="textInput"
                        className="w-full p-4 md:p-6 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 placeholder-gray-400 resize-none h-40"
                        placeholder="Type or paste the text you want to convert to speech..."
                        rows="5"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                    />

                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                        <select
                            id="voiceSelect"
                            className="w-full md:w-1/3 p-3 md:p-4 text-gray-700 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                            value={voiceSelect}
                            onChange={(e) => setVoiceSelect(e.target.value)}
                        >
                            <option value="Zephyr">Zephyr (Bright)</option>
                            <option value="Puck">Puck (Upbeat)</option>
                            <option value="Charon">Charon (Informative)</option>
                            <option value="Kore">Kore (Firm)</option>
                            <option value="Fenrir">Fenrir (Excitable)</option>
                            <option value="Leda">Leda (Youthful)</option>
                        </select>

                        <button
                            id="generateBtn"
                            className={`w-full md:w-2/3 flex items-center justify-center space-x-2 text-white font-bold py-3 md:py-4 px-6 rounded-xl transition-all duration-200 shadow-lg ${
                                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            }`}
                            onClick={handleGenerateAudio}
                            disabled={isLoading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.674M12 3v12m0 0l-3.5-3.5M12 15l3.5-3.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{isLoading ? 'Generating...' : 'Generate Audio'}</span>
                        </button>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Tone of Voice</h3>
                        <div className="flex flex-wrap gap-3">
                            {emotions.map(emotion => (
                                <button
                                    key={emotion.label}
                                    className={`emotion-btn py-2 px-4 rounded-full text-sm font-semibold transition-colors ${
                                        currentEmotionPrefix === emotion.prefix
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                    onClick={() => setCurrentEmotionPrefix(emotion.prefix)}
                                >
                                    {emotion.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center mt-8">
                        <div className="spinner"></div>
                    </div>
                )}

                <div className="mt-12 space-y-4" id="audioManager">
                    <h2 className="text-3xl font-bold text-gray-800">Downloads Manager</h2>
                    <div id="audioList" className="space-y-4">
                        {audioQueue.length === 0 ? (
                            <p className="text-gray-500 text-center">No audio clips generated yet.</p>
                        ) : (
                            audioQueue.map(audio => (
                                <div key={audio.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-xl shadow-md space-y-3 md:space-y-0" data-id={audio.id}>
                                    <div className="flex-1 w-full flex items-center space-x-4">
                                        <input
                                            type="checkbox"
                                            className="merge-checkbox form-checkbox h-5 w-5 text-blue-600 rounded-md"
                                            checked={selectedAudios.includes(audio.id)}
                                            onChange={() => handleCheckboxChange(audio.id)}
                                        />
                                        <span className="text-sm md:text-base font-medium text-gray-800 truncate">{audio.text}</span>
                                    </div>
                                    <div className="w-full md:w-auto flex items-center justify-end space-x-2">
                                        <audio controls className="w-full md:w-auto min-w-0 md:min-w-[150px] rounded-lg">
                                            <source src={audio.url} type="audio/wav" />
                                        </audio>
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors duration-200"
                                            title="Download"
                                            onClick={() => handleDownloadBlob(audio.blob, `voice-clip-${audio.id}.wav`)}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        </button>
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors duration-200"
                                            title="Delete"
                                            onClick={() => handleDeleteAudio(audio.id)}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="flex flex-col md:flex-row justify-end space-y-4 md:space-y-0 md:space-x-4 mt-6">
                        <button
                            id="mergeBtn"
                            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                            onClick={handleMergeSelected}
                            disabled={selectedAudios.length < 2}
                        >
                            <span className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-8a1 1 0 102 0 1 1 0 00-2 0zm-3-1a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zm-5 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
                                </svg>
                                <span>Merge Selected</span>
                            </span>
                        </button>
                        <button
                            id="downloadMergedBtn"
                            className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                            onClick={() => handleDownloadBlob(mergedAudioBlob, 'merged-voice-clip.wav')}
                            disabled={!mergedAudioBlob}
                        >
                            <span className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                <span>Download Merged Audio</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
