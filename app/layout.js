import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import PlayerProvider from "./_components/PlayerProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata = {
    title: "AI Voice Generator & Audio Merger - Free TTS Tool",
    description: "Generate high-quality AI voices from text. Merge multiple audio clips and download the combined file for free. A simple, fast text-to-speech tool.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
 
           <PlayerProvider>
          {children}
        </PlayerProvider>
        <Analytics/>
      </body>
    </html>
  );
}
