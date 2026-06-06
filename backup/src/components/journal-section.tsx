'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Brain,
  TrendingUp,
  Target,
  ArrowRight,
  Star,
  CheckCircle2,
} from 'lucide-react'

/* Real Chrome logo SVG as a component */
function ChromeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4.5" fill="white" />
      <path d="M12 7.5h9.13A9 9 0 1 0 12 21v-4.5" stroke="none" />
      {/* Red arc */}
      <path d="M12 7.5 C14.76 7.5 17.14 9.0 18.39 11.25 L21.13 7.5" fill="none" />
      <path d="M2.87 7.5 L12 7.5" stroke="#EA4335" strokeWidth="4.5" strokeLinecap="round"/>
      {/* Blue arc */}
      <path d="M12 21 L7.5 13.5" stroke="#4285F4" strokeWidth="4.5" strokeLinecap="round"/>
      {/* Yellow arc */}
      <path d="M18.39 11.25 L12 21" stroke="none" />
      <path d="M21.13 7.5 C22.29 9.38 23 11.61 23 14" stroke="none" />
      {/* Proper chrome icon using colored segments */}
      <g>
        {/* Outer ring - left red */}
        <path d="M12 3 A9 9 0 0 0 3.27 7.5 L7.5 10.5 A4.5 4.5 0 0 1 12 7.5 Z" fill="#EA4335"/>
        {/* Outer ring - right yellow/green */}
        <path d="M12 7.5 A4.5 4.5 0 0 1 16.5 10.5 L21.13 7.5 A9 9 0 0 0 12 3 Z" fill="#FBBC05"/>
        {/* Outer ring - bottom blue */}
        <path d="M16.5 10.5 A4.5 4.5 0 0 1 12 16.5 L12 21 A9 9 0 0 0 21.13 7.5 Z" fill="#34A853"/>
        {/* Left bottom */}
        <path d="M12 16.5 A4.5 4.5 0 0 1 7.5 10.5 L3.27 7.5 A9 9 0 0 0 12 21 Z" fill="#4285F4"/>
        {/* Center white circle */}
        <circle cx="12" cy="12" r="4" fill="white"/>
        <circle cx="12" cy="12" r="3" fill="#1A73E8"/>
      </g>
    </svg>
  )
}

export function JournalSection() {
  const { setView } = useAppStore()

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
      {/* Section header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Exclusive to AllTimeTrader
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Your Trading Journal{' '}
          <span className="text-muted-foreground font-light">+</span>{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 60%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Mind Journal
          </span>
        </h2>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
          The only Indian platform with combined trade + psychology tracking
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

        {/* ── Trade Journal Card ── */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
          {/* top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/60 via-primary/30 to-transparent" />

          {/* ── Trade Journal Mock UI Preview ── */}
          <div className="relative w-full h-48 bg-[#060907] p-4 border-b border-border/10 overflow-hidden flex flex-col justify-between group">
            {/* Ambient background grid & glow */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

            {/* Header / Stats Row */}
            <div className="relative z-10 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">Net P&L</div>
                <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5 font-black">+₹1.84L</div>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">Win Rate</div>
                <div className="text-xs font-bold text-amber-400 font-mono mt-0.5 font-black">64.5%</div>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">Expectancy</div>
                <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5 font-black">+2.4 RR</div>
              </div>
            </div>

            {/* Live Chart Visual */}
            <div className="relative z-10 h-16 w-full mt-2">
              <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="tradeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,45 C30,42 50,25 80,30 C110,35 130,10 160,20 C190,30 210,12 240,8 C270,5 290,2 300,1 L300,60 L0,60 Z" fill="url(#tradeGrad)"/>
                <path d="M0,45 C30,42 50,25 80,30 C110,35 130,10 160,20 C190,30 210,12 240,8 C270,5 290,2 300,1" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
                
                {/* pulsing dot on the peak */}
                <circle cx="300" cy="1" r="3" fill="#10b981" />
                <circle cx="300" cy="1" r="6" fill="#10b981" className="animate-ping opacity-75" />
              </svg>
            </div>

            {/* Recent log feed preview */}
            <div className="relative z-10 flex gap-2 overflow-hidden text-[9px] font-mono text-muted-foreground/80 mt-1">
              <div className="flex-1 flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded px-2 py-1">
                <span>RELIANCE · BUY</span>
                <span className="text-emerald-400 font-semibold">+₹4,200</span>
              </div>
              <div className="flex-1 flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded px-2 py-1">
                <span>TCS · BUY</span>
                <span className="text-emerald-400 font-semibold">+₹2,100</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Trade Journal</h3>
                <p className="text-xs text-muted-foreground">Track every trade you make</p>
              </div>
            </div>

            <ul className="space-y-2 mb-5">
              {[
                'Log entry/exit prices with timestamps',
                'P&L tracking with visual charts',
                'Win rate statistics & streaks',
                'Strategy tagging & filtering',
                'Weekly performance reviews',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 rounded-xl h-10 shadow-lg shadow-primary/20"
              onClick={() => setView('journal')}
            >
              <BookOpen className="h-4 w-4" />
              Start Journal
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Mind Journal Card — ATT branded dark style ── */}
        <div className="group relative overflow-hidden rounded-2xl border border-[#00ff88]/20 bg-[#0a0f0c] hover:border-[#00ff88]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00ff88]/10 flex flex-col">
          {/* neon top line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00ff88] via-[#00ff88]/50 to-transparent" />
          {/* bg ambient glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,255,136,0.06) 0%, transparent 70%)' }} />

          {/* ── Mind Journal Mock UI Preview ── */}
          <div className="relative w-full h-48 bg-[#070b09] p-4 border-b border-[#00ff88]/10 overflow-hidden flex flex-col justify-between group">
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.01)_1px,transparent_1px)] bg-[size:14px_14px] opacity-40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-[#00ff88]/5 blur-3xl pointer-events-none" />

            {/* Header / Stats Row */}
            <div className="relative z-10 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                <div className="text-[9px] text-[#00ff88]/60 uppercase tracking-wider font-mono">Discipline</div>
                <div className="text-xs font-bold text-[#00ff88] font-mono mt-0.5 font-black">9.2 / 10</div>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                <div className="text-[9px] text-white/40 uppercase tracking-wider font-mono">Streak</div>
                <div className="text-xs font-bold text-amber-400 font-mono mt-0.5 font-black">12 Days 🔥</div>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                <div className="text-[9px] text-white/40 uppercase tracking-wider font-mono">Top Mistake</div>
                <div className="text-xs font-bold text-rose-400 font-mono mt-0.5 font-black">FOMO ⚠️</div>
              </div>
            </div>

            {/* Live Chart Visual (Psychology distribution) */}
            <div className="relative z-10 h-16 w-full mt-2 flex items-end justify-between gap-1.5 px-2">
              {[
                { mood: 'Greed 🤑', pct: 15, color: 'bg-rose-500/80 border-rose-500' },
                { mood: 'Fear 😨', pct: 25, color: 'bg-amber-500/80 border-amber-500' },
                { mood: 'FOMO ⚠️', pct: 20, color: 'bg-red-500/80 border-red-500' },
                { mood: 'Discipline 🎯', pct: 75, color: 'bg-[#00ff88]/80 border-[#00ff88]' },
              ].map(({ mood, pct, color }) => (
                <div key={mood} className="flex-1 flex flex-col items-center">
                  <div className={`w-full rounded-t-md border-t border-x transition-all duration-500 group-hover:brightness-110 ${color}`} 
                       style={{ height: `${pct * 0.45}px` }} />
                  <span className="text-[7px] text-white/50 mt-1 font-mono tracking-tighter truncate w-full text-center">{mood}</span>
                </div>
              ))}
            </div>

            {/* Overlay Badges */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full border border-[#4285F4]/40 bg-black/80 backdrop-blur-md px-2.5 py-1">
              <ChromeIcon className="h-3 w-3" />
              <span className="text-[8px] font-semibold text-white font-mono uppercase tracking-wider">Chrome Extension</span>
            </div>
            
            <div className="absolute top-3 right-3 z-20 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/40 px-2 py-0.5 text-[8px] font-black text-[#00ff88] font-mono">
              FREE
            </div>
          </div>

          {/* ── Content ── */}
          <div className="px-5 pb-5 pt-3 flex-1 flex flex-col">

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00ff88]/10 ring-1 ring-[#00ff88]/30">
                  <Brain className="h-5 w-5 text-[#00ff88]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white">
                    Mind Journal
                  </h3>
                  <p className="text-[10px] text-[#00ff88]/70 font-mono uppercase tracking-widest">
                    Trade Better. Think Clearer.
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-5">
              {[
                'Auto-capture trades from your broker',
                'Track emotions, mistakes & strengths',
                'Identify patterns & repeatable edges',
                'Data-driven insights for better decisions',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-white/70">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#00ff88]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-2">
              <p className="text-[10px] text-white/40 text-center mb-3">
                Trusted on · <span className="font-medium text-white/70">Zerodha</span> · <span className="font-medium text-white/70">Groww</span> · <span className="font-medium text-white/70">Angel One</span> · <span className="font-medium text-white/70">Upstox</span>
              </p>

              {/* Dual CTAs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setView('mind-journal')}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#00ff88] hover:bg-[#00ff88]/90 text-black font-semibold text-xs h-10 transition-all duration-200 shadow-lg shadow-[#00ff88]/20"
                >
                  <Brain className="h-3.5 w-3.5" />
                  Open App
                </button>
                <Link
                  href="/chrome-extension"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#00ff88]/20 bg-white/5 hover:bg-[#00ff88]/10 text-white font-semibold text-xs h-10 transition-all duration-200"
                >
                  <ChromeIcon className="h-3.5 w-3.5" />
                  Extension
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chrome Extension Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-card via-primary/5 to-card">
        {/* glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(16,185,129,0.07) 0%, transparent 60%)' }}
        />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/50 via-[#4285F4]/50 to-transparent" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 px-6 py-5">
          {/* Chrome icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg">
            <ChromeIcon className="h-8 w-8" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base">ATT Mind Journal — Chrome Extension</h3>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                FREE
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Journal your trades <span className="text-foreground font-medium">DIRECTLY</span> from Zerodha / Angel One / Upstox with one click.
            </p>
            {/* Stars */}
            <div className="flex items-center gap-1 mt-1.5">
              {[1,2,3,4].map(s => (
                <Star key={s} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
              <Star className="h-3 w-3 fill-muted-foreground/30 text-muted-foreground/30" />
              <span className="ml-1 text-xs text-muted-foreground">4.5 · 500+ users</span>
            </div>
          </div>

          {/* CTA */}
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2.5 rounded-xl border border-[#4285F4]/40 bg-[#4285F4]/10 px-5 py-2.5 text-sm font-semibold text-[#4285F4] hover:bg-[#4285F4]/20 hover:border-[#4285F4]/60 transition-all duration-200 shadow-sm"
          >
            <ChromeIcon className="h-4 w-4" />
            Add to Chrome — Free
          </a>
        </div>
      </div>
    </section>
  )
}
