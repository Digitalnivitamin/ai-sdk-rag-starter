import OpenAI from "openai";
import { getSiteUrls } from "@/lib/sitemap";
import { extractText } from "@/lib/extract";

export async function POST(req: Request) {

  const body = await req.json();

  const urls = await getSiteUrls();

  const firstPages = urls.slice(0,5);

  let content = "";

  for(const url of firstPages){

    const html = await fetch(url).then(r=>r.text());

    content += extractText(html).slice(0,2000);

  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const completion = await client.chat.completions.create({
    model:"gpt-4o-mini",
    messages:[
      {
        role:"system",
        content:"Use the following website content to answer questions:\n"+content
      },
      {
        role:"user",
        content:body.message
      }
    ]
  });

  return Response.json({
    answer:completion.choices[0].message.content
  });

}
