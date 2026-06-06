'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  BarController,
  LineController,
} from 'chart.js'
import dynamic from 'next/dynamic'
import {
  Plus, Trash2, Calculator, Bolt, ChartPie,
  Tag, FlaskConical, BookOpen, ChevronDown,
  Check, ChartBar, Layers,
} from 'lucide-react'

const Chart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Chart),
  { ssr: false }
)

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Filler, Tooltip, Legend,
  BarController, LineController
)

// ============================================================
// TYPES
// ============================================================
interface Lot {
  id: number
  shares: string
  price: string
  totalCost: number
  weight: number
}

interface CalcResult {
  totalShares: number
  totalCost: number
  averagePrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  marketValue: number
}

interface DcaResult {
  totalInvested: number
  avgCost: number
  finalValue: number
  returnPct: number
  monthLabels: string[]
  portfolioValues: number[]
  investedCumulative: number[]
}

// ============================================================
// FORMATTERS
// ============================================================
function fmtINR(val: number): string {
  if (isNaN(val) || val === null) return '₹0.00'
  const abs = Math.abs(val)
  let formatted: string
  if (abs >= 10000000) {
    formatted = (abs / 10000000).toFixed(2) + ' Cr'
  } else if (abs >= 100000) {
    formatted = (abs / 100000).toFixed(2) + ' L'
  } else {
    formatted = abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return (val < 0 ? '-' : '') + '₹' + formatted
}

function fmtINRShort(val: number): string {
  if (isNaN(val) || val === null) return '₹0'
  const abs = Math.abs(val)
  let formatted: string
  if (abs >= 10000000) {
    formatted = (abs / 10000000).toFixed(2) + ' Cr'
  } else if (abs >= 100000) {
    formatted = (abs / 100000).toFixed(2) + ' L'
  } else {
    formatted = abs.toLocaleString('en-IN', { maximumFractionDigits: 0 })
  }
  return (val < 0 ? '-' : '') + '₹' + formatted
}

function fmtNumber(val: number, dec = 2): string {
  return Number(val).toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function fmtPercent(val: number): string {
  const sign = val >= 0 ? '+' : ''
  return sign + fmtNumber(val, 2) + '%'
}

// ============================================================
// THEME-AWARE CHART COLORS
// ============================================================
function getChartColors(resolvedTheme: string) {
  const isDark = resolvedTheme === 'dark'
  return {
    gain: isDark ? '#00e676' : '#059669',
    gainBar: isDark ? 'rgba(0,230,118,0.5)' : 'rgba(5,150,105,0.45)',
    gainBorder: isDark ? '#00e676' : '#059669',
    gainBg: isDark ? 'rgba(0,230,118,0.05)' : 'rgba(5,150,105,0.06)',
    loss: isDark ? '#ff5252' : '#dc2626',
    lossBar: isDark ? 'rgba(255,82,82,0.45)' : 'rgba(220,38,38,0.4)',
    lossBorder: isDark ? '#ff5252' : '#dc2626',
    gold: isDark ? 'rgba(255,215,64,0.6)' : 'rgba(217,119,6,0.6)',
    grid: isDark ? 'rgba(26,46,36,0.5)' : 'rgba(0,0,0,0.06)',
    tick: isDark ? '#6b8a7a' : '#5a7a6a',
    tooltipBg: isDark ? '#111a15' : '#ffffff',
    tooltipTitle: isDark ? '#e2ebe6' : '#0f1a14',
    tooltipBody: isDark ? '#b0c8ba' : '#3a5a4a',
    tooltipBorder: isDark ? '#1a2e24' : '#d4ddd8',
    pointBorder: isDark ? '#060a08' : '#ffffff',
  }
}

// ============================================================
// FAQ DATA
// ============================================================
const faqs = [
  {
    q: 'What is a "lot" in this calculator?',
    a: 'A lot here means one purchase transaction — a single buy order placed at a specific price. Every time you bought shares at a different price, that is one lot. Example: if you bought HDFC Bank on three different dates at three prices, you have 3 lots. (Note: In F&O markets, "lot size" refers to the minimum contract quantity — e.g. 25 units for Nifty, 15 for BankNifty — which is different.)'
  },
  {
    q: 'How is the average price calculated?',
    a: 'We use the weighted average formula: Average Price = Total Amount Invested ÷ Total Shares Held. Each lot is weighted by share quantity. If you bought 100 shares at ₹500 and then 400 shares at ₹300, your average is NOT ₹400. It is (₹50,000 + ₹1,20,000) ÷ 500 = ₹340. The larger lot at ₹300 pulls the average down significantly. This matches exactly how Zerodha, Groww, and Upstox calculate your average on the Holdings page.'
  },
  {
    q: 'Can I use this for F&O (Futures and Options)?',
    a: 'Yes! For Futures averaging, enter the number of lots and entry price. For example, 2 Nifty futures at 21000 and 2 more at 20500: Lot 1 = 2 units at 21000, Lot 2 = 2 units at 20500. Average entry = ₹20,750. For Options, averaging by buying more contracts at lower premiums works the same way. Warning: F&O averaging without a stop-loss can be extremely dangerous — losses can exceed your investment in futures.'
  },
  {
    q: 'Does this include brokerage and STT charges?',
    a: 'No — this calculator gives the pure average price based on prices and quantities only. It does not include brokerage, STT (Securities Transaction Tax), GST on brokerage, SEBI turnover charges, or DP charges. For a more accurate breakeven, add your total transaction costs to the total investment. In India, typical delivery trade costs: 0.1% STT on buy, DP charges ₹15–25, brokerage ₹20 flat (Zerodha/Groww/Upstox).'
  },
  {
    q: 'How many lots can I add?',
    a: 'You can add unlimited lots. The calculator starts with two lots for convenience. Click "Add Lot" to add more. Long-term investors who have been buying the same stock via monthly SIP over 5–10 years may have dozens of lots — this calculator handles all of them smoothly.'
  },
  {
    q: 'Is averaging down always a good strategy?',
    a: 'It depends on why the stock is falling. Averaging down is excellent when a fundamentally strong company falls due to market-wide correction (Nifty crash, rate hike fears) — this is the value investor approach. But it is dangerous when the stock falls due to company-specific issues: bad quarterly results, promoter pledge/selling, high debt, governance issues. Always ask: is the business still sound, or is it a falling knife? Never average blindly in F&O without a strict stop-loss.'
  },
  {
    q: 'What is Rupee Cost Averaging (RCA)?',
    a: 'Rupee Cost Averaging (RCA) — the Indian equivalent of Dollar Cost Averaging (DCA) — means investing a fixed ₹ amount every month regardless of price. When price is high, you buy fewer shares. When price is low, you buy more. Over time, this creates a natural balanced average. RCA is the core principle behind SIP in mutual funds. This calculator\'s SIP Simulator lets you model exactly how RCA works across different market conditions.'
  },
  {
    q: 'What does "breakeven price" mean?',
    a: 'Your breakeven price is the price at which your position shows exactly zero profit and zero loss — it equals your average cost. If the CMP is above your average, you are in profit. If below, you are in loss. To truly breakeven after all charges, your actual breakeven is slightly higher than your average, because of STT, brokerage, and other transaction costs.'
  },
  {
    q: 'Can I track multiple stocks?',
    a: 'This calculator handles one stock at a time. To average multiple stocks, note the result for one, then clear all lots and calculate the next. For a full portfolio tracker with multiple stocks, P&L tracking, and broker statement imports, check AllTimeTrader\'s portfolio tools. Your broker (Zerodha Console, Groww, Upstox) also shows your holding average directly.'
  },
  {
    q: 'When should I exit instead of averaging?',
    a: 'Consider exiting when: (1) The reason you originally bought the stock no longer holds. (2) Company fundamentals have deteriorated — rising debt, poor results, promoter exits. (3) You are in an F&O position and your stop-loss level is hit. Consider averaging when: (1) The business is still strong and the fall is market-driven. (2) You have a clear thesis and sufficient capital. (3) You are in delivery with a long-term view. Never let hope replace logic.'
  }
]

// ============================================================
// MAIN COMPONENT
// ============================================================
export function StockAverageCalculator() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [lots, setLots] = useState<Lot[]>([
    { id: 0, shares: '', price: '', totalCost: 0, weight: 0 },
    { id: 1, shares: '', price: '', totalCost: 0, weight: 0 },
  ])
  const [currentPrice, setCurrentPrice] = useState('')
  const [lotIdCounter, setLotIdCounter] = useState(2)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // SIP simulator state
  const [dcaStart, setDcaStart] = useState('1000')
  const [dcaMonthly, setDcaMonthly] = useState('5000')
  const [dcaMonths, setDcaMonths] = useState('24')
  const [dcaVol, setDcaVol] = useState('medium')
  const [dcaResult, setDcaResult] = useState<DcaResult | null>(null)
  const [dcaSimulated, setDcaSimulated] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // ---- Calculate results ----
  const calcResult = useCallback((): CalcResult => {
    let totalShares = 0
    let totalCost = 0
    const updatedLots = lots.map(lot => {
      const s = parseFloat(lot.shares) || 0
      const p = parseFloat(lot.price) || 0
      const tc = s * p
      totalShares += s
      totalCost += tc
      return { ...lot, totalCost: tc }
    })

    const averagePrice = totalShares > 0 ? totalCost / totalShares : 0
    const cmp = parseFloat(currentPrice) || 0
    const pnl = (cmp - averagePrice) * totalShares
    const pnlPercent = averagePrice > 0 ? ((cmp - averagePrice) / averagePrice) * 100 : 0
    const marketValue = cmp * totalShares

    // Update weights
    if (totalShares > 0) {
      updatedLots.forEach(lot => {
        lot.weight = ((parseFloat(lot.shares) || 0) / totalShares) * 100
      })
    }

    return { totalShares, totalCost, averagePrice, currentPrice: cmp, pnl, pnlPercent, marketValue }
  }, [lots, currentPrice])

  const r = calcResult()
  const isProfit = r.pnl >= 0

  // ---- Lot management ----
  const addLot = useCallback(() => {
    setLots(prev => [...prev, { id: lotIdCounter, shares: '', price: '', totalCost: 0, weight: 0 }])
    setLotIdCounter(prev => prev + 1)
  }, [lotIdCounter])

  const removeLot = useCallback((id: number) => {
    if (lots.length <= 1) return
    setLots(prev => prev.filter(l => l.id !== id))
  }, [lots.length])

  const updateLot = useCallback((id: number, field: 'shares' | 'price', value: string) => {
    setLots(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }, [])

  const loadExample = useCallback(() => {
    setLots([
      { id: 100, shares: '50', price: '1650', totalCost: 0, weight: 0 },
      { id: 101, shares: '100', price: '1520', totalCost: 0, weight: 0 },
      { id: 102, shares: '75', price: '1480', totalCost: 0, weight: 0 },
    ])
    setCurrentPrice('1612')
    setLotIdCounter(200)
  }, [])

  // ---- SIP Simulator ----
  const runDCASimulation = useCallback(() => {
    const startPrice = parseFloat(dcaStart) || 1000
    const monthly = parseFloat(dcaMonthly) || 5000
    const months = parseInt(dcaMonths) || 24
    const vol = dcaVol

    const volMap: Record<string, number> = { low: 0.04, medium: 0.09, high: 0.18 }
    const trendMap: Record<string, number> = { low: 0.006, medium: 0.008, high: 0.010 }
    const volatility = volMap[vol]
    const trend = trendMap[vol]

    const prices = [startPrice]
    for (let i = 1; i <= months; i++) {
      const prev = prices[i - 1]
      const change = trend + (Math.random() - 0.45) * volatility * 2
      prices.push(Math.max(prev * (1 + change), 1))
    }

    let totalInvested = 0, totalShares = 0
    const monthLabels: string[] = []
    const portfolioValues: number[] = []
    const investedCumulative: number[] = []

    for (let i = 0; i < months; i++) {
      const price = prices[i]
      const sharesThisMonth = monthly / price
      totalShares += sharesThisMonth
      totalInvested += monthly
      monthLabels.push(`M${i + 1}`)
      portfolioValues.push(totalShares * prices[i])
      investedCumulative.push(totalInvested)
    }

    const finalPrice = prices[months - 1]
    const finalValue = totalShares * finalPrice
    const avgCost = totalInvested / totalShares
    const returnPct = ((finalValue - totalInvested) / totalInvested) * 100

    setDcaResult({
      totalInvested, avgCost, finalValue, returnPct,
      monthLabels, portfolioValues, investedCumulative,
    })
    setDcaSimulated(true)
  }, [dcaStart, dcaMonthly, dcaMonths, dcaVol])

  // Run initial DCA simulation
  useEffect(() => {
    if (mounted) {
      runDCASimulation()
    }
  }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Chart colors ----
  const cc = getChartColors(resolvedTheme || 'dark')

  // ---- Main Chart Data ----
  const mainChartData = {
    labels: lots.map((_, i) => `Lot ${i + 1}`),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Buy Price (₹)',
        data: lots.map(l => parseFloat(l.price) || 0),
        backgroundColor: lots.map(l => (parseFloat(l.price) || 0) <= r.averagePrice ? cc.gainBar : cc.lossBar),
        borderColor: lots.map(l => (parseFloat(l.price) || 0) <= r.averagePrice ? cc.gainBorder : cc.lossBorder),
        borderWidth: 1.5,
        borderRadius: 6,
        order: 3,
        barPercentage: 0.6,
      },
      {
        type: 'line' as const,
        label: 'Running Average (₹)',
        data: (() => {
          const runningAvg: number[] = []
          let cumS = 0, cumC = 0
          lots.forEach(l => {
            const s = parseFloat(l.shares) || 0
            const p = parseFloat(l.price) || 0
            cumS += s; cumC += s * p
            runningAvg.push(cumS > 0 ? cumC / cumS : 0)
          })
          return runningAvg
        })(),
        borderColor: cc.gain,
        backgroundColor: cc.gainBg,
        borderWidth: 2.5,
        pointBackgroundColor: cc.gain,
        pointBorderColor: cc.pointBorder,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.3,
        order: 2,
      },
      {
        type: 'line' as const,
        label: `CMP ₹${fmtNumber(r.currentPrice, 2)}`,
        data: lots.map(() => r.currentPrice),
        borderColor: r.currentPrice >= r.averagePrice ? cc.gainBorder : cc.lossBorder,
        borderWidth: 2,
        borderDash: [8, 4],
        pointRadius: 0,
        fill: false,
        order: 1,
      }
    ]
  }

  const mainChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: 'easeOutQuart' as const },
    plugins: {
      legend: {
        labels: {
          color: cc.tick,
          font: { family: "'JetBrains Mono', monospace", size: 11 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        }
      },
      tooltip: {
        backgroundColor: cc.tooltipBg,
        titleColor: cc.tooltipTitle,
        bodyColor: cc.tooltipBody,
        borderColor: cc.tooltipBorder,
        borderWidth: 1,
        titleFont: { family: "'Space Grotesk', sans-serif", weight: '600' as const },
        bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { color: cc.grid },
        ticks: { color: cc.tick, font: { family: "'JetBrains Mono', monospace", size: 11 } }
      },
      y: {
        grid: { color: cc.grid },
        ticks: { color: cc.tick, font: { family: "'JetBrains Mono', monospace", size: 11 }, callback: (v: string | number) => '₹' + fmtNumber(Number(v), 0) }
      }
    }
  }

  // ---- DCA Chart Data ----
  const dcaChartData = dcaResult ? {
    labels: dcaResult.monthLabels,
    datasets: [
      {
        label: 'Portfolio Value (₹)',
        data: dcaResult.portfolioValues,
        borderColor: cc.gain,
        backgroundColor: cc.gainBg,
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Total Invested (₹)',
        data: dcaResult.investedCumulative,
        borderColor: cc.gold,
        borderWidth: 2,
        borderDash: [6, 3],
        pointRadius: 0,
        fill: false,
        tension: 0,
      }
    ]
  } : null

  const dcaChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' as const },
    plugins: {
      legend: {
        labels: { color: cc.tick, font: { family: "'JetBrains Mono', monospace", size: 11 }, padding: 16, usePointStyle: true }
      },
      tooltip: {
        backgroundColor: cc.tooltipBg, titleColor: cc.tooltipTitle, bodyColor: cc.tooltipBody,
        borderColor: cc.tooltipBorder, borderWidth: 1, padding: 12, cornerRadius: 8,
      }
    },
    scales: {
      x: { grid: { color: cc.grid }, ticks: { color: cc.tick, font: { family: "'JetBrains Mono', monospace", size: 10 }, maxTicksLimit: 12 } },
      y: { grid: { color: cc.grid }, ticks: { color: cc.tick, font: { family: "'JetBrains Mono', monospace", size: 10 }, callback: (v: string | number) => '₹' + fmtNumber(Number(v), 0) } }
    }
  }

  const barPercent = Math.min(Math.max(50 + (r.pnlPercent / 2), 5), 95)

  if (!mounted) {
    return <div className="min-h-[400px]" />
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6">

      {/* ── Premium Stock Average Hero ── */}
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
                LIVE CALCULATOR · Weighted Cost Average
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Optimize Your{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 60%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Stock Averages
                </span>
              </h2>

              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                Plan your average-down or average-up strategy with precision. Simulate multi-tier stock purchases, track target price drops, and visualize your cost adjustments in real-time.
              </p>

              {/* CTA strip */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    const el = document.getElementById('calculator')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all duration-200 cursor-pointer"
                >
                  <Calculator className="h-4 w-4" />
                  Calculate Now
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={loadExample}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-5 py-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                >
                  <Bolt className="h-4 w-4 text-primary" />
                  Try Example
                </button>
              </div>
            </div>

            {/* RIGHT: floating stat bubbles */}
            <div className="hidden sm:flex flex-col gap-3 shrink-0">
              {[
                { val: 'DCA',     label: 'Compounding Strategies', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { val: '100%',    label: 'Math Precision',         color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { val: 'Target',  label: 'Cost Drop Visualizer',    color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
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
              { val: 'DCA', label: 'Compounding', color: 'text-primary' },
              { val: '100%',  label: 'Precision',   color: 'text-amber-400' },
              { val: 'Target', label: 'Cost Drop',   color: 'text-violet-400' },
            ].map(({ val, label, color }) => (
              <div key={label} className="flex flex-col">
                <span className="text-base font-black font-mono text-primary">{val}</span>
                <span className="text-[11px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======== TICKER TAPE ======== */}
      <div className="border-y border-border/30 py-2 text-xs font-mono text-muted-foreground/60 overflow-hidden">
        <div className="whitespace-nowrap animate-[ticker_35s_linear_infinite]">
          {[1, 2].map(_ => (
            <span key={_} className="inline-block">
              <span className="mx-4">RELIANCE <span className="text-[var(--att-gain)]">▲ 2,934.50 +1.2%</span></span>
              <span className="mx-4">TCS <span className="text-[var(--att-gain)]">▲ 3,847.25 +0.8%</span></span>
              <span className="mx-4">HDFCBANK <span className="text-[var(--att-loss)]">▼ 1,612.40 -0.4%</span></span>
              <span className="mx-4">INFY <span className="text-[var(--att-gain)]">▲ 1,478.90 +1.6%</span></span>
              <span className="mx-4">ICICIBANK <span className="text-[var(--att-gain)]">▲ 1,122.35 +0.9%</span></span>
              <span className="mx-4">SBIN <span className="text-[var(--att-gain)]">▲ 824.60 +2.1%</span></span>
              <span className="mx-4">NIFTY 50 <span className="text-[var(--att-gain)]">▲ 22,456.80 +0.6%</span></span>
              <span className="mx-4">SENSEX <span className="text-[var(--att-gain)]">▲ 73,847.15 +0.5%</span></span>
              <span className="mx-4">BANKNIFTY <span className="text-[var(--att-loss)]">▼ 48,234.60 -0.3%</span></span>
            </span>
          ))}
        </div>
      </div>

      {/* ======== CALCULATOR SECTION ======== */}
      <section id="calculator" className="grid lg:grid-cols-5 gap-6">

        {/* Left: Lots Entry (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-[var(--att-gain)]" />
              Purchase Lots
            </h2>
            <div className="flex gap-2">
              <button
                onClick={loadExample}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-[var(--att-cmp-bg)] border border-[var(--att-cmp-border)] text-[var(--att-cmp-text)] hover:brightness-110 transition-all flex items-center gap-1.5 animate-pulse"
              >
                <Bolt className="h-3 w-3" /> Try Example
              </button>
              <button
                onClick={addLot}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-[var(--att-badge-gain-bg)] border border-[var(--att-gain)]/30 text-[var(--att-gain)] hover:bg-[var(--att-badge-gain-bg)]/80 transition-all"
              >
                <Plus className="h-3 w-3 inline mr-1" /> Add Lot
              </button>
            </div>
          </div>

          {/* Lots Table Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Shares</div>
            <div className="col-span-3">Price (₹)</div>
            <div className="col-span-3">Total Cost</div>
            <div className="col-span-2"></div>
          </div>

          {/* Lot Rows */}
          <div className="space-y-2">
            {lots.map((lot, idx) => {
              const shares = parseFloat(lot.shares) || 0
              const price = parseFloat(lot.price) || 0
              return (
                <div
                  key={lot.id}
                  className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl border border-border bg-card hover:bg-[var(--att-card-alt)] transition-colors"
                >
                  <div className="col-span-1 font-mono text-xs text-muted-foreground">{idx + 1}</div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={lot.shares}
                      onChange={e => updateLot(lot.id, 'shares', e.target.value)}
                      className="att-lot-input text-sm"
                      min={0}
                      step={1}
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-mono text-xs">₹</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={lot.price}
                        onChange={e => updateLot(lot.id, 'price', e.target.value)}
                        className="att-lot-input text-sm"
                        style={{ paddingLeft: '1.75rem' }}
                        min={0}
                        step={0.05}
                      />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="font-mono text-sm text-muted-foreground">{fmtINR(shares * price)}</div>
                    <div className="font-mono text-[10px] text-muted-foreground/50">
                      {r.totalShares > 0 ? fmtNumber((shares / r.totalShares) * 100, 1) : '0.0'}%
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => removeLot(lot.id)}
                      disabled={lots.length <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-muted-foreground hover:bg-[var(--att-badge-loss-bg)] hover:border-[var(--att-loss)]/30 hover:text-[var(--att-loss)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove lot"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Current Price (CMP) */}
          <div className="mt-6 p-4 rounded-xl border att-cmp-section">
            <label className="block text-sm font-medium att-cmp-label mb-2">
              <Tag className="h-4 w-4 inline mr-1" /> Current Market Price (CMP)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 att-cmp-prefix font-mono text-sm">₹</span>
              <input
                type="number"
                value={currentPrice}
                onChange={e => setCurrentPrice(e.target.value)}
                className="att-lot-input att-cmp-input"
                style={{ paddingLeft: '1.75rem' }}
                step={0.05}
                min={0}
                placeholder="e.g. 2500.00"
              />
            </div>
            <p className="text-xs text-muted-foreground/60 mt-1.5">Enter today&apos;s CMP to calculate unrealised P&amp;L</p>
          </div>
        </div>

        {/* Right: Results (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
            <ChartPie className="h-5 w-5 text-[var(--att-gold)]" />
            Results
          </h2>

          {/* Average Price */}
          <div className="att-result-card rounded-xl border border-border bg-card p-5">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Weighted Average Price</div>
            <div className="font-mono font-bold text-3xl text-[var(--att-gain)]">{fmtINR(r.averagePrice)}</div>
            <div className="text-xs text-muted-foreground mt-1">Your breakeven = this price</div>
          </div>

          {/* Total Shares & Investment */}
          <div className="grid grid-cols-2 gap-3">
            <div className="att-result-card rounded-xl border border-border bg-card p-4">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Total Shares</div>
              <div className="font-mono font-bold text-xl text-foreground">{r.totalShares.toLocaleString('en-IN')}</div>
            </div>
            <div className="att-result-card rounded-xl border border-border bg-card p-4">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Total Invested</div>
              <div className="font-mono font-bold text-xl text-foreground">{fmtINRShort(r.totalCost)}</div>
            </div>
          </div>

          {/* P&L */}
          <div className={`att-result-card rounded-xl border bg-card p-5 ${isProfit ? 'gain-glow border-[var(--att-gain)]/20' : r.pnl < 0 ? 'loss-glow border-[var(--att-loss)]/20' : 'border-border'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Unrealised P&amp;L</div>
              <div
                className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{
                  color: isProfit ? 'var(--att-gain)' : 'var(--att-loss)',
                  background: isProfit ? 'var(--att-badge-gain-bg)' : 'var(--att-badge-loss-bg)',
                }}
              >
                {fmtPercent(r.pnlPercent)}
              </div>
            </div>
            <div
              className="font-mono font-bold text-3xl"
              style={{ color: isProfit ? 'var(--att-gain)' : 'var(--att-loss)' }}
            >
              {(isProfit ? '+' : '') + fmtINR(r.pnl)}
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${barPercent}%`,
                  background: isProfit
                    ? 'linear-gradient(90deg, var(--att-bar-gain-from), var(--att-bar-gain-to))'
                    : 'linear-gradient(90deg, var(--att-bar-loss-from), var(--att-bar-loss-to))',
                }}
              />
            </div>
          </div>

          {/* Break Even */}
          <div className="att-result-card rounded-xl border border-border bg-card p-4">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Break-Even Price</div>
            <div className="font-mono font-semibold text-lg text-[var(--att-gold)]">{fmtINR(r.averagePrice)}</div>
            <div className="text-xs text-muted-foreground mt-1">Your average cost = break-even point</div>
          </div>

          {/* Market Value */}
          <div className="att-result-card rounded-xl border border-border bg-card p-4">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Current Market Value</div>
            <div className="font-mono font-semibold text-lg text-foreground">{fmtINR(r.marketValue)}</div>
          </div>

          {/* Number of lots */}
          <div className="att-result-card rounded-xl border border-border bg-card p-4">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Purchase Lots</div>
            <div className="font-mono font-semibold text-lg text-foreground">{lots.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total buy orders averaged</div>
          </div>
        </div>
      </section>

      {/* ======== CHART SECTION ======== */}
      <section>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
          <ChartBar className="h-5 w-5 text-[var(--att-gain)]" />
          Visual Breakdown
        </h2>
        <div className="bg-[var(--att-input-bg)] border border-border rounded-2xl p-4 sm:p-6">
          <div style={{ height: 300 }}>
            <Chart type="bar" data={mainChartData} options={mainChartOptions} />
          </div>
        </div>
      </section>

      {/* ======== SIP / RCA SIMULATOR ======== */}
      <section id="simulator">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--att-cmp-bg)] border border-[var(--att-cmp-border)] flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-[var(--att-gold)]" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-foreground">SIP / Rupee Cost Averaging Simulator</h2>
              <p className="text-xs text-muted-foreground">Model monthly SIP investments with simulated price movements — in ₹ INR</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1">Starting Price (₹)</label>
              <input type="number" value={dcaStart} onChange={e => setDcaStart(e.target.value)} step={10} min={1} className="att-lot-input" />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1">Monthly Investment (₹)</label>
              <input type="number" value={dcaMonthly} onChange={e => setDcaMonthly(e.target.value)} step={500} min={100} className="att-lot-input" />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1">Duration (Months)</label>
              <input type="number" value={dcaMonths} onChange={e => setDcaMonths(e.target.value)} step={1} min={3} max={120} className="att-lot-input" />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1">Volatility</label>
              <select value={dcaVol} onChange={e => setDcaVol(e.target.value)} className="att-lot-input">
                <option value="low">Low (Bluechip)</option>
                <option value="medium">Medium (Midcap)</option>
                <option value="high">High (Smallcap)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={runDCASimulation}
                className="w-full px-4 py-2.5 rounded-lg font-mono font-semibold text-sm bg-[var(--att-cmp-bg)] border border-[var(--att-cmp-border)] text-[var(--att-cmp-text)] hover:brightness-110 transition-all"
              >
                <FlaskConical className="h-4 w-4 inline mr-1" /> Simulate
              </button>
            </div>
          </div>

          {/* SIP Results */}
          {dcaSimulated && dcaResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="rounded-lg bg-background border border-border p-3">
                <div className="text-xs font-mono text-muted-foreground mb-0.5">Total Invested</div>
                <div className="font-mono font-bold text-foreground">{fmtINRShort(dcaResult.totalInvested)}</div>
              </div>
              <div className="rounded-lg bg-background border border-border p-3">
                <div className="text-xs font-mono text-muted-foreground mb-0.5">Avg Cost / Share</div>
                <div className="font-mono font-bold text-[var(--att-gold)]">{fmtINR(dcaResult.avgCost)}</div>
              </div>
              <div className="rounded-lg bg-background border border-border p-3">
                <div className="text-xs font-mono text-muted-foreground mb-0.5">Portfolio Value</div>
                <div className="font-mono font-bold text-foreground">{fmtINR(dcaResult.finalValue)}</div>
              </div>
              <div className="rounded-lg bg-background border border-border p-3">
                <div className="text-xs font-mono text-muted-foreground mb-0.5">Return</div>
                <div
                  className="font-mono font-bold"
                  style={{ color: dcaResult.returnPct >= 0 ? 'var(--att-gain)' : 'var(--att-loss)' }}
                >
                  {fmtPercent(dcaResult.returnPct)}
                </div>
              </div>
            </div>
          )}

          <div className="bg-[var(--att-input-bg)] border border-border rounded-2xl p-4">
            <div style={{ height: 280 }}>
              {dcaChartData && <Chart type="line" data={dcaChartData} options={dcaChartOptions} />}
            </div>
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section id="how-it-works">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Understand the math behind cost averaging and how this calculator computes your Indian stock positions</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { icon: Calculator, title: '1. Enter Each Lot', desc: 'Add each buy order as a separate lot — enter the number of shares bought and the price per share in ₹.', accent: true },
            { icon: Calculator, title: '2. Auto-Calculate Average', desc: 'The weighted average is computed instantly. Larger lots have more weight — just like your broker\'s holding statement.', accent: true },
            { icon: ChartBar, title: '3. Track Unrealised P&L', desc: 'Enter the Current Market Price (CMP) to instantly see your unrealised profit or loss in ₹ and percentage.', accent: false },
            { icon: FlaskConical, title: '4. Simulate SIP / RCA', desc: 'Use the SIP simulator to model how monthly ₹ investments perform across Bluechip, Midcap, and Smallcap volatility profiles.', accent: false },
          ].map((step, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 group hover:border-[var(--att-gain)]/30 transition-colors hover:shadow-[var(--att-card-hover-shadow)]"
            >
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${step.accent ? 'bg-[var(--att-badge-gain-bg)] border-[var(--att-gain)]/30 text-[var(--att-gain)]' : 'bg-[var(--att-cmp-bg)] border-[var(--att-cmp-border)] text-[var(--att-gold)]'}`}>
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Calculation Notes */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[var(--att-gain)]" />
            Calculation Notes
          </h3>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Weighted Average Formula</h4>
            <div className="att-formula-block mb-3">
              Average Price = Σ(Shares<sub>i</sub> × Price<sub>i</sub>) / Σ(Shares<sub>i</sub>)
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unlike a simple average that treats each purchase equally, the weighted average accounts for position size. A lot of 500 shares has more impact on your average than a lot of 50 shares — this is how your broker (Zerodha, Groww, Upstox) also calculates it.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Worked Example (HDFC Bank)</h4>
            <div className="att-formula-block space-y-1 mb-3">
              <div>Lot 1: 50 shares × ₹1,650 = ₹82,500</div>
              <div>Lot 2: 100 shares × ₹1,520 = ₹1,52,000</div>
              <div>Lot 3: 75 shares × ₹1,480 = ₹1,11,000</div>
              <div className="border-t border-border pt-1 mt-1">Total Invested = ₹3,45,500 = <span className="text-[var(--att-gain)]">₹3,45,500</span></div>
              <div>Total Shares = 50 + 100 + 75 = <span className="text-[var(--att-gain)]">225</span></div>
              <div>Average Price = ₹3,45,500 ÷ 225 = <span className="text-[var(--att-gold)]">₹1,535.56</span></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Profit &amp; Loss Calculation</h4>
            <div className="att-formula-block space-y-1">
              <div>P&amp;L (₹) = (CMP − Average Price) × Total Shares</div>
              <div>P&amp;L (%) = ((CMP − Average Price) / Average Price) × 100</div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Why Weighted Average Matters</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you simply averaged three prices ₹1,650 + ₹1,520 + ₹1,480 = ₹1,550, you&apos;d get a misleading result. The true weighted average of ₹1,535.56 is lower because you bought more shares at the lower prices. This is the core principle of Rupee Cost Averaging (RCA): buying more shares when prices are lower naturally pulls your average cost down.
            </p>
          </div>
        </div>
      </section>

      {/* ======== FAQ SECTION ======== */}
      <section id="faq" className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Everything Indian traders need to know about stock averaging and cost basis</p>
        </div>
        <div className="space-y-3">
          {faqs.map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden hover:border-[var(--att-gain)]/20 transition-colors">
              <button
                className="w-full flex items-center justify-between p-5 text-left group"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-semibold text-foreground group-hover:text-[var(--att-gain)] transition-colors text-sm sm:text-base">{item.q}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 ml-3 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <div className={`att-faq-answer px-5 text-sm text-muted-foreground leading-relaxed ${openFaq === i ? 'open' : ''}`}>
                <div className="pb-5">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ticker animation keyframes */}
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
