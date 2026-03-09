'use client'

import { useChat } from "ai/react"
import { useRef, useEffect } from "react"

export default function ChatPage() {

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat"
  })

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  },[messages])

  return (

    <main className="max-w-3xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        AI Website Assistant
      </h1>

      <div className="space-y-4 mb-6">

        {messages.map((m,i)=>(
          <div
            key={i}
            className={
              m.role === "user"
              ? "bg-blue-100 p-3 rounded"
              : "bg-gray-100 p-3 rounded"
            }
          >
            {m.content}
          </div>
        ))}

        <div ref={bottomRef} />

      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">

        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about vitamin D..."
          className="flex-1 border rounded p-2"
        />

        <button
          disabled={isLoading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Ask
        </button>

      </form>

    </main>

  )
}
