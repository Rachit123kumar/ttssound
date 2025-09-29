import fs from "fs";
import path from "path";
import sdk from "microsoft-cognitiveservices-speech-sdk";

export async function POST(req) {
  try {
    const { text, voice = "en-US-JennyNeural" } = await req.json();

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_TTS_KEY,
      process.env.AZURE_TTS_REGION
    );
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const tempDir = path.join(process.cwd(), "public", "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const audioFileName = `voice-${Date.now()}.mp3`;
    const audioFilePath = path.join(tempDir, audioFileName);

    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFilePath);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    await new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.errorDetails) reject(result.errorDetails);
          else resolve();
        },
        (err) => reject(err)
      );
    });

    return new Response(JSON.stringify({ audioUrl: `/temp/${audioFileName}` }), { status: 200 });
  } catch (err) {
    console.error("Azure TTS SDK error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
