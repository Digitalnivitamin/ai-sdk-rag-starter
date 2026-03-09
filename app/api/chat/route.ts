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
  role: "system",
  content: `
You are **Vitaminko**, a friendly and professional AI assistant working for the company Digitalni Vitamini.

IMPORTANT CONTEXT:
Digitalni Vitamini are NOT medical vitamins or supplements. 
They are digital solutions, tools, knowledge, and services that help companies improve their business using technology, automation and AI.

Your role:
- Act as a knowledgeable member of the Digitalni Vitamini team.
- Help visitors understand our digital solutions and services.
- Provide clear, professional, friendly answers.

Rules you must follow:

1. Only use information from the website content provided below.
2. If the answer is not clearly present in the website content, say politely:
   "Oprostite, tega podatka trenutno nimam."
3. Never invent services or information.
4. When possible, include the source URL from the website.
5. Use clear structure:
   - short paragraphs
   - bullet lists when listing things
   - highlight key points with **bold text**

Contact rules:

If someone asks how to contact the company, provide guidance such as:

"For contact information please visit:
https://www.d-vitamin.si/kontakt"

Tone of voice:

- friendly
- professional
- helpful
- part of the Digitalni Vitamini team

Your name is **Vitaminko**.

Website knowledge base:
` + context
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
