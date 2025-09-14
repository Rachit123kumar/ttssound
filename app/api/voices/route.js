import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const language = searchParams.get("language");

    if (!language) {
      return NextResponse.json({ error: "Language is required" }, { status: 400 });
    }

    // Fetch voice list from Azure
    const response = await fetch(
      `https://${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
      {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch voices from Azure");
    }

    const voices = await response.json();

    // Filter voices by the selected language
    const filteredVoices = voices.filter(
      (voice) => voice.Locale.toLowerCase() === language.toLowerCase()
    );

    return NextResponse.json(filteredVoices);
  } catch (error) {
    console.error("Error fetching Azure voices:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
