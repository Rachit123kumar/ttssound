import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

export async function POST(req) {
  try {
    const { text } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Generate short image search queries from text." },
        { role: "user", content: `Text: "${text}" Return 3-6 prompts.` }
      ],
    });

    const promptsRaw = response.choices[0].message.content;
    const prompts = promptsRaw.split("\n").filter(line => line.trim() !== "");
    return new Response(JSON.stringify({ prompts }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
