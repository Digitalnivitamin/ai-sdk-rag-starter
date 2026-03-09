'use client'

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { motion } from "framer-motion"

export default function ChatPage() {

  const [messages,setMessages] = useState<any[]>([])
  const [input,setInput] = useState("")
  const [loading,setLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages])

  async function ask(e:any){

    e.preventDefault()

    if(!input.trim()) return

    const userMessage = {role:"user",content:input}

    setMessages(prev=>[...prev,userMessage])

    setLoading(true)

    const res = await fetch("/api/chat",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        message:input
      })
    })

    const data = await res.json()

    setMessages(prev=>[
      ...prev,
      {
        role:"assistant",
        content:data.answer
      }
    ])

    setInput("")
    setLoading(false)

  }

  return (

    <main className="max-w-3xl mx-auto p-6 h-screen flex flex-col">

      <h1 className="text-2xl font-bold mb-6">
        AI Website Assistant
      </h1>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6">

        {messages.map((m,i)=>(

          <motion.div
            key={i}
            initial={{opacity:0,y:10}}
            animate={{opacity:1,y:0}}
            className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}
          >

            <div
              className={
                m.role==="user"
                ? "bg-blue-500 text-white p-3 rounded-lg max-w-[75%]"
                : "bg-gray-100 p-3 rounded-lg max-w-[75%]"
              }
            >

              <ReactMarkdown className="prose prose-sm">
                {m.content}
              </ReactMarkdown>

            </div>

          </motion.div>

        ))}

        {loading && (

          <div className="text-gray-500 text-sm">
            AI is typing...
          </div>

        )}

        <div ref={bottomRef}/>

      </div>

      <form onSubmit={ask} className="flex gap-2">

        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Kako vam lahko pomagam..."
          className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          disabled={loading}
          className="bg-black text-white px-5 py-3 rounded-lg disabled:opacity-40"
        >
          Vprašaj
        </button>

      </form>

    </main>

  )
}
