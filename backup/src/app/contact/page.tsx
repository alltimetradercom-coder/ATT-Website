'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulated form submission
    setSubmitted(true)
    setName('')
    setEmail('')
    setSubject('')
    setMessage('')
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid md:grid-cols-5 gap-8 sm:gap-12">
          
          {/* Left: Contact Info (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono font-medium mb-4">
                <MessageSquare className="h-3.5 w-3.5" />
                GET IN TOUCH
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Contact Support
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Have questions about our cost averaging formulas, trade loggers, or suggestions for a new calculator? Send us a message!
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Direct Email
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                support@alltimetrader.com
              </p>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">
                We make every effort to reply within 24–48 business hours (Monday to Friday, market hours).
              </p>
            </div>
          </div>

          {/* Right: Contact Form (3 cols) */}
          <div className="md:col-span-3">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">Send a Message</h2>
              
              {submitted ? (
                <div className="p-5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 flex flex-col items-center text-center gap-3 animate-pulse">
                  <CheckCircle className="h-10 w-10" />
                  <div>
                    <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
                    <p className="text-xs text-muted-foreground mt-1">Thank you for your valuable feedback. Our team will get back to you shortly.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-muted-foreground mb-1.5" htmlFor="name">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="att-lot-input text-sm"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-muted-foreground mb-1.5" htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="att-lot-input text-sm"
                        placeholder="rahul@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5" htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="att-lot-input text-sm"
                      placeholder="e.g. Stock Average calculator feedback"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5" htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="att-lot-input text-sm resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-mono font-bold text-sm bg-primary text-primary-foreground hover:brightness-110 transition-all cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    Submit Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
