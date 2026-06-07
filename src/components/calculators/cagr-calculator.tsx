'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatIndianNumber, formatPercent } from '@/lib/store'
import { BarChart3, RotateCcw, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function CagrCalculator() {
  const [initialValue, setInitialValue] = useState('100000')
  const [finalValue, setFinalValue] = useState('250000')
  const [years, setYears] = useState('5')
  const [showFaq, setShowFaq] = useState<number | null>(null)

  const resetAll = () => {
    setInitialValue('100000'); setFinalValue('250000'); setYears('5')
  }

  const result = useMemo(() => {
    const iv = parseFloat(initialValue) || 0
    const fv = parseFloat(finalValue) || 0
    const n = parseFloat(years) || 0

    if (iv <= 0 || n <= 0) return null

    const cagr = fv > 0 ? (Math.pow(fv / iv, 1 / n) - 1) * 100 : 0
    const absoluteReturn = ((fv - iv) / iv) * 100
    const totalGain = fv - iv
    const multiplier = fv / iv

    const chartData = []
    const yearByYear = []
    for (let y = 0; y <= n; y++) {
      const value = Math.round(iv * Math.pow(1 + cagr / 100, y))
      chartData.push({ year: y, value })
      yearByYear.push({ year: y, value, gain: value - iv, gainPct: ((value - iv) / iv) * 100 })
    }

    return { cagr, absoluteReturn, totalGain, multiplier, chartData, yearByYear }
  }, [initialValue, finalValue, years])

  const faqs = [
    { q: 'What is CAGR?', a: 'CAGR (Compound Annual Growth Rate) measures the annualized return of an investment over a period, assuming profits are reinvested. Unlike absolute return, CAGR accounts for the time value of money and provides a smoothed annual rate. Formula: CAGR = (FV/IV)^(1/n) - 1. For example, ₹1 Lakh growing to ₹2.5 Lakhs in 5 years = 20.11% CAGR.' },
    { q: 'CAGR vs Absolute Return?', a: 'Absolute Return = (FV - IV) / IV × 100. It ignores time. ₹1L → ₹2L in 1 year = 100% absolute return. ₹1L → ₹2L in 10 years = also 100% absolute return. CAGR fixes this: 1 year = 100% CAGR, 10 years = 7.18% CAGR. Always compare investments using CAGR, not absolute return.' },
    { q: 'What is a good CAGR for Indian markets?', a: 'For equity mutual funds: 12-15% CAGR is considered good over 5+ years. NIFTY 50 has delivered ~12-14% CAGR historically. Small-cap funds: 15-20% CAGR (with higher risk). Fixed deposits: 6-7% CAGR. PPF: 7-8% CAGR (tax-free). Real estate in Indian metros: 8-12% CAGR. Your benchmark depends on the asset class and risk level.' },
    { q: 'Limitations of CAGR?', a: 'CAGR assumes a smooth growth path, but real investments are volatile. A fund that goes -50% then +100% shows the same CAGR as one that grows steadily. CAGR also ignores: interim withdrawals/additions, volatility (use XIRR for SIP), and taxes. Always supplement CAGR with standard deviation and maximum drawdown for a complete picture.' },
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
                LIVE CALCULATOR · Compound Growth
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Calculate Your{' '}
                <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CAGR</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                Measure the true annualized return of your investments. See year-by-year growth projections and compare with benchmarks.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={() => { const el = document.getElementById('cagr-inputs'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                  <BarChart3 className="h-4 w-4" /> Calculate Now
                </button>
                <button onClick={resetAll} className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-5 py-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <RotateCcw className="h-4 w-4 text-primary" /> Reset
                </button>
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-3 shrink-0">
              {[
                { val: '12%', label: 'Nifty Benchmark CAGR', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { val: 'Yr×Yr', label: 'Year-by-Year Growth', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { val: 'FV', label: 'Future Value Projection', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
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
      <section id="cagr-inputs" className="grid lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/50 via-primary/50 to-amber-500/50" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-mono font-bold">
                <BarChart3 className="h-5 w-5 text-emerald-500" /> CAGR Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Initial Value (₹)</Label>
                <Input type="number" placeholder="100000" value={initialValue} onChange={(e) => setInitialValue(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Final Value (₹)</Label>
                <Input type="number" placeholder="250000" value={finalValue} onChange={(e) => setFinalValue(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Time Period (years)</Label>
                <Input type="number" placeholder="5" value={years} onChange={(e) => setYears(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="att-result-card rounded-xl border border-primary/30 bg-card p-4 text-center">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">CAGR</p>
                  <p className="text-xl font-black text-primary font-mono">{result.cagr.toFixed(2)}%</p>
                </div>
                <div className="att-result-card rounded-xl border border-border bg-card p-4 text-center">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Absolute Return</p>
                  <p className="text-xl font-black font-mono">{result.absoluteReturn.toFixed(2)}%</p>
                </div>
                <div className="att-result-card rounded-xl border border-border bg-card p-4 text-center">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Total Gain</p>
                  <p className="text-xl font-black text-emerald-500 font-mono">{formatCurrency(result.totalGain)}</p>
                </div>
                <div className="att-result-card rounded-xl border border-border bg-card p-4 text-center">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Wealth Multiplier</p>
                  <p className="text-xl font-black text-[var(--att-gold)] font-mono">{result.multiplier.toFixed(2)}x</p>
                </div>
              </div>

              {/* Chart */}
              <Card className="border-border/50 bg-card/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono font-bold">Growth Projection at {result.cagr.toFixed(2)}% CAGR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--att-chart-grid)" />
                        <XAxis dataKey="year" tick={{ fill: 'var(--att-chart-tick)', fontSize: 11, fontFamily: 'monospace' }} />
                        <YAxis tick={{ fill: 'var(--att-chart-tick)', fontSize: 11, fontFamily: 'monospace' }} tickFormatter={(v) => '₹' + (v >= 100000 ? (v/100000).toFixed(0)+'L' : v >= 1000 ? (v/1000).toFixed(0)+'K' : String(v))} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--att-chart-tooltip-bg)', border: '1px solid var(--att-chart-tooltip-border)', borderRadius: '8px' }} formatter={(value: number) => [formatCurrency(value), 'Value']} />
                        <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Year-by-Year Table */}
              <Card className="border-border/50 bg-card/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono font-bold">Year-by-Year Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead className="bg-muted/10 border-b border-border/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-muted-foreground font-bold">Year</th>
                          <th className="px-4 py-2 text-right text-muted-foreground font-bold">Value</th>
                          <th className="px-4 py-2 text-right text-muted-foreground font-bold">Gain</th>
                          <th className="px-4 py-2 text-right text-muted-foreground font-bold">Return %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearByYear.map((row) => (
                          <tr key={row.year} className="border-b border-border/10 hover:bg-muted/5">
                            <td className="px-4 py-2 text-muted-foreground">Year {row.year}</td>
                            <td className="px-4 py-2 text-right font-bold">{formatCurrency(row.value)}</td>
                            <td className="px-4 py-2 text-right text-emerald-500">{row.gain >= 0 ? '+' : ''}{formatCurrency(row.gain)}</td>
                            <td className="px-4 py-2 text-right">{row.gainPct.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Formula */}
              <div className="att-formula-block text-xs">
                CAGR = (FV/IV)^(1/n) - 1 = ({formatCurrency(parseFloat(finalValue) || 0)}/{formatCurrency(parseFloat(initialValue) || 0)})^(1/{years}) - 1 = {result.cagr.toFixed(2)}%
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader><CardTitle className="text-sm font-mono font-bold flex items-center gap-2"><Info className="h-4 w-4 text-emerald-500" /> Understanding CAGR</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="att-formula-block text-xs">
              CAGR = (Final Value / Initial Value)^(1/Years) - 1<br /><br />
              Where:<br />
              FV = Final value of investment<br />
              IV = Initial value of investment<br />
              n = Number of years
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              CAGR represents the one consistent rate at which your investment would have grown each year to reach its final value. It smooths out volatility and provides a standardized way to compare different investments.
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
