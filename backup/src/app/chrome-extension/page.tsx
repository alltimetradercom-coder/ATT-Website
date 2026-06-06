'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Brain, Zap, HeartPulse, BarChart3, Smile, Target, CloudUpload,
  Star, ShieldCheck, Download, ArrowRight, ChevronDown, ChevronUp,
  CheckCircle2, TrendingUp, Puzzle, Sparkles
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { MarketTicker } from '@/components/market-ticker'
import { Footer } from '@/components/footer'

/* ── Chrome Icon SVG ── */
function ChromeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3A9 9 0 0 0 3.27 7.5 L7.5 10.5 A4.5 4.5 0 0 1 12 7.5 Z" fill="#EA4335"/>
      <path d="M12 7.5 A4.5 4.5 0 0 1 16.5 10.5 L21.13 7.5 A9 9 0 0 0 12 3 Z" fill="#FBBC05"/>
      <path d="M16.5 10.5 A4.5 4.5 0 0 1 12 16.5 L12 21 A9 9 0 0 0 21.13 7.5 Z" fill="#34A853"/>
      <path d="M12 16.5 A4.5 4.5 0 0 1 7.5 10.5 L3.27 7.5 A9 9 0 0 0 12 21 Z" fill="#4285F4"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
      <circle cx="12" cy="12" r="3" fill="#1A73E8"/>
    </svg>
  )
}

/* ── Equity curve SVG ── */
function EquityCurve({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 80" preserveAspectRatio="none">
      <defs>
        <linearGradient id="eg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d="M0,60 Q30,55 60,50 T120,35 T180,40 T240,25 T300,20 T360,10 L400,8 L400,80 L0,80 Z" fill="url(#eg)"/>
      <path d="M0,60 Q30,55 60,50 T120,35 T180,40 T240,25 T300,20 T360,10 L400,8" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="400" cy="8" r="4" fill="#22C55E"/>
    </svg>
  )
}

/* ── FAQ data ── */
const FAQS = [
  { q: 'Is ATT Mind Journal really free?', a: 'Yes, the core extension is completely free. You can journal unlimited trades, track emotions, and view basic analytics at no cost. Premium features like advanced AI insights and mentor sharing are optional upgrades.' },
  { q: 'Which brokers does it work with?', a: 'ATT Mind Journal works with all major Indian brokers — Zerodha, Angel One, Upstox, Groww, Dhan, Fyers, and more. Our browser extension auto-captures trade data from any broker platform you have open in Chrome.' },
  { q: 'Is my data safe and private?', a: 'Absolutely. Your data is stored locally in your browser and optionally synced to your personal encrypted cloud. We never sell or share your trading data. You own your data completely.' },
  { q: 'Can I export my journal entries?', a: 'Yes! Export all your journal entries and analytics to CSV or PDF at any time. You can also share specific reports with your mentor or trading community.' },
  { q: 'Does it work on mobile?', a: 'The Chrome Extension works on desktop Chrome and Chromium-based browsers. A mobile app is on our roadmap. Until then, the web dashboard is fully responsive on mobile browsers.' },
]

/* ── Feature data ── */
const FEATURES = [
  { icon: Zap, bg: 'bg-emerald-50', iconCls: 'text-emerald-600', title: 'One-Click Journaling', desc: 'Log any trade in seconds — right from your browser. Auto-captures symbol, entry/exit, and P&L with a single click.', tags: ['Auto-fill', 'Quick Tags', 'Templates'] },
  { icon: Brain, bg: 'bg-purple-50', iconCls: 'text-purple-600', title: 'Psychology Tracking', desc: 'Track your emotional state before, during, and after every trade. Identify patterns between feelings and outcomes.', tags: ['Mood Log', 'Bias Detection', 'Patterns'] },
  { icon: BarChart3, bg: 'bg-amber-50', iconCls: 'text-amber-600', title: 'Advanced Analytics', desc: 'Deep-dive into your trading data with equity curves, win/loss ratios, streak analysis, and emotion-performance correlation.', tags: ['Equity Curve', 'Heatmaps', 'Reports'] },
  { icon: Smile, bg: 'bg-blue-50', iconCls: 'text-blue-600', title: 'Emotion Management', desc: 'Tag FOMO, revenge trades, greed, and fear. Get visual breakdowns of which emotions cost you the most money.', tags: ['FOMO Alert', 'Revenge Tag', 'Cost Analysis'] },
  { icon: Target, bg: 'bg-rose-50', iconCls: 'text-rose-600', title: 'Goal Setting & Streaks', desc: 'Set daily trade limits, risk rules, and consistency goals. Build winning streaks and maintain discipline.', tags: ['Daily Limits', 'Streaks', 'Rules'] },
  { icon: CloudUpload, bg: 'bg-teal-50', iconCls: 'text-teal-600', title: 'Cloud Sync & Export', desc: "Your data syncs across devices. Export to CSV, PDF, or share with your mentor. Never lose a journal entry again.", tags: ['CSV/PDF', 'Multi-device', 'Backup'] },
]

const STEPS = [
  { n: 1, icon: Puzzle, bg: 'bg-emerald-50', iconCls: 'text-emerald-600', title: 'Install Extension', desc: 'Click "Add to Chrome" and pin the extension to your toolbar for instant access.' },
  { n: 2, icon: Zap, bg: 'bg-purple-50', iconCls: 'text-purple-600', title: 'One-Click Journal', desc: 'After any trade, click the extension icon. Add emotions, notes, and tags in seconds.' },
  { n: 3, icon: BarChart3, bg: 'bg-amber-50', iconCls: 'text-amber-600', title: 'Analyze & Improve', desc: 'Review your dashboard, spot emotional patterns, and make data-driven improvements.' },
]

const TABS = ['Dashboard', 'Journal', 'Emotions', 'Analytics'] as const
type Tab = typeof TABS[number]

export default function ChromeExtensionClient() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const showToast = () => {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3500)
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col">
      <Navbar />
      <MarketTicker />

      <main className="pt-4 pb-24 px-6 md:px-12 flex-1">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-24 md:gap-32">

          {/* ── Hero ── */}
          <section className="relative rounded-3xl overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 60%)' }}>
            <div className="px-6 md:px-16 pt-8 pb-8 text-center relative z-10">

              {/* badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#16A34A' }}>
                <ChromeIcon className="h-3.5 w-3.5" />
                Chrome Extension
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6">
                Track. Analyze.<br />
                <span className="text-emerald-500">Improve.</span>
              </h1>

              <p className="text-[#8E8E8E] text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto mb-4">
                The one-stop trading & psychology tracking tool built for Indian traders. Journal your trades, understand your emotions, and make better decisions.
              </p>
              <p className="italic text-[#555555] text-sm mb-8">
                "The goal is not more trades — the goal is better decisions."
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <button onClick={showToast}
                  className="bg-gradient-to-br from-[#2B2B2B] to-[#404040] hover:from-[#404040] hover:to-[#555555] hover:-translate-y-0.5 text-white font-medium text-sm px-8 py-4 rounded-full flex items-center gap-3 shadow-xl transition-all duration-300">
                  <ChromeIcon className="h-5 w-5" />
                  Add to Chrome — It's Free
                </button>
                <a href="#features" className="text-sm font-medium text-[#8E8E8E] hover:text-[#2B2B2B] transition-colors flex items-center gap-1.5 group">
                  Explore Features
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Rating bar */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1,2,3,4].map(s => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                    <Star className="h-3.5 w-3.5 fill-amber-200 text-amber-200" />
                  </div>
                  <span className="text-xs text-[#8E8E8E]">4.7/5 (2,400+ reviews)</span>
                </div>
                <div className="h-4 w-px bg-[#E6E2DB] hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-[#8E8E8E]">50,000+ traders</span>
                </div>
                <div className="h-4 w-px bg-[#E6E2DB] hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-[#8E8E8E]">Privacy First</span>
                </div>
              </div>
            </div>

            {/* Browser mockup */}
            <div className="px-6 md:px-16 pb-0">
              <div className="relative max-w-4xl mx-auto">
                <div className="rounded-2xl overflow-hidden border border-[#E6E2DB]/40 bg-white"
                  style={{ boxShadow: '0 0 80px rgba(34,197,94,0.1), 0 25px 50px -12px rgba(0,0,0,0.12)' }}>
                  {/* Browser bar */}
                  <div className="bg-[#E6E2DB]/40 px-4 py-2.5 flex items-center gap-3 border-b border-[#E6E2DB]/30">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/70" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                      <div className="w-3 h-3 rounded-full bg-green-400/70" />
                    </div>
                    <div className="flex-1 bg-white/70 rounded-md px-3 py-1 text-[11px] text-[#8E8E8E] font-mono">
                      chrome-extension://att-mind-journal/dashboard
                    </div>
                    <Puzzle className="h-4 w-4 text-emerald-500" />
                  </div>
                  {/* Content */}
                  <div className="p-4 md:p-6 bg-gradient-to-b from-white to-[#FAFAF8]/50">
                    <div className="grid grid-cols-12 gap-3 md:gap-4">
                      {/* Sidebar */}
                      <div className="col-span-3 hidden md:block">
                        <div className="bg-white rounded-xl p-3 border border-[#E6E2DB]/30 space-y-1.5">
                          {[
                            { label: 'Dashboard', active: true },
                            { label: 'Journal', active: false },
                            { label: 'Emotions', active: false },
                            { label: 'Analytics', active: false },
                            { label: 'Goals', active: false },
                          ].map(({ label, active }) => (
                            <div key={label} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${active ? 'bg-emerald-50' : ''}`}>
                              <div className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-[#E6E2DB]'}`} />
                              <span className={`text-[11px] font-medium ${active ? 'text-emerald-600' : 'text-[#8E8E8E]'}`}>{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Main */}
                      <div className="col-span-12 md:col-span-9 space-y-3 md:space-y-4">
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                          {[
                            { label: 'Win Rate', val: '68.4%', sub: '+5.2%' },
                            { label: 'P&L Today', val: '+₹12.4K', sub: '+8.3%' },
                            { label: 'Emotion Score', val: '8.2/10', sub: 'Calm' },
                          ].map(({ label, val, sub }) => (
                            <div key={label} className="bg-white rounded-xl p-3 md:p-4 border border-[#E6E2DB]/30">
                              <p className="text-[10px] md:text-xs text-[#8E8E8E] mb-1">{label}</p>
                              <p className="text-lg md:text-2xl font-bold text-emerald-600">{val}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
                                <span className="text-[9px] md:text-[10px] text-emerald-600 font-medium">{sub}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Chart */}
                        <div className="bg-white rounded-xl p-3 md:p-4 border border-[#E6E2DB]/30">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium">Equity Curve</span>
                            <div className="flex gap-1">
                              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">1W</span>
                              <span className="text-[10px] text-[#8E8E8E] px-2 py-0.5 rounded-full">1M</span>
                              <span className="text-[10px] text-[#8E8E8E] px-2 py-0.5 rounded-full">3M</span>
                            </div>
                          </div>
                          <EquityCurve className="w-full h-16 md:h-24" />
                        </div>
                        {/* Journal entries */}
                        <div className="bg-white rounded-xl p-3 md:p-4 border border-[#E6E2DB]/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">Recent Journal Entries</span>
                            <span className="text-[10px] text-emerald-600 font-medium">View All →</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between bg-[#FAFAF8]/50 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-emerald-600">NIFTY 24500 CE</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#16A34A' }}>Calm</span>
                              </div>
                              <span className="text-[10px] font-medium text-emerald-600">+₹3,200</span>
                            </div>
                            <div className="flex items-center justify-between bg-[#FAFAF8]/50 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-red-500">BANKNIFTY 52000 PE</span>
                                <span className="text-[9px] bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded-full">FOMO</span>
                              </div>
                              <span className="text-[10px] font-medium text-red-500">-₹1,800</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -left-4 md:-left-8 top-1/4 animate-bounce hidden md:flex items-center gap-2 bg-white rounded-2xl p-3 shadow-xl border border-[#E6E2DB]/30 z-20">
                  <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium">One-Click</p>
                    <p className="text-[9px] text-[#8E8E8E]">Journaling</p>
                  </div>
                </div>
                <div className="absolute -right-4 md:-right-8 top-1/3 hidden md:flex items-center gap-2 bg-white rounded-2xl p-3 shadow-xl border border-[#E6E2DB]/30 z-20"
                  style={{ animation: 'bounce 6s ease-in-out 2s infinite' }}>
                  <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                    <HeartPulse className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium">Psychology</p>
                    <p className="text-[9px] text-[#8E8E8E]">Tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Trusted By ── */}
          <section>
            <p className="text-center text-xs font-medium text-[#8E8E8E] tracking-widest uppercase mb-8">Trusted by traders on</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-40">
              {['Zerodha', 'Groww', 'Angel One', 'Upstox', 'Dhan'].map(b => (
                <span key={b} className="text-xl font-bold">{b}</span>
              ))}
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E2DB] to-transparent" />

          {/* ── Features ── */}
          <section id="features">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium mb-4"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#16A34A' }}>
                <Sparkles className="h-3 w-3" />
                Core Features
              </div>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
                Everything you need to<br />trade with clarity
              </h2>
              <p className="text-[#8E8E8E] text-sm md:text-base font-light max-w-xl mx-auto leading-relaxed">
                From one-click journaling to deep psychology analytics — every feature is designed to help you understand your trading mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, bg, iconCls, title, desc, tags }) => (
                <div key={title}
                  className="group bg-white rounded-2xl p-8 border border-[#E6E2DB]/30 hover:border-[#E6E2DB] hover:shadow-lg transition-all duration-300">
                  <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className={`h-6 w-6 ${iconCls}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{title}</h3>
                  <p className="text-sm text-[#8E8E8E] font-light leading-relaxed mb-4">{desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-[#FAFAF8] px-2 py-1 rounded-full text-[#555555]">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E2DB] to-transparent" />

          {/* ── Stats ── */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { val: '50,000+', label: 'Active Traders', colored: true },
                { val: '2.1M+', label: 'Trades Journaled', colored: false },
                { val: '34%', label: 'Avg. Improvement', colored: true },
                { val: '4.7★', label: 'Chrome Store Rating', colored: false },
              ].map(({ val, label, colored }) => (
                <div key={label}
                  className="bg-gradient-to-br from-white to-[#FAFAF8] rounded-2xl p-6 md:p-8 border border-[#E6E2DB]/30 text-center">
                  <p className={`text-3xl md:text-4xl font-bold mb-1 ${colored ? 'text-emerald-500' : ''}`}>{val}</p>
                  <p className="text-xs text-[#8E8E8E] font-light">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E2DB] to-transparent" />

          {/* ── How It Works ── */}
          <section id="how-it-works">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium mb-4"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#16A34A' }}>
                <Zap className="h-3 w-3" />
                Get Started
              </div>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
                Start journaling in<br />under 60 seconds
              </h2>
              <p className="text-[#8E8E8E] text-sm md:text-base font-light max-w-xl mx-auto leading-relaxed">
                No complex setup. No import hassle. Just add the extension and start tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* connecting line */}
              <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-emerald-500 via-[#E6E2DB] to-emerald-500" />

              {STEPS.map(({ n, icon: Icon, bg, iconCls, title, desc }) => (
                <div key={n} className="text-center relative">
                  <div className="relative z-10 w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-sm font-bold shadow-lg shadow-emerald-500/20">
                    {n}
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-[#E6E2DB]/30">
                    <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`h-8 w-8 ${iconCls}`} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{title}</h3>
                    <p className="text-sm text-[#8E8E8E] font-light leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E2DB] to-transparent" />

          {/* ── Screenshots ── */}
          <section id="preview">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium mb-4"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#16A34A' }}>
                <Sparkles className="h-3 w-3" />
                Preview
              </div>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">See it in action</h2>
              <p className="text-[#8E8E8E] text-sm md:text-base font-light max-w-xl mx-auto leading-relaxed">
                Every screen is designed for clarity and speed — spend less time logging, more time trading.
              </p>
            </div>

            {/* Tab buttons */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {TABS.map(tab => (
                <button key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-medium px-4 py-2 rounded-full transition-all ${activeTab === tab ? 'bg-[#2B2B2B] text-white' : 'bg-white text-[#8E8E8E] border border-[#E6E2DB]/50 hover:border-[#E6E2DB]'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Panel */}
            <div className="rounded-2xl overflow-hidden border border-[#E6E2DB]/40 bg-white"
              style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}>
              <div className="bg-[#E6E2DB]/30 px-4 py-2 flex items-center gap-3 border-b border-[#E6E2DB]/20">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 bg-white/60 rounded px-2 py-0.5 text-[10px] text-[#8E8E8E] font-mono">
                  ATT Mind Journal — {activeTab}
                </div>
              </div>
              <div className="p-6 md:p-10 bg-gradient-to-br from-white via-[#FAFAF8]/30 to-white min-h-[320px]">
                {activeTab === 'Dashboard' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { icon: '₹', label: 'Total P&L', val: '₹2.4L' },
                        { icon: '%', label: 'Win Rate', val: '68.4%' },
                        { icon: '📅', label: 'Trades / Month', val: '142' },
                        { icon: '🧠', label: 'Mind Score', val: '8.2' },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-white rounded-xl p-4 border border-[#E6E2DB]/20 text-center">
                          <p className="text-xl font-bold text-emerald-600">{val}</p>
                          <p className="text-[11px] text-[#8E8E8E] mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-[#E6E2DB]/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Equity Curve — January 2025</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#16A34A' }}>Live</span>
                      </div>
                      <svg className="w-full h-32" viewBox="0 0 600 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="cg2" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.12"/>
                            <stop offset="100%" stopColor="#22C55E" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <path d="M0,80 C40,75 60,60 100,55 C140,50 160,62 200,45 C240,28 260,35 300,30 C340,25 360,38 400,22 C440,15 460,20 500,12 C540,8 570,5 600,3 L600,100 L0,100 Z" fill="url(#cg2)"/>
                        <path d="M0,80 C40,75 60,60 100,55 C140,50 160,62 200,45 C240,28 260,35 300,30 C340,25 360,38 400,22 C440,15 460,20 500,12 C540,8 570,5 600,3" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                )}

                {activeTab === 'Journal' && (
                  <div className="max-w-2xl mx-auto space-y-4">
                    <h3 className="text-xl font-bold text-center mb-6">New Journal Entry</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-[#8E8E8E] font-medium mb-1.5 block">Symbol</label>
                        <div className="bg-[#FAFAF8] rounded-xl px-4 py-3 text-sm border border-[#E6E2DB]/30">NIFTY 24500 CE</div>
                      </div>
                      <div>
                        <label className="text-xs text-[#8E8E8E] font-medium mb-1.5 block">Direction</label>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-emerald-50 text-emerald-600 rounded-xl px-4 py-3 text-sm font-medium text-center border border-emerald-200">LONG</div>
                          <div className="flex-1 bg-[#FAFAF8] rounded-xl px-4 py-3 text-sm text-[#8E8E8E] text-center border border-[#E6E2DB]/30">SHORT</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[['Entry Price', '₹245.50'], ['Exit Price', '₹278.30'], ['P&L', '+₹3,200']].map(([l, v]) => (
                        <div key={l}>
                          <label className="text-xs text-[#8E8E8E] font-medium mb-1.5 block">{l}</label>
                          <div className={`bg-[#FAFAF8] rounded-xl px-4 py-3 text-sm border border-[#E6E2DB]/30 ${l === 'P&L' ? 'text-emerald-600 font-semibold' : ''}`}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-xs text-[#8E8E8E] font-medium mb-1.5 block">Emotion Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {[{ l: 'CALM', a: true }, { l: 'FOCUSED', a: false }, { l: 'FOMO', a: false }, { l: 'CONFIDENT', a: false }].map(({ l, a }) => (
                          <span key={l} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${a ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-[#FAFAF8] text-[#8E8E8E] border-[#E6E2DB]/30'}`}>{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Emotions' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold mb-2">Emotion Analysis</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { e: 'CALM', pnl: '+₹18,400', pct: 68, color: 'text-emerald-600', bar: 'bg-emerald-500' },
                        { e: 'FOCUSED', pnl: '+₹12,200', pct: 52, color: 'text-blue-600', bar: 'bg-blue-500' },
                        { e: 'FOMO', pnl: '-₹8,600', pct: 22, color: 'text-red-500', bar: 'bg-red-500' },
                        { e: 'REVENGE', pnl: '-₹5,200', pct: 14, color: 'text-orange-500', bar: 'bg-orange-500' },
                      ].map(({ e, pnl, pct, color, bar }) => (
                        <div key={e} className="bg-white rounded-xl p-4 border border-[#E6E2DB]/20">
                          <p className="text-xs font-bold mb-1">{e}</p>
                          <p className={`text-lg font-bold ${color}`}>{pnl}</p>
                          <div className="mt-2 h-1.5 bg-[#FAFAF8] rounded-full overflow-hidden">
                            <div className={`h-full ${bar} rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-[#8E8E8E] mt-1">{pct}% of trades</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Analytics' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Best Day', val: 'Tuesday', sub: 'Avg +₹4,200' },
                        { label: 'Best Setup', val: 'Breakout', sub: '74% win rate' },
                        { label: 'Peak Hours', val: '9:20–10:30', sub: '82% win rate' },
                      ].map(({ label, val, sub }) => (
                        <div key={label} className="bg-white rounded-xl p-4 border border-[#E6E2DB]/20 text-center">
                          <p className="text-xs text-[#8E8E8E] mb-1">{label}</p>
                          <p className="text-base font-bold text-emerald-600">{val}</p>
                          <p className="text-[10px] text-[#8E8E8E] mt-0.5">{sub}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-[#E6E2DB]/20">
                      <p className="text-sm font-medium mb-3">30-Day P&L Heatmap</p>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 30 }, (_, i) => {
                          const val = Math.sin(i * 0.7) * 0.5 + 0.5
                          const green = val > 0.5
                          return (
                            <div key={i}
                              className={`h-6 rounded ${green ? 'bg-emerald-100' : 'bg-red-100'}`}
                              style={{ opacity: 0.3 + val * 0.7 }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E2DB] to-transparent" />

          {/* ── Testimonials ── */}
          <section id="reviews">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium mb-4"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#16A34A' }}>
                <Star className="h-3 w-3 fill-current" />
                Reviews
              </div>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">Traders love it</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Rahul M.', handle: '@rahul_nifty', stars: 5, text: 'This extension literally changed how I trade. I discovered I was losing 30% of profits to FOMO trades — fixed it in a month.' },
                { name: 'Priya S.', handle: '@priya_trades', stars: 5, text: 'The psychology tracking is what sets this apart. No other journaling tool connects emotions to P&L this well. Must have for serious traders.' },
                { name: 'Vikram R.', handle: '@vikram_trader', stars: 5, text: 'One-click journaling from Zerodha is a game changer. Takes 10 seconds to log a trade with full context. My consistency improved massively.' },
              ].map(({ name, handle, stars, text }) => (
                <div key={name}
                  className="bg-white rounded-2xl p-6 border border-[#E6E2DB]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className="flex mb-3">
                    {Array.from({ length: stars }, (_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-[#555555] font-light leading-relaxed mb-4">"{text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-emerald-600">{name[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium">{name}</p>
                      <p className="text-[10px] text-[#8E8E8E]">{handle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E2DB] to-transparent" />

          {/* ── FAQ ── */}
          <section id="faq">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            </div>
            <div className="max-w-2xl mx-auto space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i}
                  className="bg-white rounded-2xl border border-[#E6E2DB]/30 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#FAFAF8] transition-colors">
                    <span className="text-sm font-medium">{faq.q}</span>
                    {openFaq === i
                      ? <ChevronUp className="h-4 w-4 text-[#8E8E8E] shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-[#8E8E8E] shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-[#8E8E8E] font-light leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section className="text-center rounded-3xl py-16 px-8 border border-[#E6E2DB]/30 bg-gradient-to-br from-white to-[#FAFAF8]"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.05) 0%, transparent 60%)' }}>
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#16A34A' }}>
              <ChromeIcon className="h-3.5 w-3.5" />
              Free Forever · No Card Required
            </div>
            <h2 className="text-2xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
              Start trading with<br />
              <span className="text-emerald-500">intention.</span>
            </h2>
            <p className="text-[#8E8E8E] text-base font-light max-w-lg mx-auto mb-8 leading-relaxed">
              Join 50,000+ Indian traders who use ATT Mind Journal to understand themselves and improve their performance.
            </p>
            <button onClick={showToast}
              className="bg-gradient-to-br from-[#2B2B2B] to-[#404040] hover:from-[#404040] hover:to-[#555555] hover:-translate-y-1 text-white font-medium text-base px-10 py-4 rounded-full inline-flex items-center gap-3 shadow-2xl transition-all duration-300">
              <ChromeIcon className="h-5 w-5" />
              Add to Chrome — It's Free
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-4 text-xs text-[#8E8E8E]">
              Works on Zerodha · Angel One · Upstox · Groww · Dhan
            </p>
          </section>

        </div>
      </main>

      <Footer />

      {/* ── Toast ── */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="bg-[#2B2B2B] text-white px-6 py-3.5 rounded-2xl flex items-center gap-3 shadow-2xl">
          <ChromeIcon className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Opening Chrome Web Store…</p>
            <p className="text-xs text-white/60">ATT Mind Journal — Free Extension</p>
          </div>
        </div>
      </div>
    </div>
  )
}
