import { NextResponse } from "next/server";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

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
    const body = await req.json();
    const text = body.text;
    const language = body.language;
    const voice = body.voice;

    console.log("Incoming request:", { text, language, voice });

    if (!text || !language || !voice) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Azure Speech setup
    if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
      console.error("Azure key or region missing");
      return NextResponse.json({ error: "Azure config missing" }, { status: 500 });
    }

    console.log("Azure region:", process.env.AZURE_SPEECH_REGION);

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );

    speechConfig.speechSynthesisLanguage = language;
    speechConfig.speechSynthesisVoiceName = voice;

    const audioStream = sdk.AudioOutputStream.createPullStream();
    const audioConfig = sdk.AudioConfig.fromStreamOutput(audioStream);

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    console.log("Starting speech synthesis...");

    const result = await new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        function (res) {
          console.log("Speech synthesis completed", res);
          synthesizer.close();
          resolve(res);
        },
        function (error) {
          console.error("Speech synthesis failed:", error);
          synthesizer.close();
          reject(error);
        }
      );
    });

    if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted) {
      console.error("Speech synthesis reason:", result.reason);
      return NextResponse.json({ error: "Speech generation failed" }, { status: 500 });
    }

    console.log("Speech synthesis successful!");

    const audioData = Buffer.from(result.audioData);

    // Upload to Cloudflare R2
    const fileKey = `speech/${randomUUID()}.mp3`;
    console.log("Uploading to R2:", fileKey);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: fileKey,
        Body: audioData,
        ContentType: "audio/mpeg",
        ACL: "public-read",
        
      })
    );

    console.log("Upload successful!");

    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileKey}`;
    console.log("Generated URL:", publicUrl);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Error generating speech:", error.message || error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
