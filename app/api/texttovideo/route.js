import { NextResponse } from "next/server";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { parseBuffer } from "music-metadata";

// Cloudflare R2 client
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
  },
});

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
      return NextResponse.json({ error: "Azure config missing" }, { status: 500 });
    }

    // Azure TTS setup
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural"; // default voice

    const audioStream = sdk.AudioOutputStream.createPullStream();
    const audioConfig = sdk.AudioConfig.fromStreamOutput(audioStream);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    // Generate audio
    const result = await new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        res => {
          synthesizer.close();
          resolve(res);
        },
        err => {
          synthesizer.close();
          reject(err);
        }
      );
    });

    if (!result || result.reason !== sdk.ResultReason.SynthesizingAudioCompleted) {
      return NextResponse.json({ error: "Speech generation failed" }, { status: 500 });
    }

    const audioData = Buffer.from(result.audioData);

    // Get audio duration
    let durationSeconds = 0;
    try {
      const metadata = await parseBuffer(audioData, "audio/mpeg");
      durationSeconds = metadata.format.duration || 0;
    } catch (err) {
      console.warn("Failed to get audio duration:", err.message);
    }

    // Upload to Cloudflare R2
    const fileKey = `speech/${randomUUID()}.mp3`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: fileKey,
        Body: audioData,
        ContentType: "audio/mpeg",
        ACL: "public-read",
      })
    );

    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileKey}`;

    return NextResponse.json({
      url: publicUrl,
      duration: durationSeconds,
    });
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
