// app/api/upload-image/route.js
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

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
    const { imageBase64, filename } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: "Missing image" }, { status: 400 });

    // data url may include header "data:image/png;base64,...."
    const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    let mime = "image/png";
    let b64data = imageBase64;
    if (match) {
      mime = match[1];
      b64data = match[2];
    } else {
      // Maybe only raw base64 was sent
      b64data = imageBase64;
    }

    const buffer = Buffer.from(b64data, "base64");
    const ext = (mime.split("/")[1] || "png").replace("jpeg", "jpg");
    const key = `images/${randomUUID()}.${ext}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mime,
    }));

    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("upload-image error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
