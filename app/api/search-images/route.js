export async function POST(req) {
  try {
    const { query } = await req.json();

    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`, {
      headers: { Authorization: process.env.PEXELS_API_KEY }
    });

    const data = await res.json();
    return new Response(JSON.stringify({ photos: data.photos }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
