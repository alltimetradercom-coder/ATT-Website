'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatIndianNumber } from '@/lib/store'
import { GitBranch, RotateCcw, Info, ChevronDown, ChevronUp } from 'lucide-react'

const RETRACEMENT_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
const EXTENSION_LEVELS = [1.272, 1.618, 2.618, 3.618, 4.236]

export function FibonacciCalculator() {
  const [high, setHigh] = useState('18500')
  const [low, setLow] = useState('17800')
  const [trend, setTrend] = useState<'uptrend' | 'downtrend'>('uptrend')
  const [showFaq, setShowFaq] = useState<number | null>(null)

  const resetAll = () => {
    setHigh('18500'); setLow('17800'); setTrend('uptrend')
  }

  const result = useMemo(() => {
    const H = parseFloat(high) || 0
    const L = parseFloat(low) || 0
    if (H <= L) return null

    const diff = H - L

    const retracement = RETRACEMENT_LEVELS.map((ratio) => {
      const price = trend === 'uptrend' ? H - diff * ratio : L + diff * ratio
      return { level: ratio, price: Math.round(price * 100) / 100, label: `${(ratio * 100).toFixed(1)}%` }
    })

    const extensions = EXTENSION_LEVELS.map((ratio) => {
      let price: number
      if (trend === 'uptrend') {
        // Extensions go above the high in uptrend
        price = H + diff * (ratio - 1)
      } else {
        // Extensions go below the low in downtrend
        price = L - diff * (ratio - 1)
      }
      return { level: ratio, price: Math.round(price * 100) / 100, label: `${(ratio * 100).toFixed(1)}%` }
    })

    return { retracement, extensions, diff }
  }, [high, low, trend])

  const faqs = [
    { q: 'What are Fibonacci Retracement Levels?', a: 'Fibonacci retracement levels are horizontal lines that indicate potential support (in uptrend) or resistance (in downtrend) levels. They are based on the key Fibonacci ratios: 23.6%, 38.2%, 50%, 61.8%, and 78.6%. Traders use these levels to identify potential reversal points, entry zones, and stop-loss placement. The 61.8% level (Golden Ratio) is considered the strongest.' },
    { q: 'What are Fibonacci Extension Levels?', a: 'Fibonacci extensions project where the price may go AFTER a retracement. Key extension levels: 127.2%, 161.8%, 261.8%, and 423.6%. These are used to set profit targets. For example, if NIFTY retraces from 18500 to 17800, then bounces, the 161.8% extension projects the potential upside target beyond the previous high.' },
    { q: 'How do I draw Fibonacci in trading?', a: 'In an uptrend: Draw from the swing low to the swing high. Retracement levels below show support zones. In a downtrend: Draw from the swing high to the swing low. Retracement levels above show resistance zones. On Zerodha Kite/TradingView: Select the Fibonacci tool from the drawing toolbar, click and drag from low to high (or high to low).' },
    { q: 'Which Fibonacci levels are most important?', a: 'The 61.8% (Golden Ratio) is the most important — it acts as a strong support/resistance. The 38.2% is the second most watched level, often the first retracement target. The 50% level (not actually a Fibonacci ratio but widely used) is psychologically significant. For extensions, 161.8% is the most common profit target. In Indian markets, 61.8% retracement of NIFTY/BANKNIFTY swings is respected most often.' },
  ]

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 80% at 0% 50%, rgba(16,185,129,0.10) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 60% at 100% 80%, rgba(139,92,246,0.07) 0%, transparent 60%)' }} />
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/60 via-primary/40 to-violet-500/40" />
        <div className="relative px-6 sm:px-10 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" /></span>
                LIVE CALCULATOR · Golden Ratio Levels
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Fibonacci{' '}
                <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Retracement & Extension</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                Calculate precise Fibonacci retracement and extension levels. Find support/resistance zones and profit targets for any trade.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={() => { const el = document.getElementById('fib-inputs'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                  <GitBranch className="h-4 w-4" /> Calculate Now
                </button>
                <button onClick={resetAll} className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-5 py-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <RotateCcw className="h-4 w-4 text-primary" /> Reset
                </button>
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-3 shrink-0">
              {[
                { val: '61.8%', label: 'Golden Ratio', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { val: 'Ext', label: 'Extension Targets', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { val: 'S/R', label: 'Support & Resistance', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              ].map(({ val, label, color, bg }) => (
                <div key={label} className={`flex items-center gap-3 rounded-xl border ${bg} px-4 py-2.5 backdrop-blur-sm`}>
                  <span className={`text-lg font-black font-mono ${color}`}>{val}</span>
                  <span className="text-xs text-muted-foreground leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Calculator Body ── */}
      <section id="fib-inputs" className="grid lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/50 via-primary/50 to-amber-500/50" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-mono font-bold">
                <GitBranch className="h-5 w-5 text-emerald-500" /> Fibonacci Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">High Price</Label>
                  <Input type="number" placeholder="18500" value={high} onChange={(e) => setHigh(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Low Price</Label>
                  <Input type="number" placeholder="17800" value={low} onChange={(e) => setLow(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Trend Direction</Label>
                <Select value={trend} onValueChange={(v) => setTrend(v as 'uptrend' | 'downtrend')}>
                  <SelectTrigger className="bg-background/50 border-border/50 font-mono text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uptrend">Uptrend (Retracement Down)</SelectItem>
                    <SelectItem value="downtrend">Downtrend (Retracement Up)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={resetAll} className="w-full gap-1 text-xs font-mono">
                <RotateCcw className="h-3.5 w-3.5" /> Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {result && (
            <>
              {/* Range Info */}
              <div className="att-result-card rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Swing Range</p>
                    <p className="font-mono font-bold text-lg">{formatIndianNumber(parseFloat(high))} — {formatIndianNumber(parseFloat(low))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Range Size</p>
                    <p className="font-mono font-bold text-lg text-[var(--att-gold)]">{formatIndianNumber(result.diff)}</p>
                  </div>
                </div>
              </div>

              {/* Retracement Levels */}
              <Card className="border-border/50 bg-card/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono font-bold text-primary">
                    Retracement Levels ({trend === 'uptrend' ? 'Support Zones' : 'Resistance Zones'})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.retracement.map(({ level, price, label }) => {
                    const isKeyLevel = level === 0.382 || level === 0.5 || level === 0.618
                    const isExtreme = level === 0 || level === 1
                    return (
                      <div key={level} className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${isKeyLevel ? 'bg-primary/10 border border-primary/20' : isExtreme ? 'bg-accent border border-border/50' : 'bg-accent/50 border border-border/30'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${isKeyLevel ? 'bg-primary' : isExtreme ? 'bg-foreground' : 'bg-muted-foreground'}`} />
                          <span className={`text-sm font-medium font-mono ${isKeyLevel ? 'text-primary font-bold' : ''}`}>{label}</span>
                          {level === 0.618 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono font-bold">GOLDEN</span>}
                        </div>
                        <span className={`font-semibold font-mono ${isKeyLevel ? 'text-primary' : ''}`}>{formatCurrency(price)}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Extension Levels */}
              <Card className="border-border/50 bg-card/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono font-bold text-amber-500">
                    Extension Levels (Profit Targets)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.extensions.map(({ level, price, label }) => {
                    const isKey = level === 1.618
                    return (
                      <div key={level} className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${isKey ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-500/5 border border-amber-500/10'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${isKey ? 'bg-amber-500' : 'bg-amber-500/50'}`} />
                          <span className={`text-sm font-medium font-mono ${isKey ? 'text-amber-500 font-bold' : 'text-amber-400'}`}>{label}</span>
                          {isKey && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-mono font-bold">KEY TARGET</span>}
                        </div>
                        <span className={`font-semibold font-mono ${isKey ? 'text-amber-500' : 'text-amber-400'}`}>{formatCurrency(price)}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Formula */}
              <div className="att-formula-block text-xs">
                {trend === 'uptrend'
                  ? 'Retracement: Level = High - (High-Low) × ratio | Extension: Level = High + (High-Low) × (ratio-1)'
                  : 'Retracement: Level = Low + (High-Low) × ratio | Extension: Level = Low - (High-Low) × (ratio-1)'}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader><CardTitle className="text-sm font-mono font-bold flex items-center gap-2"><Info className="h-4 w-4 text-emerald-500" /> Fibonacci in Trading</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Fibonacci levels are derived from the Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21...) where each number is the sum of the two preceding ones. The key ratios (0.236, 0.382, 0.5, 0.618, 0.786) represent the mathematical relationships found throughout nature and financial markets.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The 61.8% level (Golden Ratio = 1/1.618) is the most powerful Fibonacci level in trading. It often acts as a strong support in uptrends and resistance in downtrends, as institutional traders place orders around this level.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader><CardTitle className="text-sm font-mono font-bold">Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-lg border border-border/30 overflow-hidden">
                <button onClick={() => setShowFaq(showFaq === i ? null : i)} className="w-full flex items-center justify-between p-3 text-left text-xs font-medium hover:bg-muted/30 transition-colors">
                  <span>{faq.q}</span>
                  {showFaq === i ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
                </button>
                <div className={`att-faq-answer ${showFaq === i ? 'open' : ''}`}>
                  <p className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
