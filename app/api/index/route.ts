import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { getSiteUrls } from "@/lib/sitemap";
import { extractText } from "@/lib/extract";

export async function GET() {

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const urls = await getSiteUrls();

  for (const url of urls) {

    const html = await fetch(url).then(r => r.text());

    const text = extractText(html).slice(0,5000);

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text
    });

    await supabase.from("documents").insert({
      url,
      content: text,
      embedding: embedding.data[0].embedding
    });

  }

  return Response.json({
    indexed: urls.length
  });

}
