export const dynamic = "force-dynamic";

import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { getSiteUrls } from "@/lib/sitemap";
import { extractText } from "@/lib/extract";

function chunkText(text: string, size = 800) {
  const chunks: string[] = [];

  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }

  return chunks;
}

export async function GET() {

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const urls = await getSiteUrls();

  // pobrišemo stare embeddinge
  await supabase.from("documents").delete().neq("id", 0);

  let chunkCount = 0;

  for (const url of urls) {

    try {

      const html = await fetch(url).then(r => r.text());

      const text = extractText(html);

      const chunks = chunkText(text, 800);

      for (const chunk of chunks) {

        if (chunk.trim().length < 100) continue;

        const embedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk
        });

        await supabase.from("documents").insert({
          url,
          content: chunk,
          embedding: embedding.data[0].embedding
        });

        chunkCount++;

      }

    } catch (e) {
      console.log("crawl error:", url);
    }

  }

  return Response.json({
    pages: urls.length,
    chunks: chunkCount
  });

}
