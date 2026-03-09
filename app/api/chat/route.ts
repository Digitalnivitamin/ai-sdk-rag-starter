import OpenAI from "openai";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: body.message }
      ]
    });

    return Response.json({
      answer: completion.choices[0].message.content
    });

  } catch (e:any) {

    return Response.json({
      error: e.message
    }, { status: 500 });

  }

}
