'use client'

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { motion } from "framer-motion"
import Image from "next/image"

export default function ChatPage() {

  const [messages,setMessages] = useState<any[]>([
  {
    role:"assistant",
    content:`Živjo! Jaz sem **Vitaminko**, vaš digitalni svetovalec iz ekipe Digitalni Vitamini. 👋

    Kako vam lahko danes pomagam?`
  }
])

  const [input,setInput] = useState("")
  const [loading,setLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages])

  const quickQuestions = [
    "Katere digitalne rešitve ponujate podjetjem?",
    "Ali mi lahko pokažete primere projektov?",
    "Kako lahko izboljšamo naše poslovne procese?"
  ]

  async function ask(e:any, customQuestion?:string){

    if(e) e.preventDefault()

    const question = customQuestion || input

    if(!question.trim()) return

    const userMessage = {role:"user",content:question}

    setMessages(prev=>[...prev,userMessage])

    setLoading(true)

    const res = await fetch("/api/chat",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        message:question
      })
    })

    const data = await res.json()

    setMessages(prev=>[
      ...prev,
      {
        role:"assistant",
        content:data.answer,
        sources:data.sources
      }
    ])

    setInput("")
    setLoading(false)

  }

  return (

    <main className="max-w-3xl mx-auto p-6 h-screen flex flex-col">

      <h1 className="text-2xl font-bold mb-6">
        Vitaminko AI Svetovalec
      </h1>

      <div className="flex-1 overflow-y-auto space-y-6 mb-6">

        {messages.map((m,i)=>(

          <motion.div
            key={i}
            initial={{opacity:0,y:10}}
            animate={{opacity:1,y:0}}
            className={`flex gap-3 ${m.role==="user"?"justify-end":"justify-start"}`}
          >

            {m.role === "assistant" && (

              <Image
                class="h-10 w-10 rounded-full"
                src="/images/vitaminko.png"
                alt="Vitaminko"
                width={36}
                height={36}
                className="rounded-full"
              />

            )}

            <div
              className={
                m.role==="user"
                ? "bg-blue-500 text-white p-3 rounded-lg max-w-[70%]"
                : "bg-gray-100 p-3 rounded-lg max-w-[70%]"
              }
            >

              <ReactMarkdown
  className="max-w-none text-[14px] leading-relaxed"
  components={{

    p: ({node, ...props}) => (
      <p className="mb-4 leading-relaxed" {...props} />
    ),

    em: ({node, ...props}) => (
      <em className="italic text-gray-700" {...props} />
    ),

    ul: ({node, ...props}) => (
      <ul className="list-disc ml-6 mb-4 space-y-1 text-gray-800" {...props} />
    ),

    ol: ({node, ...props}) => (
      <ol className="list-decimal ml-6 mb-4 space-y-1 text-gray-800" {...props} />
    ),

    li: ({node, ...props}) => (
      <li {...props} />
    ),

    a: ({node, ...props}) => (
      <a
        className="underline text-blue-600 hover:text-blue-800"
        target="_blank"
        {...props}
      />
    ),

    table: ({node, ...props}) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-full border border-gray-200 text-sm" {...props} />
      </div>
    ),

    thead: ({node, ...props}) => (
      <thead className="bg-gray-100 text-left" {...props} />
    ),

    th: ({node, ...props}) => (
      <th className="border px-3 py-2 font-semibold" {...props} />
    ),

    td: ({node, ...props}) => (
      <td className="border px-3 py-2" {...props} />
    )

  }}
>
  {m.content}
</ReactMarkdown>

              {/* SOURCE LINKS */}

              {m.sources && (

                <div className="mt-2 text-xs text-gray-500">

                  Vir:

                  {m.sources.slice(0,2).map((s:any,i:number)=>(
                    <div key={i}>
                      <a
                        href={s}
                        target="_blank"
                        className="underline"
                      >
                        {s}
                      </a>
                    </div>
                  ))}

                </div>

              )}

              {/* COPY BUTTON */}

              {m.role === "assistant" && (

                <button
                  onClick={()=>navigator.clipboard.writeText(m.content)}
                  className="text-xs text-gray-400 mt-2 hover:text-black"
                >
                  Kopiraj odgovor
                </button>

              )}

            </div>

          </motion.div>

        ))}

        {/* QUICK BUTTONS */}

        {messages.length === 1 && (

          <div className="flex flex-wrap gap-2">

            {quickQuestions.map((q,i)=>(
              <button
                key={i}
                onClick={()=>ask(null,q)}
                className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-100 transition"
              >
                {q}
              </button>
            ))}

          </div>

        )}

        {loading && (
        
          <div className="text-gray-500 text-sm italic">
            Vitaminko pripravlja odgovor...
          </div>
        
        )}

        <div ref={bottomRef}/>

      </div>

      <form onSubmit={ask} className="flex gap-2">

        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Vprašajte Vitaminka..."
          className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          disabled={loading}
          className="bg-black text-white px-5 py-3 rounded-lg disabled:opacity-40"
        >
          Pošlji
        </button>

      </form>

    </main>

  )
}
