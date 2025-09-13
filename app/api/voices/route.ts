// app/api/voices/route.js
import { NextResponse } from "next/server";

export async function GET() {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    return NextResponse.json(
      { error: "Azure speech key or region is missing" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": speechKey,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch voices" },
        { status: response.status }
      );
    }

    const voices = await response.json();
    return NextResponse.json(voices);
  } catch (error) {
    console.error("Error fetching voices:", error);
    return NextResponse.json(
      { error: "Something went wrong while fetching voices" },
      { status: 500 }
    );
  }
}
