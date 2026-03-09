'use client'

import { useChat } from "ai/react"
import { useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { motion } from "framer-motion"

export default function ChatPage() {

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat"
  })

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  },[messages])

  return (

    <main className="max-w-3xl mx-auto p-6 h-screen flex flex-col">

      <h1 className="text-2xl font-bold mb-6">
        AI Website Assistant
      </h1>

      {/* CHAT AREA */}

      <div className="flex-1 overflow-y-auto space-y-4 mb-6">

        {messages.map((m,i)=>(

          <motion.div
            key={i}
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.25 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >

            <div
              className={
                m.role === "user"
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

        {isLoading && (

          <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            className="text-sm text-gray-500"
          >
            AI is typing...
          </motion.div>

        )}

        <div ref={bottomRef} />

      </div>

      {/* INPUT */}

      <form onSubmit={handleSubmit} className="flex gap-2">

        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about vitamin D..."
          className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          disabled={isLoading}
          className="bg-black text-white px-5 py-3 rounded-lg disabled:opacity-40"
        >
          Ask
        </button>

      </form>

    </main>

  )
}
