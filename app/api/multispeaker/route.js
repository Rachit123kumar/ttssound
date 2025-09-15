// app/api/multispeaker/route.js
import { NextResponse } from "next/server";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// Configure Cloudflare R2 client (S3-compatible)
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
  },
});

/**
 * Helper to sanitize SSML text - escape special chars
 */
function escapeXml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { speakers, rawText } = body;

    if ((!speakers || !Array.isArray(speakers) || speakers.length === 0) && !rawText) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
      return NextResponse.json({ error: "Azure Speech credentials missing" }, { status: 500 });
    }
    if (!process.env.CLOUDFLARE_R2_BUCKET || !process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      return NextResponse.json({ error: "Cloudflare R2 env missing" }, { status: 500 });
    }

    // Build combined SSML for multi speaker
    // We'll produce each speaker's lines sequentially with small breaks between lines
    // Azure MSTTS express-as is applied per line based on `style`
    const header = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
      xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">`;

    let bodySsml = "";

    if (rawText && typeof rawText === "string" && rawText.trim().length > 0) {
      // If user supplied raw structured text, use it as a single voice default (choose first speaker voice if exists)
      const voiceName = (speakers && speakers[0] && speakers[0].voice) || "en-US-JennyNeural";
      const safe = escapeXml(rawText);
      bodySsml += `<voice name="${voiceName}">${safe}</voice>`;
    } else {
      // Iterate speakers and lines
      for (const sp of speakers) {
        const voiceName = sp.voice || (speakers[0] && speakers[0].voice) || "en-US-JennyNeural";
        if (!Array.isArray(sp.lines) || sp.lines.length === 0) continue;

        for (const line of sp.lines) {
          const text = line.text || "";
          const style = line.style || "calm";
          if (!text.trim()) continue;
          const safeText = escapeXml(text.trim());

          // Use a short break after each line to avoid overlapping
          bodySsml += `
            <voice name="${voiceName}">
              <mstts:express-as style="${style}">
                ${safeText}
              </mstts:express-as>
              <break time="300ms" />
            </voice>
          `;
        }
      }
    }

    const footer = `</speak>`;
    const combinedSSML = header + bodySsml + footer;

    // Setup Azure speech config
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    // choose output format (mp3 mono)
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    // Create synthesizer with pull stream to capture audio into memory
    const audioStream = sdk.AudioOutputStream.createPullStream();
    const audioConfig = sdk.AudioConfig.fromStreamOutput(audioStream);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    // speakSsmlAsync returns result with audioData (Uint8Array)
    const result = await new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        combinedSSML,
        (res) => {
          try {
            synthesizer.close();
          } catch (e) {}
          resolve(res);
        },
        (err) => {
          try {
            synthesizer.close();
          } catch (e) {}
          reject(err);
        }
      );
    });

    if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted) {
      console.error("Azure synthesis result:", result);
      return NextResponse.json({ error: "Speech synthesis failed" }, { status: 500 });
    }

    // result.audioData is a Uint8Array (node)
    const audioData = Buffer.from(result.audioData);

    // Upload to Cloudflare R2
    const fileKey = `speech/${randomUUID()}.mp3`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: fileKey,
        Body: audioData,
        ContentType: "audio/mpeg",
        // ACL may not be necessary for R2 depending on permissions; remove if failing
      })
    );

    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL.replace(/\/$/, "")}/${fileKey}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Speech generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error while generating speech" },
      { status: 500 }
    );
  }
}
