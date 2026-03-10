import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {

  const body = await req.json()

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: body.message
  })

  const { data } = await supabase.rpc("match_documents", {
    query_embedding: embedding.data[0].embedding,
    match_count: 5
  })

  const context = data.map((d:any)=>

  `SOURCE URL: ${d.url}
  
  CONTENT:
  ${d.content}

`
).join("\n\n")

  const completion = await openai.chat.completions.create({

    model: "gpt-4.1",

    messages: [

      {
  role: "system",
  content: `
You are going to help customers to get information about our work. We offer digital solutions. Grafhic design, 2d and 3d animations, video production, photo shooting for products, webdesign, webshops, etc. We are Digital vitamin and our solutions are digital vitamins.

Use slovenian language.

You can search information only on our website. Don't offer any information from other websites.

Website knowledge base:
` + context
},

      {
        role: "user",
        content: body.message
      }

    ]

  })

  return Response.json({
    answer: completion.choices[0].message.content
  })

}
