'use client'

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import Image from "next/image"
import { motion } from "framer-motion"

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
  
  const [showForm, setShowForm] = useState(false)

  const [form,setForm] = useState({
    name:"",
    email:"",
    message:""
  })

  // ✅ GDPR CONSENT
  const [consent, setConsent] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages, showForm])

  const quickQuestions = [
    "S čim se ukvarjate?",
    "Katere digitalne rešitve ponujate?",
    "O podjetju",
  ]

  async function ask(e:any, customQuestion?:string){

    if(e) e.preventDefault()

    const question = customQuestion || input

    if(!question.trim()) return

    setInput("")

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

    setLoading(false)
  }

  // ✅ SEND FORM (z GDPR check)
  async function sendForm(){

    if(!form.name || !form.email){
      alert("Izpolni ime in email")
      return
    }

    if(!consent){
      alert("Potrebno je soglasje za pošiljanje")
      return
    }

    await fetch("/api/contact",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify(form)
    })

    setForm({ name:"", email:"", message:"" })
    setConsent(false)
    setShowForm(false)

    alert("Povpraševanje poslano 👍")
  }

  return (

    <main className="h-screen flex flex-col bg-white">

      <div className="border-b px-6 py-4 flex items-center gap-3">

        <Image
          src="/images/vitaminko.png"
          alt="Vitaminko"
          width={34}
          height={34}
          className="rounded-full w-8 h-8 object-contain flex-shrink-0"
          unoptimized
        />

        <div className="font-semibold text-[15px]">
          Vitaminko AI Svetovalec
        </div>

      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-8">

        {messages.map((m,i)=>(

          <motion.div
            key={i}
            initial={{opacity:0,y:10}}
            animate={{opacity:1,y:0}}
            className={`flex gap-4 ${m.role==="user"?"justify-end":"justify-start"}`}
          >

            {m.role==="assistant" && (

              <Image
                src="/images/vitaminko.png"
                alt="Vitaminko"
                width={32}
                height={32}
                className="rounded-full w-8 h-8 object-contain flex-shrink-0 mt-1"
                unoptimized
              />

            )}

            <div
              className={
                m.role==="user"
                ? "bubble-user px-4 py-3 rounded-xl max-w-[70%]"
                : "bubble-assistant px-4 py-3 rounded-xl max-w-[86%]"
              }
            >

              <ReactMarkdown
                className={
                  m.role === "user"
                    ? "prose prose-sm max-w-none prose-invert"
                    : "prose prose-sm max-w-none"
                }
                components={{
                  a: ({...props}) => (
                    <a
                      className="underline text-blue-600 hover:text-blue-800 break-all"
                      target="_blank"
                      {...props}
                    />
                  ),
                  table: ({...props}) => (
                    <div className="overflow-x-auto my-4">
                      <table className="w-full border border-gray-200 text-sm rounded-lg overflow-hidden" {...props} />
                    </div>
                  ),
                  thead: ({...props}) => (
                    <thead className="bg-gray-100 text-left" {...props} />
                  ),
                  th: ({...props}) => (
                    <th className="border px-3 py-2 font-semibold text-gray-700" {...props} />
                  ),
                  td: ({...props}) => (
                    <td className="border px-3 py-2" {...props} />
                  )
                }}
              >
                {m.content}
              </ReactMarkdown>

              {Array.isArray(m.sources) && m.sources.length > 0 && (

                <div className="mt-4 space-y-2">

                  {m.sources.slice(0,2).map((s:any,i:number)=>{

                    const url = typeof s === "string" ? s : s?.url
                    if(!url) return null

                    return (
                      <div
                        key={i}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] italic"
                      >
                        <span className="font-medium not-italic mr-1">
                          Več info:
                        </span>
                        <a
                          href={url}
                          target="_blank"
                          className="underline break-all hover:text-blue-600 transition"
                        >
                          {url}
                        </a>
                      </div>
                    )
                  })}

                </div>

              )}

            </div>

          </motion.div>

        ))}

        {loading && (
          <div className="text-gray-400 text-sm italic">
            Vitaminko razmišlja...
          </div>
        )}

        {messages.length === 1 && (

  <div className="space-y-3">

    <div className="text-sm text-gray-500">
      Izberite temo ali zastavite vprašanje:
    </div>

    <div className="grid grid-cols-2 gap-2">

      {quickQuestions.map((q,i)=>(
        <button
          key={i}
          onClick={()=>ask(null,q)}
          className="text-left border px-3 py-3 rounded-xl text-sm hover:bg-gray-100 transition"
        >
          {q}
        </button>
      ))}

    </div>

  </div>

)}

        <div className="flex justify-center">
          <button
            onClick={()=>setShowForm(true)}
            className="text-sm underline text-gray-500 hover:text-black transition"
          >
            Želite ponudbo ali kontakt? Kliknite tukaj
          </button>
        </div>

        {showForm && (

          <div className="mt-6 max-w-md mx-auto bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">

            <div className="font-semibold text-[15px]">
              Pošljite povpraševanje
            </div>

            <input
              value={form.name}
              onChange={(e)=>setForm({...form, name:e.target.value})}
              placeholder="Ime *"
              className="w-full border px-3 py-2 rounded-md text-sm"
            />

            <input
              value={form.email}
              onChange={(e)=>setForm({...form, email:e.target.value})}
              placeholder="Email *"
              className="w-full border px-3 py-2 rounded-md text-sm"
            />

            <textarea
              value={form.message}
              onChange={(e)=>setForm({...form, message:e.target.value})}
              placeholder="Vaše sporočilo"
              className="w-full border px-3 py-2 rounded-md text-sm"
              rows={3}
            />

            {/* ✅ GDPR CHECKBOX */}
            <div className="flex items-start gap-2 text-xs text-gray-600">

              <input
                type="checkbox"
                checked={consent}
                onChange={(e)=>setConsent(e.target.checked)}
                className="mt-1"
              />

              <label>
                Strinjam se z obdelavo osebnih podatkov v skladu z{" "}
                <a href="https://www.d-vitamin.si/pravila-uporabe" target="_blank" className="underline">
                  politiko zasebnosti
                </a>.
              </label>

            </div>

            <div className="flex gap-2 pt-2">

              <button
                onClick={sendForm}
                className="bg-black text-white px-4 py-2 rounded-md text-sm"
              >
                Pošlji
              </button>

              <button
                onClick={()=>setShowForm(false)}
                className="text-sm text-gray-500"
              >
                Zapri
              </button>

            </div>

          </div>

        )}

        <div ref={bottomRef}/>

      </div>

      <form
        onSubmit={ask}
        className="border-t px-6 py-4 flex gap-3"
      >

        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Vprašajte Vitaminka..."
          className="flex-1 border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-black"
        />

        <button
          disabled={loading}
          className="bg-black text-white px-5 py-3 rounded-xl disabled:opacity-40"
        >
          Pošlji
        </button>

      </form>

    </main>
  )
}
