import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { text, voice } = await req.json();

        if (!text || !voice) {
            return NextResponse.json({ error: 'Text and voice are required' }, { status: 400 });
        }

        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            console.error("GEMINI_API_KEY is not set in environment variables.");
            return NextResponse.json({ error: 'Server configuration error: API key missing.' }, { status: 500 });
        }
        
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;
        
        const payload = {
            contents: [{
                parts: [{
                    text: text
                }]
            }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: voice
                        }
                    }
                }
            },
            model: "gemini-2.5-flash-preview-tts"
        };
        
        let response;
        for (let i = 0; i < 3; i++) { // Exponential backoff retry
            try {
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response.status !== 429) break;
                await new Promise(res => setTimeout(res, Math.pow(2, i) * 1000));
            } catch (err) {
                if (i === 2) throw err;
            }
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API call failed with status ${response.status}: ${errorText}`);
            return NextResponse.json({ error: `API call failed: ${response.statusText}` }, { status: response.status });
        }

        const result = await response.json();
        const audioPart = result.candidates[0].content.parts[0];
        
        return NextResponse.json({
            audioData: audioPart.inlineData.data,
            mimeType: audioPart.inlineData.mimeType,
        });

    } catch (error) {
        console.error("Error in API route:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
