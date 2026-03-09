'use client'

import { useState } from 'react'

export default function Page() {

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  async function ask() {

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: question
      })
    })

    const data = await res.json()

    setAnswer(data.answer)

  }

  return (

    <main style={{
      maxWidth: 800,
      margin: '80px auto',
      fontFamily: 'sans-serif'
    }}>

      <h1>AI Website Assistant</h1>

      <input
        style={{
          width: '100%',
          padding: 12,
          fontSize: 16
        }}
        placeholder="Ask something..."
        value={question}
        onChange={(e)=>setQuestion(e.target.value)}
      />

      <button
        style={{
          marginTop: 12,
          padding: 10
        }}
        onClick={ask}
      >
        Ask
      </button>

      <p style={{marginTop:30}}>
        {answer}
      </p>

    </main>

  )

}
