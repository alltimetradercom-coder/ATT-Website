'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatIndianNumber, formatPercent } from '@/lib/store'
import { Diamond, RotateCcw, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

type Method = 'graham' | 'dcf'

export function IntrinsicValueCalculator() {
  const [method, setMethod] = useState<Method>('dcf')
  const [eps, setEps] = useState('80')
  const [growthRate, setGrowthRate] = useState('12')
  const [discountRate, setDiscountRate] = useState('10')
  const [terminalGrowthRate, setTerminalGrowthRate] = useState('3')
  const [projectionYears, setProjectionYears] = useState('10')
  const [bookValue, setBookValue] = useState('500')
  const [currentPrice, setCurrentPrice] = useState('2500')
  const [showFaq, setShowFaq] = useState<number | null>(null)

  const resetAll = () => {
    setMethod('dcf'); setEps('80'); setGrowthRate('12'); setDiscountRate('10')
    setTerminalGrowthRate('3'); setProjectionYears('10'); setBookValue('500'); setCurrentPrice('2500')
  }

  const result = useMemo(() => {
    const e = parseFloat(eps) || 0
    const g = parseFloat(growthRate) || 0
    const cp = parseFloat(currentPrice) || 0

    if (e <= 0) return null

    let intrinsicValue: number
    let methodName: string
    let chartData: { year: number; eps: number; pvEps: number }[] = []

    if (method === 'graham') {
      const bv = parseFloat(bookValue)
      const y = parseFloat(discountRate) || 6.5

      if (!isNaN(bv) && bv > 0) {
        intrinsicValue = Math.sqrt(22.5 * e * bv)
        methodName = 'Graham Number'
      } else {
        intrinsicValue = e * (8.5 + 2 * g) * 4.4 / y
        methodName = "Graham's Formula"
      }
    } else {
      const r = parseFloat(discountRate) || 10
      const years = parseInt(projectionYears) || 10
      const terminalG = parseFloat(terminalGrowthRate) || 3
      const discountFactor = r / 100
      const termGrowthFactor = terminalG / 100

      if (discountFactor <= termGrowthFactor) return null

      let totalPV = 0
      let futureEPS = e
      for (let yr = 1; yr <= years; yr++) {
        futureEPS = futureEPS * (1 + g / 100)
        const pvEps = futureEPS / Math.pow(1 + discountFactor, yr)
        totalPV += pvEps
        chartData.push({ year: yr, eps: Math.round(futureEPS * 100) / 100, pvEps: Math.round(pvEps * 100) / 100 })
      }

      const terminalValue = (futureEPS * (1 + termGrowthFactor)) / (discountFactor - termGrowthFactor)
      const pvTerminal = terminalValue / Math.pow(1 + discountFactor, years)
      totalPV += pvTerminal

      intrinsicValue = totalPV
      methodName = 'DCF (Discounted Cash Flow)'
    }

    const marginOfSafety = cp > 0 ? ((intrinsicValue - cp) / cp) * 100 : null
    const isUndervalued = cp > 0 ? intrinsicValue > cp : null

    return {
      intrinsicValue: Math.round(intrinsicValue * 100) / 100,
      marginOfSafety,
      isUndervalued,
      method: methodName,
      chartData,
    }
  }, [method, eps, growthRate, discountRate, terminalGrowthRate, projectionYears, bookValue, currentPrice])

  const faqs = [
    { q: 'What is Intrinsic Value?', a: 'Intrinsic value is the true, underlying value of a stock based on its fundamentals — earnings, growth, and risk — regardless of market price. If intrinsic value > market price, the stock is undervalued (buy signal). If intrinsic value < market price, it\'s overvalued. Warren Buffett\'s entire strategy revolves around buying stocks below their intrinsic value with a margin of safety.' },
    { q: 'Graham Number vs DCF — which to use?', a: 'Graham Number: Quick and simple, best for stable, mature companies. Uses EPS and Book Value. Limitation: doesn\'t account for high-growth companies well. DCF: More comprehensive, models future cash flows. Better for growth companies but more sensitive to assumptions (growth rate, discount rate). For Indian stocks: Use Graham for banking/PSU stocks, DCF for IT/pharma/consumer companies with predictable growth.' },
    { q: 'What is Margin of Safety?', a: 'Margin of Safety = (Intrinsic Value - Market Price) / Market Price × 100. It\'s the discount at which you\'re buying relative to intrinsic value. Buffett requires at least 25-30% margin of safety. If intrinsic value is ₹3000 and market price is ₹2100, margin of safety = 42.8% — a good buy. If price is ₹2800, margin = 7.1% — too risky. Higher margin of safety protects against calculation errors and market volatility.' },
    { q: 'What discount rate should I use for Indian stocks?', a: 'Discount rate represents your required return. For Indian markets: Large-cap stable companies: 10-12%. Mid-cap growth companies: 13-15%. Small-cap/high-growth: 15-18%. A simpler approach: Use India\'s risk-free rate (10-year government bond ~7%) + equity risk premium (~5-7%) = 12-14%. Higher discount rates produce more conservative (lower) intrinsic values.' },
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
                LIVE CALCULATOR · Value Investing
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Estimate{' '}
                <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Intrinsic Value</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                Use Graham Number or DCF analysis to find what a stock is truly worth. Identify undervalued stocks with margin of safety.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={() => { const el = document.getElementById('iv-inputs'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                  <Diamond className="h-4 w-4" /> Calculate Now
                </button>
                <button onClick={resetAll} className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-5 py-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <RotateCcw className="h-4 w-4 text-primary" /> Reset
                </button>
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-3 shrink-0">
              {[
                { val: 'DCF', label: 'Discounted Cash Flow', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { val: 'MoS', label: 'Margin of Safety', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { val: '₹ IV', label: 'Intrinsic Value', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
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
      <section id="iv-inputs" className="grid lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/50 via-primary/50 to-amber-500/50" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-mono font-bold">
                <Diamond className="h-5 w-5 text-emerald-500" /> Valuation Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Valuation Method</Label>
                <Select value={method} onValueChange={(v) => setMethod(v as Method)}>
                  <SelectTrigger className="bg-background/50 border-border/50 font-mono text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="graham">Graham Number / Formula</SelectItem>
                    <SelectItem value="dcf">DCF (Discounted Cash Flow)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">EPS (₹)</Label>
                  <Input type="number" placeholder="80" value={eps} onChange={(e) => setEps(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Growth Rate (%)</Label>
                  <Input type="number" placeholder="12" value={growthRate} onChange={(e) => setGrowthRate(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                </div>
              </div>

              {method === 'graham' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Book Value/Share (₹)</Label>
                    <Input type="number" placeholder="500" value={bookValue} onChange={(e) => setBookValue(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Bond Yield Y (%)</Label>
                    <Input type="number" placeholder="6.5" value={discountRate} onChange={(e) => setDiscountRate(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Discount Rate (%)</Label>
                    <Input type="number" placeholder="10" value={discountRate} onChange={(e) => setDiscountRate(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Terminal Growth (%)</Label>
                    <Input type="number" placeholder="3" value={terminalGrowthRate} onChange={(e) => setTerminalGrowthRate(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Years</Label>
                    <Input type="number" placeholder="10" value={projectionYears} onChange={(e) => setProjectionYears(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Current Market Price (₹) — optional</Label>
                <Input type="number" placeholder="2500" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
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
              {/* Intrinsic Value */}
              <div className="att-result-card rounded-xl border border-primary/30 bg-card p-6 text-center">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Intrinsic Value Per Share</p>
                <p className="text-4xl font-bold text-primary font-mono">{formatCurrency(result.intrinsicValue)}</p>
                <p className="text-xs text-muted-foreground mt-2">{result.method}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {result.marginOfSafety !== null && (
                  <div className={`att-result-card rounded-xl p-4 ${result.isUndervalued ? 'border border-emerald-500/30 bg-emerald-500/5' : 'border border-red-500/30 bg-red-500/5'}`}>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Margin of Safety</div>
                    <div className={`font-mono font-bold text-2xl ${result.isUndervalued ? 'text-emerald-500' : 'text-red-400'}`}>
                      {result.marginOfSafety > 0 ? '+' : ''}{result.marginOfSafety.toFixed(2)}%
                    </div>
                    <p className={`text-xs mt-1 ${result.isUndervalued ? 'text-emerald-500' : 'text-red-400'}`}>
                      {result.isUndervalued ? '✅ Undervalued — Good Buy' : '⚠️ Overvalued — Risky'}
                    </p>
                  </div>
                )}
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Current Price</div>
                  <div className="font-mono font-bold text-2xl">{currentPrice ? formatCurrency(parseFloat(currentPrice)) : '—'}</div>
                </div>
              </div>

              {/* DCF Chart */}
              {method === 'dcf' && result.chartData.length > 0 && (
                <Card className="border-border/50 bg-card/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono font-bold">EPS Projection & Present Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--att-chart-grid)" />
                          <XAxis dataKey="year" tick={{ fill: 'var(--att-chart-tick)', fontSize: 10, fontFamily: 'monospace' }} />
                          <YAxis tick={{ fill: 'var(--att-chart-tick)', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={(v) => '₹' + v} />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--att-chart-tooltip-bg)', border: '1px solid var(--att-chart-tooltip-border)', borderRadius: '8px' }} formatter={(value: number, name: string) => [formatCurrency(value), name === 'eps' ? 'Future EPS' : 'PV of EPS']} />
                          <Line type="monotone" dataKey="eps" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 2 }} name="eps" />
                          <Line type="monotone" dataKey="pvEps" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#F59E0B', r: 2 }} name="pvEps" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Formula */}
              <div className="att-formula-block text-xs">
                {method === 'graham' && bookValue
                  ? `Graham Number = √(22.5 × EPS × BVPS) = √(22.5 × ${eps} × ${bookValue}) = ${formatCurrency(result.intrinsicValue)}`
                  : method === 'graham'
                  ? `IV = EPS × (8.5 + 2g) × 4.4 / Y = ${eps} × (8.5 + 2×${growthRate}%) × 4.4 / ${discountRate || 6.5}% = ${formatCurrency(result.intrinsicValue)}`
                  : `DCF: Sum of PV of future EPS + PV of Terminal Value | Discount: ${discountRate}% | Terminal Growth: ${terminalGrowthRate}% | Years: ${projectionYears}`}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader><CardTitle className="text-sm font-mono font-bold flex items-center gap-2"><Info className="h-4 w-4 text-emerald-500" /> Valuation Methods</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="att-formula-block text-xs">
              {method === 'graham' ? (
                <>
                  Graham Number = √(22.5 × EPS × Book Value Per Share)<br />
                  Graham Formula = EPS × (8.5 + 2g) × 4.4 / Y<br />
                  Where: g = growth rate, Y = AAA bond yield
                </>
              ) : (
                <>
                  IV = Σ [EPS×(1+g)^t / (1+r)^t] + Terminal Value / (1+r)^n<br />
                  Terminal Value = EPS×(1+g_term) / (r - g_term)<br />
                  Where: g = growth rate, r = discount rate, g_term = terminal growth
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Both methods estimate what a stock is truly worth. Graham is simpler and better for mature companies. DCF is more comprehensive and works for growth companies, but its output is very sensitive to the growth rate and discount rate assumptions.
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
