'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatIndianNumber, formatPercent } from '@/lib/store'
import { 
  TrendingUp, 
  Calculator, 
  ShieldAlert, 
  Scale, 
  Coins, 
  Info, 
  HelpCircle,
  Lightbulb,
  ArrowUpRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Percent,
  Play,
  Share2
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts'
import { useToast } from '@/hooks/use-toast'

interface YearlyData {
  year: number
  invested: number
  value: number
  returns: number
  inflationAdjusted: number
}

export function SipCalculator() {
  const { toast } = useToast()
  
  // States matching user configuration
  const [sipAmount, setSipAmount] = useState<number>(10000)
  const [returnRate, setReturnRate] = useState<number>(12)
  const [timePeriod, setTimePeriod] = useState<number>(15)
  const [inflationRate, setInflationRate] = useState<number>(6)
  const [stepUpRate, setStepUpRate] = useState<number>(0)
  const [replayKey, setReplayKey] = useState<number>(0)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculations
  const calculatedData = useMemo(() => {
    const P = sipAmount
    const annualRate = returnRate
    const years = timePeriod
    const inflation = inflationRate
    const stepUp = stepUpRate

    const r = annualRate / 12 / 100 // monthly rate
    const infR = inflation / 100
    const yearlyData: YearlyData[] = []
    let totalInvested = 0

    // Build array of SIP amounts per year (for step-up)
    const sipPerYear: number[] = []
    let currentSIP = P
    for (let yy = 0; yy < years; yy++) {
      sipPerYear.push(currentSIP)
      currentSIP = currentSIP * (1 + stepUp / 100)
    }

    for (let y = 1; y <= years; y++) {
      // Total invested up to year y
      let invSoFar = 0
      for (let k = 0; k < y; k++) {
        invSoFar += sipPerYear[k] * 12
      }
      totalInvested = invSoFar

      // FV: each year's 12 SIPs, compounded for remaining months
      let fv = 0
      for (let yy2 = 1; yy2 <= y; yy2++) {
        const thisYearSIP = sipPerYear[yy2 - 1]
        // FV of year's SIP at end of that year
        let fvEndOfYear = thisYearSIP * ((Math.pow(1 + r, 12) - 1) / r) * (1 + r)
        // Compound forward for remaining years
        const extraMonths = (y - yy2) * 12
        if (extraMonths > 0) {
          fvEndOfYear = fvEndOfYear * Math.pow(1 + r, extraMonths)
        }
        fv += fvEndOfYear
      }

      const inflationAdj = fv / Math.pow(1 + infR, y)
      yearlyData.push({
        year: y,
        invested: Math.round(totalInvested),
        value: Math.round(fv),
        returns: Math.round(Math.max(0, fv - totalInvested)),
        inflationAdjusted: Math.round(inflationAdj)
      })
    }

    const final = yearlyData[yearlyData.length - 1] || { invested: 0, value: 0, returns: 0, inflationAdjusted: 0 }
    
    return {
      totalInvested: final.invested,
      futureValue: final.value,
      totalReturns: final.returns,
      inflationAdjusted: final.inflationAdjusted,
      yearlyData
    }
  }, [sipAmount, returnRate, timePeriod, inflationRate, stepUpRate])

  // Power of Time Scenarios Comparison
  const powerScenarios = useMemo(() => {
    const P = 10000
    const rate = 12
    const r = rate / 12 / 100
    const yearsArray = [5, 15, 25]

    return yearsArray.map(yr => {
      const n = yr * 12
      const invested = P * n
      const fv = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
      const returns = fv - invested
      const mult = (fv / invested).toFixed(2)
      return {
        years: yr,
        invested,
        futureValue: fv,
        returns,
        multiplier: mult
      }
    })
  }, [])

  const triggerAnimationReplay = () => {
    setReplayKey(prev => prev + 1)
    toast({
      title: "Animation Replayed",
      description: "Compounding year-by-year progress bars animated.",
    })
  }

  // Color mappings
  const colors = {
    invested: '#10B981', // emerald-500
    returns: '#F59E0B',  // amber-500
    inflation: '#EF4444', // red-500
    pieColors: ['#10B981', '#F59E0B']
  }

  return (
    <div className="space-y-10">

      {/* ── Premium SIP Compounding Hero ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl">
        {/* bg glows */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 80% at 0% 50%, rgba(16,185,129,0.10) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 100% 80%, rgba(139,92,246,0.07) 0%, transparent 60%)' }} />
        {/* animated grid */}
        <div className="hero-grid absolute inset-0 opacity-40" />
        {/* top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/60 via-primary/40 to-violet-500/40" />

        <div className="relative px-6 sm:px-10 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

            {/* LEFT: copy */}
            <div className="max-w-xl">
              {/* badge */}
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                LIVE CALCULATOR · Step-Up Compounding Simulator
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Simulate Your{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 60%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Compounded Wealth
                </span>
              </h2>

              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                Standard calculations aren&apos;t enough. Model expected inflation, annual step-up multipliers, and early-start gains to plan your financial independence path with ultimate accuracy.
              </p>

              {/* CTA strip */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    const el = document.getElementById('sip-inputs')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all duration-200 cursor-pointer"
                >
                  <Calculator className="h-4 w-4" />
                  Calculate Now
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('sip-faq')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-5 py-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                >
                  <Coins className="h-4 w-4 text-primary" />
                  Learn First
                </button>
              </div>
            </div>

            {/* RIGHT: floating stat bubbles */}
            <div className="hidden sm:flex flex-col gap-3 shrink-0">
              {[
                { val: '12%',    label: 'Benchmark Return Rate',   color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { val: 'Step-Up', label: 'Compounding Multiplier',  color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { val: 'Real',    label: 'Inflation-Adjusted Curves', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              ].map(({ val, label, color, bg }) => (
                <div key={label} className={`flex items-center gap-3 rounded-xl border ${bg} px-4 py-2.5 backdrop-blur-sm`}>
                  <span className={`text-lg font-black font-mono ${color}`}>{val}</span>
                  <span className="text-xs text-muted-foreground leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* bottom stats (mobile-visible) */}
          <div className="mt-5 sm:hidden flex flex-wrap gap-4 border-t border-border/40 pt-4">
            {[
              { val: '12%', label: 'Benchmark', color: 'text-primary' },
              { val: 'Step-Up',  label: 'Multiplier',   color: 'text-amber-400' },
              { val: 'Real', label: 'Inflation-Adj',   color: 'text-violet-400' },
            ].map(({ val, label, color }) => (
              <div key={label} className="flex flex-col">
                <span className="text-base font-black font-mono text-primary">{val}</span>
                <span className="text-[11px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* SECTION 1: Dynamic Interactive Calculator Layout */}
      <div id="sip-inputs" className="grid lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Inputs Column (2/5) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/50 via-primary/50 to-amber-500/50"></div>
            
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-mono font-bold tracking-tight">
                <Calculator className="h-5 w-5 text-emerald-500 animate-pulse" />
                SIP Simulator
              </CardTitle>
              <CardDescription className="text-xs">
                Configure parameters to compound your wealth
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              
              {/* Monthly Investment */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                    Monthly Investment
                  </Label>
                  <div className="flex items-center rounded-lg border border-border/50 bg-background/50 overflow-hidden">
                    <button 
                      onClick={() => setSipAmount(prev => Math.max(500, prev - 500))} 
                      className="px-2.5 py-1 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                    >
                      -500
                    </button>
                    <Input 
                      type="number" 
                      min={500}
                      max={2000000}
                      value={sipAmount}
                      onChange={e => setSipAmount(Math.max(500, Number(e.target.value)))}
                      className="w-24 text-center text-xs font-bold h-7 py-0 border-0 bg-transparent rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 font-mono"
                    />
                    <button 
                      onClick={() => setSipAmount(prev => Math.min(2000000, prev + 500))} 
                      className="px-2.5 py-1 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                    >
                      +500
                    </button>
                  </div>
                </div>
                <input 
                  type="range" 
                  min={500} 
                  max={200000} 
                  step={500}
                  value={sipAmount} 
                  onChange={e => setSipAmount(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-muted/30 accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>₹500</span>
                  <span>₹2,00,000</span>
                </div>
              </div>

              {/* Expected Return Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                    Expected Returns Rate (p.a.)
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input 
                      type="number" 
                      min={1}
                      max={30}
                      step={0.5}
                      value={returnRate}
                      onChange={e => setReturnRate(Math.min(30, Math.max(1, Number(e.target.value))))}
                      className="w-16 text-center text-xs font-bold h-7 py-0 bg-background/50 border-border/50 font-mono"
                    />
                    <span className="text-xs font-mono font-bold text-emerald-500">%</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={30} 
                  step={0.5}
                  value={returnRate} 
                  onChange={e => setReturnRate(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-muted/30 accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>1%</span>
                  <span>30%</span>
                </div>
              </div>

              {/* Time Period */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                    Investment Period
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input 
                      type="number" 
                      min={1}
                      max={40}
                      step={1}
                      value={timePeriod}
                      onChange={e => setTimePeriod(Math.min(40, Math.max(1, Number(e.target.value))))}
                      className="w-16 text-center text-xs font-bold h-7 py-0 bg-background/50 border-border/50 font-mono"
                    />
                    <span className="text-xs font-mono font-bold text-emerald-500">Yrs</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={40} 
                  step={1}
                  value={timePeriod} 
                  onChange={e => setTimePeriod(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-muted/30 accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>1 Yr</span>
                  <span>40 Yrs</span>
                </div>
              </div>

              {/* Inflation Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                    Expected Inflation Rate (p.a.)
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input 
                      type="number" 
                      min={0}
                      max={15}
                      step={0.5}
                      value={inflationRate}
                      onChange={e => setInflationRate(Math.min(15, Math.max(0, Number(e.target.value))))}
                      className="w-16 text-center text-xs font-bold h-7 py-0 bg-background/50 border-border/50 font-mono"
                    />
                    <span className="text-xs font-mono font-bold text-emerald-500">%</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={15} 
                  step={0.5}
                  value={inflationRate} 
                  onChange={e => setInflationRate(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-muted/30 accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>0% (No Inflation)</span>
                  <span>15%</span>
                </div>
              </div>

              {/* Step-Up Rate */}
              <div className="p-4 rounded-xl border border-border bg-emerald-500/5 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-xs font-mono font-bold tracking-wider text-foreground block">
                      Annual Step-Up SIP
                    </Label>
                    <span className="text-[10px] text-muted-foreground block">Increase SIP amount each year</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input 
                      type="number" 
                      min={0}
                      max={50}
                      step={1}
                      value={stepUpRate}
                      onChange={e => setStepUpRate(Math.min(50, Math.max(0, Number(e.target.value))))}
                      className="w-16 text-center text-xs font-bold h-7 py-0 bg-background/50 border-border/50 font-mono"
                    />
                    <span className="text-xs font-mono font-bold text-emerald-500">%</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={50} 
                  step={1}
                  value={stepUpRate} 
                  onChange={e => setStepUpRate(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-muted/20 accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>Flat SIP (0%)</span>
                  <span>50% Step-Up</span>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Live Results Column (3/5) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Summary metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border bg-card/30 backdrop-blur-md text-center py-4 relative group hover:scale-[1.02] transition-transform">
              <CardContent className="p-0">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Total Invested</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-500 font-mono">
                  {formatCurrency(calculatedData.totalInvested)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/30 backdrop-blur-md text-center py-4 relative group hover:scale-[1.02] transition-transform">
              <CardContent className="p-0">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Estimated Returns</p>
                <p className="text-xl sm:text-2xl font-black text-amber-500 font-mono animate-shimmer bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-[length:200%_auto] bg-clip-text text-transparent">
                  {formatCurrency(calculatedData.totalReturns)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/30 backdrop-blur-md text-center py-4 relative group hover:scale-[1.02] transition-transform">
              <CardContent className="p-0">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Total Corpus Value</p>
                <p className="text-xl sm:text-2xl font-black text-primary font-mono">
                  {formatCurrency(calculatedData.futureValue)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Inflation adjustment callout card */}
          <Card className="border-red-500/20 bg-red-500/5 relative overflow-hidden group">
            <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Inflation-Adjusted Purchasing Power
                </div>
                <div className="text-lg font-black text-foreground font-mono">
                  {formatCurrency(calculatedData.inflationAdjusted)}
                </div>
                <p className="text-xs text-muted-foreground">
                  The actual value of your corpus evaluated in today&apos;s purchasing power at {inflationRate}% inflation.
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                <Scale className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>

          {/* Interactive Recharts Visualization Card */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono font-bold">Growth Visualizer</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 grid sm:grid-cols-5 gap-6">
              
              {/* Line Area Chart (3/5) */}
              <div className="sm:col-span-3 space-y-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">Wealth Over Time</span>
                <div className="h-[220px] w-full">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={calculatedData.yearlyData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.returns} stopOpacity={0.25}/>
                            <stop offset="95%" stopColor={colors.returns} stopOpacity={0.02}/>
                          </linearGradient>
                          <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.invested} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={colors.invested} stopOpacity={0.01}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                          dataKey="year" 
                          tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }} 
                          tickFormatter={(v) => `Yr ${v}`} 
                        />
                        <YAxis 
                          tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }} 
                          tickFormatter={(v) => v >= 10000000 ? `${(v/10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v/100000).toFixed(0)}L` : `${v/1000}K`}
                        />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#0d0e12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}
                          itemStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                          formatter={(value: number) => [formatCurrency(value), '']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          name="Corpus Value" 
                          stroke={colors.returns} 
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="invested" 
                          name="Total Invested" 
                          stroke={colors.invested} 
                          fillOpacity={1} 
                          fill="url(#colorInvested)" 
                          strokeWidth={1.5}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="inflationAdjusted" 
                          name="Inflation-Adj" 
                          stroke={colors.inflation} 
                          strokeWidth={1.5} 
                          strokeDasharray="4 4"
                          fill="none"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full bg-muted/10 animate-pulse rounded-lg flex items-center justify-center text-xs text-muted-foreground font-mono">
                      Loading visualizer...
                    </div>
                  )}
                </div>
              </div>

              {/* Doughnut Chart (2/5) */}
              <div className="sm:col-span-2 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">Portfolio Ratio</span>
                  <div className="h-[170px] w-full flex items-center justify-center">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Invested', value: calculatedData.totalInvested },
                              { name: 'Returns', value: Math.max(0, calculatedData.totalReturns) }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            <Cell fill={colors.invested} />
                            <Cell fill={colors.returns} />
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#0d0e12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                            formatter={(value: number) => [formatCurrency(value), '']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full bg-muted/10 animate-pulse rounded-full flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                        Loading ratio...
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.invested }}></span>
                      Invested
                    </span>
                    <span className="font-bold text-foreground">
                      {((calculatedData.totalInvested / calculatedData.futureValue) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.returns }}></span>
                      Returns
                    </span>
                    <span className="font-bold text-foreground">
                      {((Math.max(0, calculatedData.totalReturns) / calculatedData.futureValue) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      </div>

      {/* SECTION 2: How Compounding Works - Year-by-Year breakdown bars with Framer Motion */}
      <Card className="border-border bg-card/30 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-base font-mono font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Compounding Progression Breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground">Visualizing how your returns snowball to generate more wealth</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={triggerAnimationReplay}
            className="border-border/50 hover:bg-emerald-500/10 text-xs font-mono font-bold gap-1 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Replay Progress Bars
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3 font-mono">
            <AnimatePresence mode="wait">
              {calculatedData.yearlyData.filter(d => d.year <= 5 || d.year % 5 === 0 || d.year === timePeriod).map((d) => {
                const maxVal = calculatedData.futureValue || 1
                const invPct = (d.invested / maxVal) * 100
                const retPct = (d.returns / maxVal) * 100

                return (
                  <div key={`${replayKey}-${d.year}`} className="flex items-center gap-3">
                    <div className="w-12 text-right text-xs font-bold text-muted-foreground">Yr {d.year}</div>
                    
                    <div className="flex-1 h-8 rounded-lg bg-border/20 border border-border/10 relative overflow-hidden flex">
                      {/* Invested bar */}
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${invPct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-emerald-500/70 border-r border-emerald-400/20"
                      />
                      
                      {/* Returns bar */}
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${retPct}%` }}
                        transition={{ duration: 1.0, delay: 0.2, ease: "easeOut" }}
                        className="h-full bg-amber-500/70"
                      />
                    </div>
                    
                    <div className="w-24 text-right text-xs font-bold text-amber-500 font-mono shrink-0">
                      {formatCurrency(d.value)}
                    </div>
                  </div>
                )
              })}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-6 rounded bg-emerald-500/70 inline-block"></span>
              Invested Amount
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-6 rounded bg-amber-500/70 inline-block"></span>
              Returns (Growth)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: SIP Compound Formula & Mathematical Example */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Math & Future Value Math */}
        <Card className="border-border bg-card/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-mono font-bold">The SIP Compounding Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl text-center bg-background/50 border border-border/50 font-mono text-sm font-bold text-foreground">
              FV = P &times; [((1 + r)<sup>n</sup> &minus; 1) / r] &times; (1 + r)
            </div>
            <div className="space-y-2 text-xs font-mono text-muted-foreground leading-relaxed">
              <p><strong className="text-foreground">FV</strong> = Future Value of your compounded SIP</p>
              <p><strong className="text-foreground">P</strong> = Monthly investment amount (regular annuity)</p>
              <p><strong className="text-foreground">r</strong> = Monthly rate of return (annual return divided by 12 / 100)</p>
              <p><strong className="text-foreground">n</strong> = Total number of months (years &times; 12)</p>
            </div>
            <p className="text-xs text-muted-foreground border-t border-border/50 pt-3">
              Unlike a standard lump sum compound model, an SIP compounded formula works as a monthly annuity. Each monthly payment is invested sequentially, accumulating compounding cycles based on how long each specific payment remains active in the fund.
            </p>
          </CardContent>
        </Card>

        {/* Dynamic Calculation Example */}
        <Card className="border-border bg-card/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-mono font-bold">Case Study: compounding in action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground font-mono">
              Investing <strong className="text-foreground">₹{formatIndianNumber(sipAmount)}/month</strong> at <strong className="text-foreground">{returnRate}% p.a.</strong> over <strong className="text-foreground">{timePeriod} years</strong>:
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 rounded bg-background/30 border border-border/10">
                <span className="text-muted-foreground">Monthly Interest Rate (r)</span>
                <span className="font-bold">{returnRate}% / 12 = {(returnRate / 12).toFixed(3)}%</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-background/30 border border-border/10">
                <span className="text-muted-foreground">Total Compounding Intervals (n)</span>
                <span className="font-bold">{timePeriod * 12} months</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-background/30 border border-border/10">
                <span className="text-muted-foreground">Principal Invested</span>
                <span className="font-bold text-emerald-500">{formatCurrency(calculatedData.totalInvested)}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-background/30 border border-border/10">
                <span className="text-muted-foreground">Future Corpus Value</span>
                <span className="font-bold text-primary">{formatCurrency(calculatedData.futureValue)}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-primary/10 border border-primary/20">
                <span className="text-primary font-bold">Wealth Multiplier</span>
                <span className="font-extrabold text-primary">{(calculatedData.futureValue / calculatedData.totalInvested).toFixed(2)}x returns</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 4: Starting Early Comparison Panel */}
      <Card className="border-border bg-card/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-mono font-bold">The Advantage of Starting Early</CardTitle>
          <p className="text-xs text-muted-foreground">Same monthly deposit (₹10,000) at 12% p.a., showing the dramatic compounding multiplier over different horizons</p>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-6">
          {powerScenarios.map((sc, idx) => (
            <Card key={idx} className="border-border/50 bg-background/40 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500/30 to-amber-500/30"></div>
              <CardContent className="pt-6 text-center space-y-4">
                <h4 className="text-2xl font-black font-display text-emerald-500">{sc.years} Years</h4>
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Invested Amount</p>
                  <p className="text-sm font-bold text-foreground font-mono">{formatCurrency(sc.invested)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Total Corpus Value</p>
                  <p className="text-lg font-black text-amber-500 font-mono">{formatCurrency(sc.futureValue)}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-500">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {sc.multiplier}x returns
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* SECTION 5: Year-by-Year Table Grid */}
      <Card className="border-border bg-card/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-mono font-bold">Yearly Wealth Progression Schedule</CardTitle>
          <p className="text-xs text-muted-foreground">Granular year-by-year accumulation ledger detailing compounding and inflation adjustments</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-t border-border/50">
              <thead>
                <tr className="bg-muted/10 border-b border-border/50">
                  <th className="px-5 py-3 text-left font-bold uppercase tracking-wider text-muted-foreground">Year</th>
                  <th className="px-5 py-3 text-right font-bold uppercase tracking-wider text-muted-foreground">Invested Capital</th>
                  <th className="px-5 py-3 text-right font-bold uppercase tracking-wider text-muted-foreground">Corpus Value</th>
                  <th className="px-5 py-3 text-right font-bold uppercase tracking-wider text-muted-foreground">Total Returns</th>
                  <th className="px-5 py-3 text-right font-bold uppercase tracking-wider text-muted-foreground">Inflation-Adjusted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {calculatedData.yearlyData.map((d, i) => (
                  <tr key={d.year} className={`${i % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'} hover:bg-muted/10 transition-colors`}>
                    <td className="px-5 py-3.5 font-bold text-foreground">Year {d.year}</td>
                    <td className="px-5 py-3.5 text-right text-emerald-500 font-bold">{formatCurrency(d.invested)}</td>
                    <td className="px-5 py-3.5 text-right text-primary font-bold">{formatCurrency(d.value)}</td>
                    <td className="px-5 py-3.5 text-right text-amber-500 font-bold">{formatCurrency(d.returns)}</td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground">{formatCurrency(d.inflationAdjusted)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 6: SIP Educational Notes */}
      <Card className="border-border bg-card/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-mono font-bold">Important Notes for Indian SIP Investors</CardTitle>
          <p className="text-xs text-muted-foreground">Essential parameters and regulations governing Systematic Mutual Fund Investments</p>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Card className="border-border/50 bg-background/30 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Coins className="h-4 w-4 text-emerald-500" />
              </div>
              <h5 className="font-bold text-xs font-mono text-foreground uppercase tracking-wider">Rupee Cost Averaging</h5>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed leading-relaxed font-mono">
              SIPs automatically execute averaging. By purchasing mutual fund units regularly, you acquire fewer units when index prices are peak, and significantly more units during market dips. Over a full bull-bear cycle, this significantly reduces your cost-per-unit.
            </p>
          </Card>

          <Card className="border-border/50 bg-background/30 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Percent className="h-4 w-4 text-amber-500" />
              </div>
              <h5 className="font-bold text-xs font-mono text-foreground uppercase tracking-wider">Inflation Post-Tax returns</h5>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed leading-relaxed font-mono">
              With typical Indian inflation at 5–7%, beating inflation is paramount. A 12% nominal annual return translates into ~5.5% real purchasing return. Equities are generally the only liquid asset category that systematically outpaces inflation historically over decades.
            </p>
          </Card>

          <Card className="border-border/50 bg-background/30 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <ShieldAlert className="h-4 w-4 text-red-500" />
              </div>
              <h5 className="font-bold text-xs font-mono text-foreground uppercase tracking-wider">ELSS and Section 80C</h5>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed leading-relaxed font-mono">
              Equity Linked Savings Schemes (ELSS) allow tax deductions up to ₹1,50,000 annually under Section 80C of the Income Tax Act. They carry a 3-year lock-in period, which is the shortest among all tax-saving options in India.
            </p>
          </Card>

        </CardContent>
      </Card>

      {/* SECTION 7: SIP FAQs Accordion */}
      <Card id="sip-faq" className="border-border bg-card/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-mono font-bold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-emerald-500" />
            Frequently Asked Questions
          </CardTitle>
          <p className="text-xs text-muted-foreground">Get answers to the most common queries about Systematic Investment Plans</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50 border-t border-border/50">
            {[
              {
                q: "What is the difference between SIP and Lump Sum?",
                a: "An SIP allows you to invest a fixed amount regularly (monthly or weekly) into a mutual fund, leveraging Rupee Cost Averaging. A Lump Sum is a one-time capital investment. SIP is ideal for dynamic salaried earners, while Lump Sum suits investors with sudden cash windfalls."
              },
              {
                q: "What expected return rate should I assume for Nifty 50?",
                a: "Historically, the Indian benchmark Nifty 50 has yielded average annual returns ranging between 12% to 15% over long tenures (10+ years). For standard calculations, assuming 12% p.a. is considered a safe, balanced estimate for equity portfolios."
              },
              {
                q: "How does LTCG Tax affect my SIP corpus?",
                a: "Equity Mutual Funds held longer than 12 months incur Long Term Capital Gains (LTCG) tax. In India, LTCG gains exceeding ₹1.25 Lakh per financial year are taxed at 12.5%. Gains below this exemption threshold are completely tax-free."
              },
              {
                q: "Is an SIP guarantee to protect against stock market crashes?",
                a: "No, SIPs do not guarantee profit or shield against all market drawdowns. However, during market crashes, your SIP buys more units at highly discounted levels. When the index eventually recovers, your overall portfolio recovers substantially faster compared to a lump sum."
              }
            ].map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div key={idx} className="group">
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-xs font-mono font-bold text-foreground hover:bg-muted/10 transition-colors text-left"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-emerald-500" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed leading-relaxed font-mono">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
