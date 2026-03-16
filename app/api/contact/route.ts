import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true, // true za 465, false za 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Vitaminko" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "Novo povpraševanje iz Vitaminko",
      html: `
        <h2>Nov lead iz chatbota</h2>
        <p><b>Ime:</b> ${body.name}</p>
        <p><b>Email:</b> ${body.email}</p>
        <p><b>Sporočilo:</b></p>
        <p>${body.message || "-"}</p>
      `,
    })

    return NextResponse.json({ success: true })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Napaka pri pošiljanju emaila" },
      { status: 500 }
    )

  }
}
