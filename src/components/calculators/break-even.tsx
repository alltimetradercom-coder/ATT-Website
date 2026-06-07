'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatIndianNumber } from '@/lib/store'
import { Minus, RotateCcw, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Area, AreaChart } from 'recharts'

export function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState('500000')
  const [variableCostPerUnit, setVariableCostPerUnit] = useState('150')
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState('250')
  const [showFaq, setShowFaq] = useState<number | null>(null)

  const resetAll = () => {
    setFixedCosts('500000'); setVariableCostPerUnit('150'); setSellingPricePerUnit('250')
  }

  const result = useMemo(() => {
    const fc = parseFloat(fixedCosts) || 0
    const vc = parseFloat(variableCostPerUnit) || 0
    const sp = parseFloat(sellingPricePerUnit) || 0

    if (sp <= vc || sp === 0) return null

    const contributionMargin = sp - vc
    const contributionMarginPct = (contributionMargin / sp) * 100
    const breakEvenUnits = Math.ceil(fc / contributionMargin)
    const breakEvenRevenue = breakEvenUnits * sp

    // Generate chart data
    const maxUnits = breakEvenUnits * 2.5
    const step = Math.max(1, Math.round(maxUnits / 20))
    const chartData = []
    for (let units = 0; units <= maxUnits; units += step) {
      const revenue = units * sp
      const totalCost = fc + units * vc
      const profit = revenue - totalCost
      chartData.push({ units, revenue: Math.round(revenue), totalCost: Math.round(totalCost), profit: Math.round(profit) })
    }

    return { contributionMargin, contributionMarginPct, breakEvenUnits, breakEvenRevenue, chartData }
  }, [fixedCosts, variableCostPerUnit, sellingPricePerUnit])

  const faqs = [
    { q: 'What is Break-Even Analysis?', a: 'Break-even analysis determines the minimum number of units you need to sell to cover all costs. At the break-even point, total revenue equals total costs — you make zero profit and zero loss. Selling above break-even generates profit; below it, you incur losses. This is fundamental for any business, startup, or trading strategy.' },
    { q: 'What is Contribution Margin?', a: 'Contribution Margin = Selling Price - Variable Cost per Unit. It represents how much each unit sold contributes toward covering fixed costs and generating profit. If you sell at ₹250 and variable cost is ₹150, each unit contributes ₹100 toward fixed costs. Once fixed costs are covered, every additional unit sold adds ₹100 to profit. Contribution Margin % = CM/Selling Price × 100.' },
    { q: 'How do I reduce my break-even point?', a: 'Three ways: (1) Reduce Fixed Costs — negotiate lower rent, optimize salaries, cut unnecessary overhead. (2) Reduce Variable Costs — find cheaper suppliers, improve production efficiency, bulk purchasing. (3) Increase Selling Price — premium positioning, better branding, value-add features. Each 1% reduction in variable costs has a multiplier effect on break-even units.' },
    { q: 'What is Margin of Safety?', a: 'Margin of Safety = (Actual Sales - Break-Even Sales) / Actual Sales × 100. It tells you how much sales can drop before you start losing money. Example: If your actual revenue is ₹15L and break-even is ₹10L, your margin of safety is 33.3%. Higher margin of safety = lower risk. Businesses should target at least 20-30% margin of safety.' },
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
                LIVE CALCULATOR · Business Analysis
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Find Your{' '}
                <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Break-Even Point</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                Calculate how many units you need to sell to cover all costs. Visualize your profit zones and optimize your business strategy.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={() => { const el = document.getElementById('be-inputs'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                  <Minus className="h-4 w-4" /> Calculate Now
                </button>
                <button onClick={resetAll} className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-5 py-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <RotateCcw className="h-4 w-4 text-primary" /> Reset
                </button>
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-3 shrink-0">
              {[
                { val: 'FC', label: 'Fixed Cost Analysis', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { val: 'CM', label: 'Contribution Margin', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { val: 'MoS', label: 'Margin of Safety', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
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
      <section id="be-inputs" className="grid lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/50 via-primary/50 to-amber-500/50" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-mono font-bold">
                <Minus className="h-5 w-5 text-emerald-500" /> Break-Even Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Fixed Costs (₹)</Label>
                <Input type="number" placeholder="500000" value={fixedCosts} onChange={(e) => setFixedCosts(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                <p className="text-[10px] text-muted-foreground">Rent, salaries, insurance, etc. (one-time or monthly)</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Variable Cost Per Unit (₹)</Label>
                <Input type="number" placeholder="150" value={variableCostPerUnit} onChange={(e) => setVariableCostPerUnit(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                <p className="text-[10px] text-muted-foreground">Material, labor, packaging per unit</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Selling Price Per Unit (₹)</Label>
                <Input type="number" placeholder="250" value={sellingPricePerUnit} onChange={(e) => setSellingPricePerUnit(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                <p className="text-[10px] text-muted-foreground">Must be greater than variable cost</p>
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
              {/* Break-Even Units */}
              <div className="att-result-card rounded-xl border border-primary/30 bg-card p-6 text-center">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Break-Even Point</p>
                <p className="text-4xl font-bold text-primary font-mono">{formatIndianNumber(result.breakEvenUnits).split('.')[0]} units</p>
                <p className="text-xs text-muted-foreground mt-2">Sell this many units to cover all costs</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Break-Even Revenue</div>
                  <div className="font-mono font-bold text-lg">{formatCurrency(result.breakEvenRevenue)}</div>
                </div>
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Contribution Margin</div>
                  <div className="font-mono font-bold text-lg text-emerald-500">{formatCurrency(result.contributionMargin)}/unit</div>
                </div>
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">CM Ratio</div>
                  <div className="font-mono font-bold text-lg text-[var(--att-gold)]">{result.contributionMarginPct.toFixed(1)}%</div>
                </div>
              </div>

              {/* Chart */}
              <Card className="border-border/50 bg-card/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono font-bold">Break-Even Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.chartData}>
                        <defs>
                          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--att-chart-grid)" />
                        <XAxis dataKey="units" tick={{ fill: 'var(--att-chart-tick)', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={(v) => formatIndianNumber(v).split('.')[0]} />
                        <YAxis tick={{ fill: 'var(--att-chart-tick)', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={(v) => '₹' + (v >= 100000 ? (v/100000).toFixed(0)+'L' : v >= 1000 ? (v/1000).toFixed(0)+'K' : String(v))} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--att-chart-tooltip-bg)', border: '1px solid var(--att-chart-tooltip-border)', borderRadius: '8px' }} formatter={(value: number, name: string) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : name === 'totalCost' ? 'Total Cost' : 'Profit']} labelFormatter={(label) => `${formatIndianNumber(label).split('.')[0]} units`} />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                        <Area type="monotone" dataKey="profit" stroke="#10B981" fill="url(#profitGrad)" strokeWidth={1.5} />
                        <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="totalCost" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Formula */}
              <div className="att-formula-block text-xs">
                Break-Even Units = Fixed Costs ÷ (Selling Price - Variable Cost)<br />
                = {formatCurrency(parseFloat(fixedCosts) || 0)} ÷ ({formatCurrency(parseFloat(sellingPricePerUnit) || 0)} - {formatCurrency(parseFloat(variableCostPerUnit) || 0)})<br />
                = {formatCurrency(parseFloat(fixedCosts) || 0)} ÷ {formatCurrency(result.contributionMargin)} = {formatIndianNumber(result.breakEvenUnits).split('.')[0]} units
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader><CardTitle className="text-sm font-mono font-bold flex items-center gap-2"><Info className="h-4 w-4 text-emerald-500" /> Break-Even Formula</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="att-formula-block text-xs">
              Break-Even Units = Fixed Costs ÷ Contribution Margin<br />
              Break-Even Revenue = Break-Even Units × Selling Price<br />
              Contribution Margin = Selling Price - Variable Cost<br />
              CM Ratio = CM ÷ Selling Price × 100<br />
              Margin of Safety = (Actual - BE Revenue) ÷ Actual × 100
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The break-even point is where your total revenue exactly covers your total costs. Below this point, you&apos;re losing money. Above it, every unit sold adds to profit at the contribution margin rate.
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
