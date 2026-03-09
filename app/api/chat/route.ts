import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {

  const body = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: body.message
  });

  const { data } = await supabase.rpc("match_documents", {
    query_embedding: embedding.data[0].embedding,
    match_count: 5
  });

  const context = data.map((d:any)=>d.content).join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
         role:"system",
         content:`
        Answer using the website content.
        
        Formatting rules:
        
        - Use Markdown
        - Use **bold** for key information
        - Use bullet lists when listing items
        - Include the source URL if possible
        - Structure answers clearly
        `
        },
      {
        role: "user",
        content: body.message
      }
    ]
  });

  return Response.json({
    answer: completion.choices[0].message.content
  });

}
