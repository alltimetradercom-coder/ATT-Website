'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Calculator,
  BookOpen,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Brain,
  Zap,
  Shield,
} from 'lucide-react'

/* ── tiny seeded PRNG for deterministic SSR/CSR candles ── */
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Candle {
  x: number
  open: number
  close: number
  high: number
  low: number
  isGreen: boolean
}

function generateCandles(): Candle[] {
  const rand = mulberry32(42)
  const candles: Candle[] = []
  const count = 28
  const W = 560
  const H = 200
  let price = 120

  for (let i = 0; i < count; i++) {
    const change = (rand() - 0.46) * 18
    const open = price
    const close = Math.max(20, Math.min(H - 20, price + change))
    const hi = Math.max(open, close) + rand() * 8
    const lo = Math.min(open, close) - rand() * 8
    candles.push({
      x: (i / (count - 1)) * W,
      open,
      close,
      high: Math.min(H - 5, hi),
      low: Math.max(5, lo),
      isGreen: close >= open,
    })
    price = close
  }
  return candles
}

const CANDLES = generateCandles()
const W = 560
const H = 200

/* ── floating stat cards data ── */
const STATS = [
  { label: 'Tools Available', value: '12+', icon: Calculator, color: 'emerald', delay: 0.4 },
  { label: 'Users This Month', value: '8,400+', icon: TrendingUp, color: 'sky', delay: 0.6 },
  { label: 'Trades Logged', value: '34K+', icon: BarChart2, color: 'violet', delay: 0.8 },
]

const colorMap: Record<string, string> = {
  emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
  sky: 'from-sky-500/20 to-sky-500/5 border-sky-500/30 text-sky-400',
  violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400',
}

/* ── live ticker items ── */
const TICKERS = [
  { sym: 'NIFTY 50', val: '24,850.30', chg: '+0.84%', up: true },
  { sym: 'SENSEX', val: '81,721.08', chg: '+0.72%', up: true },
  { sym: 'BANKNIFTY', val: '53,342.15', chg: '-0.21%', up: false },
  { sym: 'MIDCAP', val: '12,108.90', chg: '+1.14%', up: true },
  { sym: 'GOLD', val: '₹72,450', chg: '+0.33%', up: true },
]

/* ── CandleChart SVG ── */
function CandleChart() {
  const cw = W / CANDLES.length
  const bodyW = cw * 0.55

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ transform: 'scaleY(-1)' }}>
      {/* subtle grid lines */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={0} y1={H * t} x2={W} y2={H * t}
          stroke="rgba(255,255,255,0.05)" strokeWidth={1}
        />
      ))}
      {CANDLES.map((c, i) => {
        const cx = c.x + cw / 2
        const bodyTop = Math.max(c.open, c.close)
        const bodyBot = Math.min(c.open, c.close)
        const bodyH = Math.max(2, bodyTop - bodyBot)
        return (
          <g key={i}>
            {/* wick */}
            <line
              x1={cx} y1={c.low} x2={cx} y2={c.high}
              stroke={c.isGreen ? '#10b981' : '#ef4444'}
              strokeWidth={1.2}
              opacity={0.7}
            />
            {/* body */}
            <rect
              x={cx - bodyW / 2}
              y={bodyBot}
              width={bodyW}
              height={bodyH}
              rx={1.5}
              fill={c.isGreen ? '#10b981' : '#ef4444'}
              opacity={0.85}
            />
          </g>
        )
      })}
    </svg>
  )
}

/* ── main Hero ── */
export function Hero() {
  const { setView } = useAppStore()
  const controls = useAnimation()
  const [tickerIndex, setTickerIndex] = useState(0)
  const [marketData, setMarketData] = useState<any>(null)
  const [tickers, setTickers] = useState<any[]>(TICKERS)

  const scrollToTools = () => {
    const el = document.getElementById('tools-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    controls.start('visible')
  }, [controls])

  // fetch live market data
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const res = await fetch('/api/market-data')
        if (res.ok) {
          const json = await res.json()
          setMarketData(json)
          if (json.data && Array.isArray(json.data)) {
            const formatted = json.data.map((item: any) => ({
              sym: item.name,
              val: item.id === 'indiavix' 
                ? item.price.toFixed(2) 
                : item.id === 'usdinr' 
                  ? `₹${item.price.toFixed(2)}` 
                  : `₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
              chg: `${item.change >= 0 ? '+' : ''}${item.changePercent.toFixed(2)}%`,
              up: item.change >= 0
            }))
            setTickers(formatted)
          }
        }
      } catch (err) {
        console.log('Hero fetch error:', err)
      }
    }

    fetchHeroData()
    const interval = setInterval(fetchHeroData, 30000)
    return () => clearInterval(interval)
  }, [])

  // cycle through ticker items
  useEffect(() => {
    const id = setInterval(() => {
      setTickerIndex((p) => (p + 1) % (tickers.length || 1))
    }, 2500)
    return () => clearInterval(id)
  }, [tickers.length])

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  }
  const item = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  }

  const ticker = tickers[tickerIndex] || TICKERS[0]

  return (
    <section className="relative overflow-hidden border-b border-border/30 bg-background">
      {/* ── animated grid ── */}
      <div className="hero-grid absolute inset-0 opacity-60" />

      {/* ── radial glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.13) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* ── LEFT: copy ── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate={controls}
            className="flex flex-col items-start text-left"
          >
            {/* live badge */}
            <motion.div variants={item}>
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                100% Free for Indian Traders
              </div>
            </motion.div>

            {/* headline */}
            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.1]"
            >
              Trade with{' '}
              <span
                className="relative inline-block"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Rules
              </span>
              .{' '}
              <br className="hidden sm:block" />
              Not with{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #f87171 0%, #ef4444 60%, #dc2626 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Emotions
              </span>
              .
            </motion.h1>

            {/* sub-headline */}
            <motion.p
              variants={item}
              className="mt-5 max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed"
            >
              Free calculators, trading journal & discipline tools — purpose-built for{' '}
              <span className="text-foreground font-medium">Indian stock market traders</span>.
            </motion.p>

            {/* live ticker pill */}
            <motion.div variants={item} className="mt-5">
              <div className="inline-flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-md px-4 py-2.5 text-sm shadow-sm">
                <span className="text-muted-foreground font-medium shrink-0">Live</span>
                <div className="h-3.5 w-px bg-border/60" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tickerIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <span className="font-semibold text-foreground">{ticker.sym}</span>
                    <span className="text-muted-foreground">{ticker.val}</span>
                    <span className={`flex items-center gap-0.5 font-semibold ${ticker.up ? 'text-emerald-500' : 'text-red-500'}`}>
                      {ticker.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {ticker.chg}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div variants={item} className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 px-7 h-12 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
                onClick={scrollToTools}
              >
                <Calculator className="h-4 w-4" />
                Browse Calculators
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border/80 hover:border-primary/50 hover:bg-primary/5 gap-2 px-7 h-12 rounded-xl transition-all duration-200"
                onClick={() => setView('journal')}
              >
                <BookOpen className="h-4 w-4 text-primary" />
                Open Journal
              </Button>
            </motion.div>

            {/* trust strip */}
            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              {[
                { icon: Shield, label: 'No signup required' },
                { icon: Zap, label: 'Instant results' },
                { icon: Brain, label: 'Built for discipline' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: chart card + floating stats ── */}
          <div className="relative hidden lg:flex justify-center items-center">

            {/* glow behind chart */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background:
                  'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(16,185,129,0.10) 0%, transparent 70%)',
              }}
            />

            {/* chart card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              {/* card header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium ml-1">NIFTY 50 · Live Chart</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  LIVE
                </div>
              </div>

              {/* price row */}
              {(() => {
                const niftyItem = marketData?.data?.find((i: any) => i.id === 'nifty')
                const priceVal = niftyItem ? niftyItem.price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '24,850.30'
                const changeVal = niftyItem ? niftyItem.change : 208.45
                const pctVal = niftyItem ? niftyItem.changePercent : 0.84
                const isUp = changeVal >= 0

                const openVal = niftyItem && niftyItem.open ? niftyItem.open.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '24,641'
                const highVal = niftyItem && niftyItem.high ? niftyItem.high.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '24,893'
                const lowVal = niftyItem && niftyItem.low ? niftyItem.low.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '24,590'

                return (
                  <>
                    <div className="px-5 pt-4 pb-2 flex items-end gap-3">
                      <span className="text-2xl font-bold font-mono">{priceVal}</span>
                      <div className={`flex items-center gap-1 text-sm font-semibold mb-0.5 ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {isUp ? '+' : ''}{changeVal.toFixed(2)} ({isUp ? '+' : ''}{pctVal.toFixed(2)}%)
                      </div>
                    </div>

                    {/* candle chart */}
                    <div className="px-4 pb-4 h-44">
                      <CandleChart />
                    </div>

                    {/* bottom metrics row */}
                    <div className="grid grid-cols-3 border-t border-border/50">
                      {[
                        { label: 'Open', val: openVal },
                        { label: 'High', val: highVal },
                        { label: 'Low', val: lowVal },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex flex-col items-center py-3 text-center">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
                          <span className="text-sm font-semibold mt-0.5">{val}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}
            </motion.div>

            {/* floating stat cards */}
            {STATS.map(({ label, value, icon: Icon, color, delay }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: color === 'sky' ? 30 : -30, y: color === 'violet' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute ${
                  color === 'emerald' ? '-top-6 -left-8' :
                  color === 'sky' ? '-top-6 -right-8' :
                  '-bottom-4 -right-6'
                }`}
              >
                <div
                  className={`flex items-center gap-2.5 rounded-xl border bg-gradient-to-br ${colorMap[color]} backdrop-blur-xl px-4 py-2.5 shadow-xl`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <div>
                    <div className="text-base font-bold leading-none">{value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* ── bottom stats bar (mobile + desktop) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { icon: Calculator, label: '12+ Free Tools', desc: 'SIP, brokerage, P&L & more' },
            { icon: BookOpen, label: 'Trading Journal', desc: 'Track every trade & emotion' },
            { icon: Brain, label: 'Mind Journal', desc: 'Control your trading psychology' },
            { icon: BarChart2, label: 'Broker Compare', desc: 'Find the lowest brokerage' },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="group flex items-start gap-3 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-4 py-3.5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-default"
            >
              <div className="mt-0.5 rounded-lg bg-primary/10 p-2 group-hover:bg-primary/15 transition-colors">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
