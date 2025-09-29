import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY|| "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" });

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
