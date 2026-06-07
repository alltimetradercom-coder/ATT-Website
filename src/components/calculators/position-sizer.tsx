'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatIndianNumber, formatPercent } from '@/lib/store'
import { Scale, RotateCcw, Info, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'

export function PositionSizerCalculator() {
  const [accountSize, setAccountSize] = useState('100000')
  const [riskPercent, setRiskPercent] = useState('2')
  const [entryPrice, setEntryPrice] = useState('500')
  const [stopLoss, setStopLoss] = useState('480')
  const [showFaq, setShowFaq] = useState<number | null>(null)

  const resetAll = () => {
    setAccountSize('100000')
    setRiskPercent('2')
    setEntryPrice('500')
    setStopLoss('480')
  }

  const result = useMemo(() => {
    const account = parseFloat(accountSize) || 0
    const risk = parseFloat(riskPercent) || 0
    const entry = parseFloat(entryPrice) || 0
    const sl = parseFloat(stopLoss) || 0

    if (entry === 0 || sl === 0 || entry === sl) return null

    const riskAmount = account * (risk / 100)
    const riskPerShare = Math.abs(entry - sl)
    const positionSize = Math.floor(riskAmount / riskPerShare)
    const positionValue = positionSize * entry
    const riskRewardAvailable = entry > sl

    return { riskAmount, positionSize, positionValue, riskPerShare, riskRewardAvailable, accountPctRisked: risk }
  }, [accountSize, riskPercent, entryPrice, stopLoss])

  const faqs = [
    {
      q: 'What is Position Sizing?',
      a: 'Position sizing determines how many shares or contracts to buy based on your risk tolerance. Instead of buying arbitrary quantities, you calculate the optimal size so that if your stop-loss hits, you only lose a predefined percentage of your total capital. This is the single most important risk management tool for traders.'
    },
    {
      q: 'Why should I risk only 1-2% per trade?',
      a: 'Professional traders risk 1-2% of their capital per trade. If you risk 2% and have 10 consecutive losses, you\'re down only 18.3% — recoverable. If you risk 10% per trade, 10 consecutive losses would wipe out 65% of your capital, requiring a 186% gain just to break even. Small, controlled risk per trade ensures survival through losing streaks.'
    },
    {
      q: 'What if the position size is too small?',
      a: 'If the calculated position size is less than 1 share, your stop-loss is too wide relative to your account size and risk tolerance. Options: (1) Tighten your stop-loss, (2) Increase your account size, (3) Accept higher risk percentage, or (4) Skip the trade. Never widen your stop just to take a larger position.'
    },
    {
      q: 'How does this work for F&O lots?',
      a: 'For F&O, calculate the risk per lot instead of per share. Example: NIFTY lot size = 25, Entry = 22000, SL = 21950. Risk per lot = 25 × 50 = ₹1,250. If your risk amount is ₹2,000, you can take 1 lot (₹1,250 risk). If risk amount is ₹5,000, you can take 4 lots. Always round DOWN to whole lots.'
    },
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
                LIVE CALCULATOR · Risk Management
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Size Your{' '}
                <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Positions Smartly</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                Never risk more than you can afford. Calculate the exact number of shares to buy based on your account size, risk tolerance, and stop-loss level.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={() => { const el = document.getElementById('sizer-inputs'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                  <Scale className="h-4 w-4" /> Calculate Now
                </button>
                <button onClick={resetAll} className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-5 py-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <RotateCcw className="h-4 w-4 text-primary" /> Reset
                </button>
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-3 shrink-0">
              {[
                { val: '1-2%', label: 'Pro Risk Per Trade', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { val: '₹ Risk', label: 'Fixed Risk Amount', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { val: 'SL', label: 'Stop-Loss Based', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
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
      <section id="sizer-inputs" className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Left: Inputs */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/50 via-primary/50 to-amber-500/50" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-mono font-bold">
                <Scale className="h-5 w-5 text-emerald-500" />
                Position Sizing Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Account Size (₹)</Label>
                <Input type="number" placeholder="100000" value={accountSize} onChange={(e) => setAccountSize(e.target.value)} className="bg-background/50 border-border/50 text-sm font-bold font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Risk Per Trade (%)</Label>
                <Input type="number" placeholder="2" value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)} className="bg-background/50 border-border/50 text-sm font-bold font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Entry Price (₹)</Label>
                <Input type="number" placeholder="500" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} className="bg-background/50 border-border/50 text-sm font-bold font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Stop Loss Price (₹)</Label>
                <Input type="number" placeholder="480" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="bg-background/50 border-border/50 text-sm font-bold font-mono" />
              </div>
              <Button variant="outline" onClick={resetAll} className="w-full gap-1 text-xs font-mono">
                <RotateCcw className="h-3.5 w-3.5" /> Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-3 space-y-4">
          {result && (
            <>
              {/* Position Size Card */}
              <div className="att-result-card rounded-xl border border-primary/30 bg-card p-6 text-center">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Recommended Position Size</p>
                <p className="text-4xl font-bold text-primary font-mono">{formatIndianNumber(result.positionSize).split('.')[0]} shares</p>
                <p className="text-xs text-muted-foreground mt-2">Based on {result.accountPctRisked}% risk on ₹{formatIndianNumber(parseFloat(accountSize) || 0).split('.')[0]} account</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="att-result-card rounded-xl border border-red-500/20 bg-card p-4">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Max Risk Amount</div>
                  <div className="font-mono font-bold text-xl text-red-400">{formatCurrency(result.riskAmount)}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Maximum loss if SL hits</p>
                </div>
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Position Value</div>
                  <div className="font-mono font-bold text-xl">{formatCurrency(result.positionValue)}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Total capital deployed</p>
                </div>
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Risk Per Share</div>
                  <div className="font-mono font-bold text-xl">{formatCurrency(result.riskPerShare)}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Entry - Stop Loss</p>
                </div>
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Account % at Risk</div>
                  <div className="font-mono font-bold text-xl text-[var(--att-gold)]">{result.accountPctRisked}%</div>
                  <p className="text-[10px] text-muted-foreground mt-1">{result.accountPctRisked <= 2 ? '✅ Within safe limits' : '⚠️ High risk — pros use 1-2%'}</p>
                </div>
              </div>

              {/* Warning if high risk */}
              {result.accountPctRisked > 2 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-500">High Risk Alert</p>
                    <p className="text-xs text-muted-foreground">Professional traders recommend risking only 1-2% per trade. At {result.accountPctRisked}%, a streak of losses could significantly damage your account. Consider reducing position size or tightening your stop-loss.</p>
                  </div>
                </div>
              )}

              {/* Formula */}
              <div className="att-formula-block">
                Position Size = Risk Amount ÷ Risk Per Share<br />
                = {formatCurrency(result.riskAmount)} ÷ {formatCurrency(result.riskPerShare)} = {formatIndianNumber(result.positionSize).split('.')[0]} shares
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
              <Info className="h-4 w-4 text-emerald-500" />
              Position Sizing Formula
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="att-formula-block text-xs">
              Position Size = (Account × Risk%) ÷ |Entry - StopLoss|<br /><br />
              Risk Amount = Account × Risk%<br />
              Risk Per Share = |Entry Price - Stop Loss|<br />
              Position Value = Position Size × Entry Price
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This is the standard fixed-fractional position sizing method used by professional traders worldwide. It ensures that no single trade can destroy your account, even through a series of consecutive losses.
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
