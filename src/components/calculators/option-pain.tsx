'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatIndianNumber } from '@/lib/store'
import { Target, Plus, Trash2, RotateCcw, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

interface StrikeRow {
  id: string
  strike: string
  callOI: string
  putOI: string
}

const DEFAULT_ROWS: StrikeRow[] = [
  { id: '1', strike: '22000', callOI: '1500000', putOI: '800000' },
  { id: '2', strike: '22100', callOI: '1200000', putOI: '950000' },
  { id: '3', strike: '22200', callOI: '1800000', putOI: '1100000' },
  { id: '4', strike: '22300', callOI: '2200000', putOI: '1400000' },
  { id: '5', strike: '22400', callOI: '1600000', putOI: '1900000' },
  { id: '6', strike: '22500', callOI: '1100000', putOI: '2300000' },
  { id: '7', strike: '22600', callOI: '900000', putOI: '1700000' },
]

export function OptionPainCalculator() {
  const [rows, setRows] = useState<StrikeRow[]>(DEFAULT_ROWS)
  const [index, setIndex] = useState<'nifty' | 'banknifty'>('nifty')
  const [showFaq, setShowFaq] = useState<number | null>(null)

  const addRow = () => {
    setRows([...rows, { id: Date.now().toString(), strike: '', callOI: '', putOI: '' }])
  }

  const removeRow = (id: string) => {
    if (rows.length > 2) {
      setRows(rows.filter((r) => r.id !== id))
    }
  }

  const updateRow = (id: string, field: keyof StrikeRow, value: string) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const resetAll = () => {
    setRows(DEFAULT_ROWS)
  }

  // Real-time calculation
  const result = useMemo(() => {
    const parsed = rows
      .map((r) => ({
        strike: parseFloat(r.strike),
        callOI: parseFloat(r.callOI) || 0,
        putOI: parseFloat(r.putOI) || 0,
      }))
      .filter((r) => !isNaN(r.strike))

    if (parsed.length < 2) return null

    const chartData = parsed.map(({ strike, callOI, putOI }) => {
      let totalValue = 0
      for (const row of parsed) {
        const callValue = Math.max(0, strike - row.strike) * row.callOI
        const putValue = Math.max(0, row.strike - strike) * row.putOI
        totalValue += callValue + putValue
      }
      return { strike, totalValue: Math.round(totalValue), callOI, putOI }
    })

    const painPoint = chartData.reduce((min, curr) =>
      curr.totalValue < min.totalValue ? curr : min
    ).strike

    // Find total CE and PE OI
    const totalCE = parsed.reduce((s, r) => s + r.callOI, 0)
    const totalPE = parsed.reduce((s, r) => s + r.putOI, 0)

    return { painPoint, chartData, totalCE, totalPE }
  }, [rows])

  const faqs = [
    {
      q: 'What is Option Pain (Max Pain)?',
      a: 'Option Pain, also called Max Pain, is the strike price at which the total value of all outstanding options (calls + puts) would expire worthless. This is the price where option writers (sellers) would incur the least loss, and option buyers would lose the most money. The theory suggests that as expiry approaches, the underlying price tends to gravitate toward the max pain point due to hedging activity by option writers.'
    },
    {
      q: 'How is Max Pain calculated?',
      a: 'For each strike price, we calculate the intrinsic value of ALL outstanding call and put options if the index/stock were to expire at that strike. The strike where total intrinsic value is minimum is the Max Pain point. Formula: For each strike S, Total Value = Σ max(0, S - K_i) × CE_OI_i + Σ max(0, K_i - S) × PE_OI_i, where K_i are all strike prices and OI_i are open interest values.'
    },
    {
      q: 'Is Max Pain a reliable trading signal?',
      a: 'Max Pain is a sentiment indicator, not a guaranteed prediction. It works best on expiry day or the day before, when hedging pressure is strongest. In Indian markets, NIFTY and BANKNIFTY tend to respect max pain levels more on weekly expiries due to the large institutional OI. However, strong news events, FII/DII flows, or sudden volatility can override max pain. Always combine with other indicators (support/resistance, OI analysis, PCR).'
    },
    {
      q: 'Where do I get OI data for Indian markets?',
      a: 'You can get real-time option chain data from: NSE India website (nseindia.com → Option Chain), your broker\'s platform (Zerodha Kite, Upstox Pro, Angel One), or free APIs like NSEpy. Enter the strike prices and corresponding CE/PE OI values from the option chain into this calculator. For most accurate results, use ATM and near-the-money strikes (5-7 strikes above and below current spot).'
    },
  ]

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6">
      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 80% at 0% 50%, rgba(16,185,129,0.10) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 60% at 100% 80%, rgba(139,92,246,0.07) 0%, transparent 60%)' }} />
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/60 via-primary/40 to-violet-500/40" />

        <div className="relative px-6 sm:px-10 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                LIVE CALCULATOR · Max Pain Theory
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Find the{' '}
                <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Option Pain Point
                </span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                Discover where option writers have maximum advantage. Enter option chain OI data to find the strike where total option value is minimized — the max pain point.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={() => { const el = document.getElementById('option-inputs'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                  <Target className="h-4 w-4" /> Calculate Now
                </button>
                <button onClick={resetAll} className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-5 py-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <RotateCcw className="h-4 w-4 text-primary" /> Reset
                </button>
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-3 shrink-0">
              {[
                { val: 'NIFTY', label: 'Index Options', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { val: 'OI', label: 'Open Interest Based', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { val: 'Expiry', label: 'Max Pain Theory', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
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
      <section id="option-inputs" className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Left: Inputs */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/50 via-primary/50 to-amber-500/50" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-mono font-bold">
                <Target className="h-5 w-5 text-emerald-500" />
                Option Chain Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">Index</Label>
                <Select value={index} onValueChange={(v) => setIndex(v as 'nifty' | 'banknifty')}>
                  <SelectTrigger className="bg-background/50 border-border/50 font-mono text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nifty">NIFTY 50</SelectItem>
                    <SelectItem value="banknifty">BANKNIFTY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Header Row */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                <div className="col-span-4">Strike</div>
                <div className="col-span-3">CE OI</div>
                <div className="col-span-3">PE OI</div>
                <div className="col-span-2"></div>
              </div>

              {/* Strike Rows */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {rows.map((row) => (
                  <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <Input type="number" placeholder="22000" value={row.strike} onChange={(e) => updateRow(row.id, 'strike', e.target.value)} className="att-lot-input text-sm h-9" />
                    </div>
                    <div className="col-span-3">
                      <Input type="number" placeholder="0" value={row.callOI} onChange={(e) => updateRow(row.id, 'callOI', e.target.value)} className="att-lot-input text-sm h-9" />
                    </div>
                    <div className="col-span-3">
                      <Input type="number" placeholder="0" value={row.putOI} onChange={(e) => updateRow(row.id, 'putOI', e.target.value)} className="att-lot-input text-sm h-9" />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <Button variant="ghost" size="icon" onClick={() => removeRow(row.id)} disabled={rows.length <= 2} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={addRow} className="gap-1 text-xs font-mono">
                  <Plus className="h-3.5 w-3.5" /> Add Strike
                </Button>
                <Button variant="outline" onClick={resetAll} className="gap-1 text-xs font-mono">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-3 space-y-4">
          {result && (
            <>
              {/* Pain Point Card */}
              <div className="att-result-card rounded-xl border border-primary/30 bg-card p-6 text-center">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Option Max Pain Point</p>
                <p className="text-4xl font-bold text-primary font-mono">{formatIndianNumber(result.painPoint)}</p>
                <p className="text-xs text-muted-foreground mt-2">Maximum option writers profit at this strike price</p>
              </div>

              {/* OI Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Total CE OI</div>
                  <div className="font-mono font-bold text-xl text-emerald-500">{(result.totalCE / 100000).toFixed(1)}L</div>
                </div>
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Total PE OI</div>
                  <div className="font-mono font-bold text-xl text-red-400">{(result.totalPE / 100000).toFixed(1)}L</div>
                </div>
              </div>

              {/* PCR */}
              <div className="att-result-card rounded-xl border border-border bg-card p-4">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Put-Call Ratio (PCR)</div>
                <div className="font-mono font-bold text-lg text-[var(--att-gold)]">{result.totalCE > 0 ? (result.totalPE / result.totalCE).toFixed(3) : '—'}</div>
                <p className="text-xs text-muted-foreground mt-1">PCR {'>'} 1 = Bullish sentiment | PCR {'<'} 1 = Bearish sentiment</p>
              </div>

              {/* Chart */}
              <Card className="border-border/50 bg-card/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono font-bold">Total Option Value at Each Strike</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--att-chart-grid)" />
                        <XAxis dataKey="strike" tick={{ fill: 'var(--att-chart-tick)', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={(v) => Number(v) >= 1000 ? `${(Number(v)/1000).toFixed(0)}K` : String(v)} />
                        <YAxis tick={{ fill: 'var(--att-chart-tick)', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={(v) => v >= 10000000 ? `${(v/10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v/100000).toFixed(0)}L` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--att-chart-tooltip-bg)', border: '1px solid var(--att-chart-tooltip-border)', borderRadius: '8px' }} labelStyle={{ fontFamily: 'monospace' }} formatter={(value: number) => [formatIndianNumber(value), 'Total Value']} labelFormatter={(label) => `Strike: ${label}`} />
                        <Bar dataKey="totalValue" radius={[4, 4, 0, 0]}>
                          {result.chartData.map((entry, i) => (
                            <Cell key={i} fill={entry.strike === result.painPoint ? '#10B981' : 'var(--border)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* ── Formula Section ── */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-mono font-bold flex items-center gap-2">
              <Info className="h-4 w-4 text-emerald-500" />
              How Max Pain is Calculated
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="att-formula-block text-xs">
              For each Strike S:<br />
              Total Value = Σ max(0, S - K) × CE_OI + Σ max(0, K - S) × PE_OI<br /><br />
              Max Pain = Strike where Total Value is minimum
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The calculation assumes all options expire at each possible strike price. At the max pain strike, the combined intrinsic value of all calls and puts is at its lowest — meaning option buyers lose the most and option sellers (writers) lose the least.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-mono font-bold">Frequently Asked Questions</CardTitle>
          </CardHeader>
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
