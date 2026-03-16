import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {

  const body = await req.json()

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  // Create embedding for user question

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: body.message
  })

  // Search similar documents in Supabase

  const { data } = await supabase.rpc("match_documents", {
    query_embedding: embedding.data[0].embedding,
    match_count: 4
  })

  // Build context (optimized)

  const context = data.map((d:any)=>

`URL: ${d.url}
TEXT:
${d.content.slice(0,1200)}
`
).join("\n\n")

  // Ask GPT

  const completion = await openai.chat.completions.create({

    model: "gpt-4o-mini",
    temperature: 0.2,
    max_tokens: 500,

    messages: [

      {
        role: "system",
        content: `
You are **Vitaminko**, a friendly AI assistant representing **Digitalni Vitamini**.

LANGUAGE
- Respond in Slovenian unless the user writes in another language.

KNOWLEDGE RULES
- Use ONLY the information from the provided website context.
- Do NOT invent information.
- If something is not available say:
"O tem nimam dovolj informacij na spletni strani."

WEBSITE KNOWLEDGE BASE
${context}

RESPONSE STYLE
- Friendly digital consultant tone
- Clear and structured responses
- Short paragraphs
- Use bullet points when useful
- Bold important information

LINKS
When referencing website content include the URL if available.

CONVERSATION GOAL
Help visitors understand:
- what Digitalni Vitamini does
- what solutions we offer
- how we can help their business

When appropriate ask one helpful follow-up question to better understand the user's needs.
`
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
