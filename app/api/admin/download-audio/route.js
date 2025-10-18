export async function GET(req) {
  try {
    const url = new URL(req.url).searchParams.get('url');
    const filename = new URL(req.url).searchParams.get('filename') || 'audio.mp3';
    if (!url) return new Response('Missing url', { status: 400 });

    const upstream = await fetch(url, { redirect: 'follow' });
    if (!upstream.ok) return new Response('Upstream fetch failed', { status: 502 });

    const headers = new Headers();
    headers.set('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    const contentLength = upstream.headers.get('content-length');
    if (contentLength) headers.set('Content-Length', contentLength);
    headers.set('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"`);
    headers.set('Cache-Control', 'no-store');

    return new Response(upstream.body, { status: 200, headers });
  } catch (err) {
    console.error('download-audio error', err);
    return new Response('Server error', { status: 500 });
  }
}
