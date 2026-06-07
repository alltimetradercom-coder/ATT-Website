'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatIndianNumber } from '@/lib/store'
import { ArrowDown, RotateCcw, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'

export function SwpCalculator() {
  const [totalCorpus, setTotalCorpus] = useState('10000000')
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState('50000')
  const [annualReturn, setAnnualReturn] = useState('8')
  const [period, setPeriod] = useState('20')
  const [showFaq, setShowFaq] = useState<number | null>(null)

  const resetAll = () => {
    setTotalCorpus('10000000'); setMonthlyWithdrawal('50000'); setAnnualReturn('8'); setPeriod('20')
  }

  const result = useMemo(() => {
    const corpus = parseFloat(totalCorpus) || 0
    const withdrawal = parseFloat(monthlyWithdrawal) || 0
    const rate = (parseFloat(annualReturn) || 0) / 100 / 12
    const years = parseFloat(period) || 0
    const months = Math.round(years * 12)

    if (corpus <= 0 || withdrawal <= 0 || months <= 0) return null

    let balance = corpus
    let totalWithdrawn = 0
    let depletionMonth: number | null = null
    const chartData = [{ month: 0, balance: Math.round(corpus), withdrawn: 0 }]

    const yearByYear: { year: number; startBalance: number; yearlyWithdrawal: number; yearlyReturn: number; endBalance: number }[] = []
    let yearStartBalance = corpus
    let yearWithdrawal = 0
    let yearReturn = 0

    for (let m = 1; m <= months; m++) {
      const monthReturn = balance * rate
      yearReturn += monthReturn
      balance = balance + monthReturn - withdrawal
      totalWithdrawn += withdrawal
      yearWithdrawal += withdrawal

      if (balance < 0) {
        balance = 0
        if (depletionMonth === null) depletionMonth = m
      }

      chartData.push({
        month: m,
        balance: Math.round(Math.max(0, balance)),
        withdrawn: Math.round(totalWithdrawn),
      })

      if (m % 12 === 0 || m === months) {
        yearByYear.push({
          year: Math.ceil(m / 12),
          startBalance: Math.round(yearStartBalance),
          yearlyWithdrawal: Math.round(yearWithdrawal),
          yearlyReturn: Math.round(yearReturn),
          endBalance: Math.round(Math.max(0, balance)),
        })
        yearStartBalance = Math.max(0, balance)
        yearWithdrawal = 0
        yearReturn = 0
      }

      if (balance <= 0) break
    }

    const remainingCorpus = Math.round(Math.max(0, balance))

    return { totalWithdrawn: Math.round(totalWithdrawn), remainingCorpus, depletionMonth, chartData, yearByYear }
  }, [totalCorpus, monthlyWithdrawal, annualReturn, period])

  const faqs = [
    { q: 'What is SWP (Systematic Withdrawal Plan)?', a: 'SWP allows you to withdraw a fixed amount from your mutual fund or investment at regular intervals (usually monthly). It\'s the opposite of SIP — instead of investing regularly, you withdraw regularly. SWP is popular among retirees in India who need monthly income from their accumulated corpus. The remaining investment continues to earn returns, potentially extending the life of your corpus.' },
    { q: 'How much should I withdraw monthly?', a: 'A common rule is the 4% rule — withdraw 4% of your corpus annually. For ₹1 Crore corpus, that\'s ₹4 Lakh/year or ~₹33,333/month. However, for Indian conditions with higher inflation (5-7%), consider 3-3.5% annually for longer corpus life. Adjust based on: your monthly expenses, other income sources (rent, pension, FD interest), and expected return on investment.' },
    { q: 'What happens if the corpus depletes?', a: 'If your withdrawal rate exceeds the return rate, your corpus will eventually deplete to zero. The calculator shows when this happens. To extend corpus life: (1) Reduce monthly withdrawal, (2) Move to higher-return investments (equity-oriented hybrid funds), (3) Add a step-down SWP (reduce withdrawal over time), or (4) Start with a larger corpus.' },
    { q: 'SWP vs Dividend — which is better?', a: 'SWP is generally more tax-efficient and predictable than dividend options in India. Dividends are taxable at your slab rate, and dividend amounts varies. SWP gives you: (1) Fixed monthly income, (2) Better tax planning (only capital gains portion is taxed), (3) Control over withdrawal amount, (4) Potential for higher post-tax returns. For retirees, SWP from equity-oriented hybrid funds is often the most tax-efficient strategy.' },
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
                LIVE CALCULATOR · Retirement Planning
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Plan Your{' '}
                <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Systematic Withdrawal</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                Simulate your SWP strategy. See how long your corpus lasts, track remaining balance, and plan for a secure retirement.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={() => { const el = document.getElementById('swp-inputs'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                  <ArrowDown className="h-4 w-4" /> Calculate Now
                </button>
                <button onClick={resetAll} className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-5 py-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <RotateCcw className="h-4 w-4 text-primary" /> Reset
                </button>
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-3 shrink-0">
              {[
                { val: '4%', label: 'Safe Withdrawal Rule', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { val: '₹/Mo', label: 'Monthly Income Plan', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { val: 'Yrs', label: 'Corpus Life Tracker', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
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
      <section id="swp-inputs" className="grid lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/50 via-primary/50 to-amber-500/50" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-mono font-bold">
                <ArrowDown className="h-5 w-5 text-emerald-500" /> SWP Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Total Corpus (₹)</Label>
                <Input type="number" placeholder="10000000" value={totalCorpus} onChange={(e) => setTotalCorpus(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Monthly Withdrawal (₹)</Label>
                <Input type="number" placeholder="50000" value={monthlyWithdrawal} onChange={(e) => setMonthlyWithdrawal(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Expected Annual Return (%)</Label>
                <Input type="number" placeholder="8" value={annualReturn} onChange={(e) => setAnnualReturn(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Withdrawal Period (years)</Label>
                <Input type="number" placeholder="20" value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
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
              <div className="grid grid-cols-3 gap-3">
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Total Withdrawn</div>
                  <div className="font-mono font-bold text-lg">{formatCurrency(result.totalWithdrawn)}</div>
                </div>
                <div className="att-result-card rounded-xl border border-primary/30 bg-card p-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Remaining Corpus</div>
                  <div className="font-mono font-bold text-lg text-primary">{formatCurrency(result.remainingCorpus)}</div>
                </div>
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Fund Depletes</div>
                  <div className="font-mono font-bold text-lg text-[var(--att-gold)]">
                    {result.depletionMonth ? `Year ${(result.depletionMonth / 12).toFixed(1)}` : 'Never ✓'}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <Card className="border-border/50 bg-card/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono font-bold">Corpus Balance Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.chartData.filter((_, i) => i % 3 === 0 || i === result.chartData.length - 1)}>
                        <defs>
                          <linearGradient id="swpGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--att-chart-grid)" />
                        <XAxis dataKey="month" tick={{ fill: 'var(--att-chart-tick)', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={(v) => `Y${(v / 12).toFixed(0)}`} />
                        <YAxis tick={{ fill: 'var(--att-chart-tick)', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={(v) => '₹' + (v >= 10000000 ? (v/10000000).toFixed(1)+'Cr' : v >= 100000 ? (v/100000).toFixed(0)+'L' : v >= 1000 ? (v/1000).toFixed(0)+'K' : String(v))} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--att-chart-tooltip-bg)', border: '1px solid var(--att-chart-tooltip-border)', borderRadius: '8px' }} formatter={(value: number, name: string) => [formatCurrency(value), name === 'balance' ? 'Balance' : 'Total Withdrawn']} labelFormatter={(label) => `Year ${(Number(label) / 12).toFixed(1)}`} />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                        <Area type="monotone" dataKey="balance" stroke="#10B981" fill="url(#swpGrad)" strokeWidth={2} />
                      </AreaChart>
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
                  <div className="overflow-x-auto max-h-80 overflow-y-auto">
                    <table className="w-full text-xs font-mono">
                      <thead className="bg-muted/10 border-b border-border/50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-muted-foreground font-bold">Year</th>
                          <th className="px-4 py-2 text-right text-muted-foreground font-bold">Start Balance</th>
                          <th className="px-4 py-2 text-right text-muted-foreground font-bold">Withdrawn</th>
                          <th className="px-4 py-2 text-right text-muted-foreground font-bold">Returns</th>
                          <th className="px-4 py-2 text-right text-muted-foreground font-bold">End Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearByYear.map((row) => (
                          <tr key={row.year} className="border-b border-border/10 hover:bg-muted/5">
                            <td className="px-4 py-2 text-muted-foreground">Year {row.year}</td>
                            <td className="px-4 py-2 text-right font-bold">{formatCurrency(row.startBalance)}</td>
                            <td className="px-4 py-2 text-right text-red-400">{formatCurrency(row.yearlyWithdrawal)}</td>
                            <td className="px-4 py-2 text-right text-emerald-500">+{formatCurrency(row.yearlyReturn)}</td>
                            <td className="px-4 py-2 text-right font-bold">{formatCurrency(row.endBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Formula */}
              <div className="att-formula-block text-xs">
                Monthly: Balance = Balance × (1 + r/12) - Withdrawal<br />
                Where r = Annual Return Rate, repeated for each month<br />
                Corpus depletes when Balance ≤ 0
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader><CardTitle className="text-sm font-mono font-bold flex items-center gap-2"><Info className="h-4 w-4 text-emerald-500" /> SWP Strategy</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              SWP works best when your corpus is invested in a balanced or equity-oriented hybrid fund that can generate 8-12% annual returns while you withdraw 4-6% annually. The gap between returns and withdrawal rate determines how long your corpus will last.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For Indian retirees, a popular strategy is: Keep 3-5 years of expenses in liquid/short-duration funds, and the rest in equity-oriented hybrid funds. Withdraw from the debt portion first, allowing equity to grow.
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
