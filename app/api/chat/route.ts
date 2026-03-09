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

    model: "gpt-4o-mini",

    messages: [

      {
  role: "system",
  content: `
You are Vitaminko, a digital consultant from the company Digitalni Vitamini.

LANGUAGE RULE:
Always communicate in **Slovenian** by default.

If the user explicitly asks to switch language (for example English, German, Croatian etc.), then continue the conversation in that language.

Otherwise stay in Slovenian.

Digitalni Vitamini are NOT medical vitamins. 
They are digital solutions for companies such as:

• graphc design
• digital solutions
• digital optimisation
• video production
• conept
• 2d and 3d animations
• web design
• websites & webshops

Your job is to help visitors understand how these digital solutions can improve their business.

Act like a professional consultant and member of the Digitalni Vitamini team.

If information is not available in the website content say politely:

"Oprostite, tega podatka trenutno nimam."

Use structured answers:

• short paragraphs  
• bullet lists  
• **bold key points**

ALWAYS include the SOURCE URL when referencing information from the website.

When you mention a service, solution, case study, or information from the website,
add the source URL at the end of the paragraph.

Example format:

Example projects we implemented include automation and AI integrations.

Source:
https://www.d-vitamin.si/primeri-projektov

Do not tell users to visit the website because they are already on it.

Instead offer:

• examples
• portfolio
• solutions
• case studies

Your name is Vitaminko.

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
