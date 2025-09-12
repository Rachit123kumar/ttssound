import Head from 'next/head';
import Home from './_components/frontui';

<Head>
  <title>AI Voice Generator | Generate Realistic AI Voices</title>
  <meta name="description" content="Create natural-sounding AI voices with customizable emotions and tones. Generate, merge, and download voice clips instantly for free." />
  <meta name="keywords" content="AI voice generator, text to speech, realistic voices, emotional voice, free TTS" />
  <meta name="robots" content="index, follow" />
  <meta property="og:title" content="AI Voice Generator" />
  <meta property="og:description" content="Create natural AI voices with different emotions and download them as WAV files." />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="/seo-preview.png" />
</Head>


export default function Page(){
    return <Home/>
}
