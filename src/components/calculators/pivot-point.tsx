'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatIndianNumber } from '@/lib/store'
import { Crosshair, RotateCcw, Info, ChevronDown, ChevronUp } from 'lucide-react'

type Method = 'classic' | 'fibonacci' | 'camarilla' | 'woodie' | 'demmark'

interface PivotResult {
  pp: number
  r1: number; r2: number; r3: number; r4: number
  s1: number; s2: number; s3: number; s4: number
}

export function PivotPointCalculator() {
  const [high, setHigh] = useState('18500')
  const [low, setLow] = useState('18200')
  const [close, setClose] = useState('18400')
  const [open, setOpen] = useState('18300')
  const [method, setMethod] = useState<Method>('classic')
  const [showFaq, setShowFaq] = useState<number | null>(null)

  const resetAll = () => {
    setHigh('18500'); setLow('18200'); setClose('18400'); setOpen('18300'); setMethod('classic')
  }

  const result = useMemo((): PivotResult | null => {
    const H = parseFloat(high)
    const L = parseFloat(low)
    const C = parseFloat(close)
    const O = parseFloat(open)
    if (isNaN(H) || isNaN(L) || isNaN(C)) return null

    switch (method) {
      case 'classic':
      default: {
        const pp = (H + L + C) / 3
        return { pp, r1: 2*pp-L, r2: pp+(H-L), r3: H+2*(pp-L), r4: pp+3*(H-L), s1: 2*pp-H, s2: pp-(H-L), s3: L-2*(H-pp), s4: pp-3*(H-L) }
      }
      case 'fibonacci': {
        const pp = (H + L + C) / 3
        return { pp, r1: pp+0.382*(H-L), r2: pp+0.618*(H-L), r3: pp+(H-L), r4: pp+1.382*(H-L), s1: pp-0.382*(H-L), s2: pp-0.618*(H-L), s3: pp-(H-L), s4: pp-1.382*(H-L) }
      }
      case 'camarilla': {
        return { pp: (H+L+C)/3, r4: C+(H-L)*1.1/2, r3: C+(H-L)*1.1/4, r2: C+(H-L)*1.1/6, r1: C+(H-L)*1.1/12, s1: C-(H-L)*1.1/12, s2: C-(H-L)*1.1/6, s3: C-(H-L)*1.1/4, s4: C-(H-L)*1.1/2 }
      }
      case 'woodie': {
        const pp = (H+L+2*C)/4
        return { pp, r1: 2*pp-L, r2: pp+(H-L), r3: H+2*(pp-L), r4: pp+3*(H-L), s1: 2*pp-H, s2: pp-(H-L), s3: L-2*(H-pp), s4: pp-3*(H-L) }
      }
      case 'demmark': {
        let x: number
        if (!isNaN(O)) {
          if (C < O) x = H+2*L+C
          else if (C > O) x = 2*H+L+C
          else x = H+L+2*C
        } else { x = H+L+2*C }
        const pp = x/4
        return { pp, r1: x/2-L, r2: pp+(H-L), r3: H+2*(pp-L), r4: 0, s1: x/2-H, s2: pp-(H-L), s3: L-2*(H-pp), s4: 0 }
      }
    }
  }, [high, low, close, open, method])

  const fmtLevel = (v: number) => isNaN(v) || v === 0 ? '—' : formatIndianNumber(v)

  const faqs = [
    { q: 'What are Pivot Points?', a: 'Pivot Points are technical analysis indicators that calculate potential support and resistance levels based on the previous period\'s high, low, and close prices. The central Pivot Point (PP) acts as the primary level — prices above PP suggest bullish sentiment, prices below suggest bearish. Traders use these levels to identify potential entry/exit points and stop-loss levels.' },
    { q: 'Which method should I use?', a: 'Classic: Most widely used, works well in trending markets. Fibonacci: Adds Fibonacci ratios (0.382, 0.618) — popular among Indian traders. Camarilla: Uses a different formula that produces tighter levels — excellent for intraday trading. Woodie: Gives more weight to the close price — useful when close is significant. DeMark: Requires open price — best for daily timeframe analysis.' },
    { q: 'How do I use Pivot Points for intraday trading in India?', a: 'For NIFTY/BANKNIFTY intraday: Use yesterday\'s High, Low, Close. If price opens above PP, look for longs with S1 as stop. If below PP, look for shorts with R1 as stop. R1/R2 are profit targets for longs; S1/S2 for shorts. Camarilla works best for intraday due to tighter levels. Combine with volume and OI analysis for better accuracy.' },
    { q: 'What timeframes work best?', a: 'Daily pivots (previous day\'s HLC) are most common for intraday trading. Weekly pivots work for swing trades (2-5 days). Monthly pivots help identify long-term support/resistance. For Indian markets, daily pivots calculated from previous day\'s NIFTY data are widely followed by institutional and retail traders alike.' },
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
                LIVE CALCULATOR · 5 Methods
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Calculate{' '}
                <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pivot Points</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                Classic, Fibonacci, Camarilla, Woodie, and DeMark pivot calculations. Find intraday support and resistance levels instantly.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={() => { const el = document.getElementById('pivot-inputs'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                  <Crosshair className="h-4 w-4" /> Calculate Now
                </button>
                <button onClick={resetAll} className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-5 py-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <RotateCcw className="h-4 w-4 text-primary" /> Reset
                </button>
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-3 shrink-0">
              {[
                { val: '5', label: 'Calculation Methods', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { val: 'S/R', label: 'Support & Resistance', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { val: 'HLC', label: 'High-Low-Close Based', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
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
      <section id="pivot-inputs" className="grid lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/50 via-primary/50 to-amber-500/50" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-mono font-bold">
                <Crosshair className="h-5 w-5 text-emerald-500" />
                Pivot Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">High Price</Label>
                  <Input type="number" placeholder="18500" value={high} onChange={(e) => setHigh(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Low Price</Label>
                  <Input type="number" placeholder="18200" value={low} onChange={(e) => setLow(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Close Price</Label>
                  <Input type="number" placeholder="18400" value={close} onChange={(e) => setClose(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className={`text-xs font-mono font-semibold tracking-wider uppercase ${method === 'demmark' ? 'text-amber-400' : 'text-muted-foreground'}`}>
                    Open {method === 'demmark' ? '(Required)' : '(Optional)'}
                  </Label>
                  <Input type="number" placeholder="18300" value={open} onChange={(e) => setOpen(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Method</Label>
                <Select value={method} onValueChange={(v) => setMethod(v as Method)}>
                  <SelectTrigger className="bg-background/50 border-border/50 font-mono text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Classic (Standard)</SelectItem>
                    <SelectItem value="fibonacci">Fibonacci</SelectItem>
                    <SelectItem value="camarilla">Camarilla (Intraday)</SelectItem>
                    <SelectItem value="woodie">Woodie</SelectItem>
                    <SelectItem value="demmark">DeMark</SelectItem>
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
              {/* PP Card */}
              <div className="att-result-card rounded-xl border border-primary/30 bg-card p-6 text-center">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Pivot Point (PP)</p>
                <p className="text-3xl font-bold font-mono">{fmtLevel(result.pp)}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{method} Method</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Resistance */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-primary mb-2 font-mono">Resistance Levels</h4>
                  {[
                    { label: 'R4', value: result.r4 },
                    { label: 'R3', value: result.r3 },
                    { label: 'R2', value: result.r2 },
                    { label: 'R1', value: result.r1 },
                  ].filter(l => l.value !== 0).reverse().map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5">
                      <span className="text-sm font-medium text-primary font-mono">{label}</span>
                      <span className="font-semibold font-mono">{fmtLevel(value)}</span>
                    </div>
                  ))}
                </div>
                {/* Support */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-red-400 mb-2 font-mono">Support Levels</h4>
                  {[
                    { label: 'S1', value: result.s1 },
                    { label: 'S2', value: result.s2 },
                    { label: 'S3', value: result.s3 },
                    { label: 'S4', value: result.s4 },
                  ].filter(l => l.value !== 0).map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between rounded-lg bg-red-500/5 border border-red-500/20 px-4 py-2.5">
                      <span className="text-sm font-medium text-red-400 font-mono">{label}</span>
                      <span className="font-semibold font-mono">{fmtLevel(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formula */}
              <div className="att-formula-block text-xs">
                {method === 'classic' && 'PP = (H + L + C) / 3 | R1 = 2×PP - L | S1 = 2×PP - H | R2 = PP + (H-L) | S2 = PP - (H-L)'}
                {method === 'fibonacci' && 'PP = (H + L + C) / 3 | R1 = PP + 0.382×(H-L) | R2 = PP + 0.618×(H-L) | S1 = PP - 0.382×(H-L) | S2 = PP - 0.618×(H-L)'}
                {method === 'camarilla' && 'R4 = C + (H-L)×1.1/2 | R3 = C + (H-L)×1.1/4 | S4 = C - (H-L)×1.1/2 | S3 = C - (H-L)×1.1/4'}
                {method === 'woodie' && 'PP = (H + L + 2×C) / 4 | R1 = 2×PP - L | S1 = 2×PP - H'}
                {method === 'demmark' && 'If C<O: X = H+2L+C | If C>O: X = 2H+L+C | If C=O: X = H+L+2C | PP = X/4 | R1 = X/2 - L | S1 = X/2 - H'}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-mono font-bold flex items-center gap-2">
              <Info className="h-4 w-4 text-emerald-500" /> How Pivot Points Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pivot Points are calculated from the previous period&apos;s price data. The central PP level acts as a pivot — price above suggests bullishness, below suggests bearishness. Resistance levels (R1-R4) are price targets in an uptrend, while Support levels (S1-S4) act as floors in a downtrend.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In Indian markets, daily pivot levels for NIFTY and BANKNIFTY are widely watched by institutional and retail traders. They work best in ranging markets and on the daily timeframe.
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
