'use client'

import { useState, useMemo } from 'react'
import { BROKERS, type BrokerData } from '@/data/brokers'
import { BrokerLogoInline } from '@/components/broker-logo'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { formatCurrency, formatIndianNumber } from '@/lib/store'
import { 
  Calculator, 
  IndianRupee, 
  ArrowRight, 
  ExternalLink, 
  Receipt, 
  Scale, 
  PiggyBank, 
  Info, 
  ShieldAlert, 
  Percent,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AnimatePresence, motion } from 'framer-motion'

type Segment = 'equityDelivery' | 'equityIntraday' | 'fnoFutures' | 'fnoOptions'

interface ChargeBreakdown {
  brokerName: string
  brokerage: number
  stt: number
  transactionCharges: number
  gst: number
  sebiCharges: number
  stampDuty: number
  ipftCharges: number
  dpCharges: number
  totalCharges: number
  netPnl: number
  breakevenPoints: number
  savings: number
}

export function BrokerageCalculator() {
  const { toast } = useToast()
  
  // Inputs matching user requirements
  const [segment, setSegment] = useState<Segment>('equityDelivery')
  const [buyPrice, setBuyPrice] = useState<number>(100)
  const [sellPrice, setSellPrice] = useState<number>(110)
  const [quantity, setQuantity] = useState<number>(100)
  
  // F&O only inputs
  const [lotSize, setLotSize] = useState<number>(75)
  const [numLots, setNumLots] = useState<number>(1)
  
  const [selectedBroker, setSelectedBroker] = useState<string>('all')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  // Dynamic Quantity calculation based on segment
  const finalQuantity = useMemo(() => {
    if (segment === 'fnoFutures' || segment === 'fnoOptions') {
      return lotSize * numLots
    }
    return quantity
  }, [segment, quantity, lotSize, numLots])

  // Calculation engine based on SEBI & exchange rules
  const calculations = useMemo(() => {
    const qty = finalQuantity
    const bp = buyPrice
    const sp = sellPrice

    const buyValue = bp * qty
    const sellValue = sp * qty
    const turnover = buyValue + sellValue
    const grossPnl = sellValue - buyValue

    const brokerResults = BROKERS.map((broker): ChargeBreakdown => {
      // 1. Brokerage calculation
      let brokerage = 0
      if (segment === 'equityDelivery') {
        brokerage = buyValue * (broker.equityDelivery / 100)
      } else if (segment === 'equityIntraday') {
        const flat = broker.intradayFlat
        const pct = (buyValue * (broker.intradayPercent / 100)) + (sellValue * (broker.intradayPercent / 100))
        brokerage = Math.min(flat * 2, pct)
      } else if (segment === 'fnoFutures') {
        brokerage = broker.futuresFlat * 2 // buy + sell order flat
      } else if (segment === 'fnoOptions') {
        brokerage = broker.optionsFlat * 2 // buy + sell order flat
      }

      // 2. STT/CTT rates (Oct 2024 Revised Guidelines)
      let stt = 0
      if (segment === 'equityDelivery') {
        stt = (buyValue * 0.001) + (sellValue * 0.001) // 0.1% buy + sell
      } else if (segment === 'equityIntraday') {
        stt = sellValue * 0.00025 // 0.025% sell only
      } else if (segment === 'fnoFutures') {
        stt = sellValue * 0.0002 // 0.02% sell only (Revised Oct 2024 from 0.0125%)
      } else if (segment === 'fnoOptions') {
        stt = sellValue * 0.001 // 0.1% sell premium only (Revised Oct 2024 from 0.0625%)
      }

      // 3. Exchange Transaction Charges (NSE standard)
      let txn = 0
      if (segment === 'equityDelivery' || segment === 'equityIntraday') {
        txn = turnover * 0.0000343 // 0.00343%
      } else if (segment === 'fnoFutures') {
        txn = turnover * 0.000019 // 0.0019%
      } else if (segment === 'fnoOptions') {
        txn = turnover * 0.000353 // 0.0353% on premium
      }

      // 4. SEBI Turnover Fees (₹10 / Crore)
      const sebi = (turnover / 10000000) * 10

      // 5. Stamp Duty (Buy side only)
      let stamp = 0
      if (segment === 'equityDelivery') {
        stamp = buyValue * 0.00015 // 0.015%
      } else if (segment === 'equityIntraday') {
        stamp = buyValue * 0.00003 // 0.003%
      } else if (segment === 'fnoFutures') {
        stamp = buyValue * 0.00002 // 0.002%
      } else if (segment === 'fnoOptions') {
        stamp = buyValue * 0.00003 // 0.003% on premium
      }

      // 6. IPFT Charges (₹10 / Crore)
      const ipft = (turnover / 10000000) * 10

      // 7. DP Charges (Delivery sell side only)
      const dp = (segment === 'equityDelivery') ? 15.34 : 0 // Standard ₹15.34 per scrip per day

      // 8. GST (18% of brokerage + txn + sebi + ipft + dp)
      const gst = (brokerage + txn + sebi + ipft + dp) * 0.18

      // Total summation
      const totalCharges = brokerage + stt + txn + sebi + stamp + ipft + dp + gst
      const netPnl = grossPnl - totalCharges

      // Breakeven points = totalCharges / quantity
      const breakevenPoints = totalCharges / qty

      // Savings vs Traditional Broker Comparison
      // Traditional broker charges: 0.5% of turnover + ₹50 per lot F&O
      let traditionalCost = 0
      if (segment === 'equityDelivery' || segment === 'equityIntraday') {
        traditionalCost = turnover * 0.005 // 0.5%
      } else {
        traditionalCost = numLots * 100 // ₹50 buy + ₹50 sell per lot
      }
      const traditionalTotal = traditionalCost + stt + txn + sebi + stamp + ipft + dp + (traditionalCost + txn + sebi + ipft + dp) * 0.18
      const savings = Math.max(0, traditionalTotal - totalCharges)

      return {
        brokerName: broker.name,
        brokerage: Math.round(brokerage * 100) / 100,
        stt: Math.round(stt * 100) / 100,
        transactionCharges: Math.round(txn * 100) / 100,
        gst: Math.round(gst * 100) / 100,
        sebiCharges: Math.round(sebi * 100) / 100,
        stampDuty: Math.round(stamp * 100) / 100,
        ipftCharges: Math.round(ipft * 100) / 100,
        dpCharges: Math.round(dp * 100) / 100,
        totalCharges: Math.round(totalCharges * 100) / 100,
        netPnl: Math.round(netPnl * 100) / 100,
        breakevenPoints: Math.round(breakevenPoints * 100) / 100,
        savings: Math.round(savings * 100) / 100
      }
    })

    return {
      buyValue,
      sellValue,
      turnover,
      grossPnl,
      brokerResults
    }
  }, [buyPrice, sellPrice, finalQuantity, segment, numLots])

  const currentResult = useMemo(() => {
    if (selectedBroker === 'all') {
      return calculations.brokerResults[0] // Zerodha as benchmark if all
    }
    return calculations.brokerResults.find(b => b.brokerName.toLowerCase() === selectedBroker.toLowerCase()) || calculations.brokerResults[0]
  }, [calculations, selectedBroker])

  const copyResults = () => {
    const text = `AllTimeTrader Brokerage Calculation Breakup:
Segment: ${segment}
Buy Price: ₹${buyPrice} | Sell Price: ₹${sellPrice} | Qty: ${finalQuantity}
Gross P&L: ₹${calculations.grossPnl}
Brokerage: ₹${currentResult.brokerage}
STT/CTT: ₹${currentResult.stt}
Txn Charges: ₹${currentResult.transactionCharges}
GST (18%): ₹${currentResult.gst}
Stamp Duty: ₹${currentResult.stampDuty}
DP Charges: ₹${currentResult.dpCharges}
Total Charges: ₹${currentResult.totalCharges}
Net P&L: ₹${currentResult.netPnl}`
    
    navigator.clipboard.writeText(text)
    toast({
      title: "Results Copied",
      description: "Full charges breakup copied to clipboard.",
    })
  }

  const segmentInfos = {
    equityDelivery: "Equity Delivery: Long-term investing. Shares are transferred to/from your demat account. STT applies on both buying & selling. DP sell charges apply.",
    equityIntraday: "Equity Intraday: Buy and sell on the same market session. STT applies only on the selling turnover. Zero DP charges.",
    fnoFutures: "F&O Futures: Leveraged derivatives. Calculations use full contract turnover value. STT applies only on sell side. Zero DP charges.",
    fnoOptions: "F&O Options: Option premium trading. Taxes are assessed on premium value. STT applies only on the sell side (revised Oct 2024)."
  }

  return (
    <div className="space-y-8">

      {/* ── Compact Brokerage Hero ── */}
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
                LIVE CALCULATOR · 2025 SEBI Rates
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Know Your{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 60%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  True Trading Costs
                </span>
              </h2>

              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                Brokerage is just the tip of the iceberg. Calculate every charge — STT, GST, stamp duty, and more — before you place your next trade.
              </p>

              {/* CTA strip */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    const el = document.getElementById('brokerage-inputs')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all duration-200"
                >
                  <Calculator className="h-4 w-4" />
                  Calculate Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <a
                  href="#brokerage-faq"
                  className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-5 py-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                >
                  <Receipt className="h-4 w-4 text-primary" />
                  Learn First
                </a>
              </div>
            </div>

            {/* RIGHT: floating stat bubbles */}
            <div className="hidden sm:flex flex-col gap-3 shrink-0">
              {[
                { val: '8+', label: 'Charge Types Calculated', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { val: '4',  label: 'Trading Segments',         color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { val: '2025', label: 'Latest Govt. Rates',     color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              ].map(({ val, label, color, bg }) => (
                <div key={label} className={`flex items-center gap-3 rounded-xl border ${bg} px-4 py-2.5 backdrop-blur-sm`}>
                  <span className={`text-xl font-black font-mono ${color}`}>{val}</span>
                  <span className="text-xs text-muted-foreground leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* bottom stats (mobile-visible) */}
          <div className="mt-5 sm:hidden flex flex-wrap gap-4 border-t border-border/40 pt-4">
            {[
              { val: '8+', label: 'Charge Types', color: 'text-primary' },
              { val: '4',  label: 'Segments',     color: 'text-amber-400' },
              { val: '2025', label: 'Govt. Rates', color: 'text-violet-400' },
            ].map(({ val, label, color }) => (
              <div key={label} className="flex flex-col">
                <span className={`text-lg font-black font-mono ${color}`}>{val}</span>
                <span className="text-[11px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segment Selector Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { id: 'equityDelivery', label: 'Equity Delivery', icon: '🏛️' },
          { id: 'equityIntraday', label: 'Equity Intraday', icon: '⚡' },
          { id: 'fnoFutures', label: 'F&O Futures', icon: '📈' },
          { id: 'fnoOptions', label: 'F&O Options', icon: '🔄' },
        ].map(tab => (
          <Button
            key={tab.id}
            onClick={() => {
              setSegment(tab.id as Segment)
              setSelectedBroker('all')
            }}
            variant={segment === tab.id ? 'default' : 'outline'}
            className={`font-mono font-bold text-xs gap-1.5 transition-all cursor-pointer ${
              segment === tab.id 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-background shadow-lg shadow-emerald-500/20' 
                : 'border-border/50 hover:bg-emerald-500/10'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </Button>
        ))}
      </div>

      {/* SECTION 1: Calculator Body */}
      <div id="brokerage-inputs" className="grid lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Inputs Card (2/5) */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/50 via-primary/50 to-amber-500/50"></div>
            
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-mono font-bold tracking-tight">
                <Calculator className="h-5 w-5 text-emerald-500" />
                Trade parameters
              </CardTitle>
              <CardDescription className="text-xs">
                Fill in execution prices and volume
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              
              {/* Buy Price */}
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                  Buy Price (₹)
                </Label>
                <Input 
                  type="number"
                  value={buyPrice}
                  onChange={e => setBuyPrice(Math.max(0.05, Number(e.target.value)))}
                  className="bg-background/50 border-border/50 text-sm font-bold font-mono h-10"
                />
              </div>

              {/* Sell Price */}
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                  Sell Price (₹)
                </Label>
                <Input 
                  type="number"
                  value={sellPrice}
                  onChange={e => setSellPrice(Math.max(0.05, Number(e.target.value)))}
                  className="bg-background/50 border-border/50 text-sm font-bold font-mono h-10"
                />
              </div>

              {/* Dynamic Quantity or Lot tuning */}
              {segment === 'fnoFutures' || segment === 'fnoOptions' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                      Lot Size
                    </Label>
                    <Input 
                      type="number"
                      value={lotSize}
                      onChange={e => setLotSize(Math.max(1, Number(e.target.value)))}
                      className="bg-background/50 border-border/50 text-sm font-bold font-mono h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                      No. of Lots
                    </Label>
                    <Input 
                      type="number"
                      value={numLots}
                      onChange={e => setNumLots(Math.max(1, Number(e.target.value)))}
                      className="bg-background/50 border-border/50 text-sm font-bold font-mono h-10"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                    Quantity
                  </Label>
                  <Input 
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="bg-background/50 border-border/50 text-sm font-bold font-mono h-10"
                  />
                </div>
              )}

              {/* Broker comparison filter */}
              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                  Select Broker Focus
                </Label>
                <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                  <SelectTrigger className="bg-background/50 border-border/50 text-xs font-bold font-mono h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all" className="font-mono">All Brokers (Compare)</SelectItem>
                    {BROKERS.map(b => (
                      <SelectItem key={b.id} value={b.name.toLowerCase()} className="font-mono">
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Educational info badge */}
              <div className="p-3.5 rounded-xl border border-border bg-emerald-500/5 flex gap-2.5 items-start">
                <Info className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-mono leading-relaxed text-muted-foreground">
                  {segmentInfos[segment]}
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Calculation Display (3/5) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Main Key Metrics Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-border bg-card/30 backdrop-blur-md text-center py-4 hover:scale-[1.02] transition-transform">
              <CardContent className="p-0">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Gross P&L</p>
                <p className={`text-base font-black font-mono ${calculations.grossPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatCurrency(calculations.grossPnl)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/30 backdrop-blur-md text-center py-4 hover:scale-[1.02] transition-transform">
              <CardContent className="p-0">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Total Charges</p>
                <p className="text-base font-black font-mono text-red-500">
                  {formatCurrency(currentResult.totalCharges)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/30 backdrop-blur-md text-center py-4 hover:scale-[1.02] transition-transform">
              <CardContent className="p-0">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Net P&L</p>
                <p className={`text-base font-black font-mono ${currentResult.netPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatCurrency(currentResult.netPnl)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/30 backdrop-blur-md text-center py-4 hover:scale-[1.02] transition-transform">
              <CardContent className="p-0">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Breakeven Pts</p>
                <p className="text-base font-black font-mono text-amber-500">
                  {currentResult.breakevenPoints.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Charges Breakup Card */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-mono font-bold flex items-center gap-2">
                  <Receipt className="h-4.5 w-4.5 text-emerald-500" />
                  Detailed Charges Breakup
                </CardTitle>
                <p className="text-[10px] text-muted-foreground">Showing full government and exchange ledger taxes</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyResults}
                className="border-border/50 hover:bg-emerald-500/10 text-xs font-mono font-bold gap-1 cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                Copy Data
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-4">
              
              {/* Proportional graphical bar chart showing charge segments */}
              <div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider block mb-2">Cost Distribution Visualizer</span>
                <div className="w-full h-7 rounded-lg overflow-hidden flex bg-border/20 border border-border/10">
                  {/* Brokerage segment */}
                  <div 
                    style={{ width: `${Math.max(3, (currentResult.brokerage / currentResult.totalCharges) * 100)}%` }} 
                    className="h-full bg-emerald-500/80 border-r border-emerald-400/20" 
                    title={`Brokerage: ₹${currentResult.brokerage}`}
                  />
                  {/* STT + Stamp Duty (Govt Taxes) */}
                  <div 
                    style={{ width: `${Math.max(3, ((currentResult.stt + currentResult.stampDuty) / currentResult.totalCharges) * 100)}%` }} 
                    className="h-full bg-red-500/80 border-r border-red-400/20" 
                    title={`Govt Taxes (STT + Stamp): ₹${currentResult.stt + currentResult.stampDuty}`}
                  />
                  {/* Exchange Fees */}
                  <div 
                    style={{ width: `${Math.max(3, ((currentResult.transactionCharges + currentResult.sebiCharges + currentResult.ipftCharges) / currentResult.totalCharges) * 100)}%` }} 
                    className="h-full bg-amber-500/80 border-r border-amber-400/20" 
                    title={`Exchange Fees: ₹${currentResult.transactionCharges + currentResult.sebiCharges + currentResult.ipftCharges}`}
                  />
                  {/* GST */}
                  <div 
                    style={{ width: `${Math.max(3, (currentResult.gst / currentResult.totalCharges) * 100)}%` }} 
                    className="h-full bg-purple-500/80" 
                    title={`GST (18%): ₹${currentResult.gst}`}
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-[9px] font-mono text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500/80 inline-block"></span> Brokerage</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-red-500/80 inline-block"></span> Govt Taxes</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-500/80 inline-block"></span> Exchange Fees</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-purple-500/80 inline-block"></span> GST (18%)</span>
                </div>
              </div>

              {/* Numerical breakdown table */}
              <div className="border-t border-border/50 pt-2 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">Brokerage Charged</span>
                  <span className="font-bold text-foreground">{formatCurrency(currentResult.brokerage)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground flex items-center gap-1">STT / CTT <span className="text-[10px] text-red-400">(Buy + Sell)</span></span>
                  <span className="font-bold text-foreground">{formatCurrency(currentResult.stt)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">Exchange Transaction Charges</span>
                  <span className="font-bold text-foreground">{formatCurrency(currentResult.transactionCharges)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">GST (18% on Brokerage + Txn + DP)</span>
                  <span className="font-bold text-foreground">{formatCurrency(currentResult.gst)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">SEBI Turnover Fee</span>
                  <span className="font-bold text-foreground">{formatCurrency(currentResult.sebiCharges)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">Stamp Duty</span>
                  <span className="font-bold text-foreground">{formatCurrency(currentResult.stampDuty)}</span>
                </div>
                {segment === 'equityDelivery' && (
                  <div className="flex justify-between py-1 border-b border-border/20">
                    <span className="text-muted-foreground">Demat DP Sell Charges</span>
                    <span className="font-bold text-foreground">{formatCurrency(currentResult.dpCharges)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">IPFT Protection Fund Charges</span>
                  <span className="font-bold text-foreground">{formatCurrency(currentResult.ipftCharges)}</span>
                </div>
                <div className="flex justify-between py-1 border-t-2 border-emerald-500/50 pt-2 text-sm">
                  <span className="font-bold text-emerald-500">Total Consolidated Charges</span>
                  <span className="font-extrabold text-emerald-500">{formatCurrency(currentResult.totalCharges)}</span>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Traditional Broker comparison card */}
          <Card className="border-amber-500/20 bg-amber-500/5 overflow-hidden relative">
            <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <PiggyBank className="h-4 w-4" />
                  AllTimeTrader discount brokerage savings
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Traditional full-service brokers charge up to <strong className="text-foreground">0.50%</strong> of total volume per order. 
                </p>
                <div className="text-sm font-bold text-foreground font-mono">
                  You save <span className="text-emerald-500 font-black">{formatCurrency(currentResult.savings)}</span> on this trade!
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-500">
                🚀 Flat Savings
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* SECTION 2: Dynamic Multi-Broker Comparison Matrix Table */}
      {selectedBroker === 'all' && (
        <Card className="border-border bg-card/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-mono font-bold flex items-center gap-2">
              <Scale className="h-4.5 w-4.5 text-emerald-500" />
              Indian Discount Brokers Comparison Ledger
            </CardTitle>
            <p className="text-xs text-muted-foreground">Comparing all major registered platforms for this exact trade</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="text-xs font-mono">
                <TableHeader className="bg-muted/10 border-b border-border/50">
                  <TableRow>
                    <TableHead className="font-bold text-muted-foreground">Broker</TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground">Brokerage</TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground">STT/CTT</TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground">Txn Charges</TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground">GST</TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground">Stamp Duty</TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground font-bold">Total Cost</TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground font-bold">Net P&L</TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground">Demat Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/20">
                  {calculations.brokerResults.map((br) => {
                    const brokerMeta = BROKERS.find(b => b.name.toLowerCase() === br.brokerName.toLowerCase())
                    return (
                      <TableRow key={br.brokerName} className="hover:bg-muted/5 transition-colors">
                        <TableCell className="font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            {brokerMeta && <BrokerLogoInline broker={brokerMeta} size="xs" />}
                            <span>{br.brokerName}</span>
                            {brokerMeta?.isReferralPartner && (
                              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-bold">
                                Referral
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(br.brokerage)}</TableCell>
                        <TableCell className="text-right text-red-400">{formatCurrency(br.stt)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(br.transactionCharges)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(br.gst)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(br.stampDuty)}</TableCell>
                        <TableCell className="text-right font-bold text-red-500">{formatCurrency(br.totalCharges)}</TableCell>
                        <TableCell className={`text-right font-black ${br.netPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {formatCurrency(br.netPnl)}
                        </TableCell>
                        <TableCell className="text-right">
                          {brokerMeta?.isReferralPartner && (
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] text-emerald-500 hover:bg-emerald-500/10 cursor-pointer font-bold gap-1" asChild>
                              <a href={brokerMeta.referralUrl === '#' ? '/demat' : brokerMeta.referralUrl}>
                                Open Account <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 3: Educational Content & Updated Oct 2024 STT Table */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Cost Iceberg explanation */}
        <Card className="border-border bg-card/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-amber-500" />
              The True Cost Iceberg Explained
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-mono leading-relaxed text-muted-foreground">
            <p>
              When executing trades in Indian financial markets, <strong className="text-foreground">Brokerage</strong> is only the visible peak of a larger cost iceberg. 
            </p>
            <p>
              Underneath the surface, government regulations mandate severe transaction taxes (like STT) which are calculated as fixed percentages of total buy and sell turnover values. On F&O Options, these are levied on premium turnover (revised dynamically on October 1, 2024).
            </p>
            <p>
              Exchange Transaction fees represent NSE/BSE platform maintenance charges, which coupled with GST (18%) and SEBI regulatory levies, comprise the total hidden costs. Using an accurate multi-segment calculator helps you gauge the precise price movement (breakeven point) required to clear expenses.
            </p>
          </CardContent>
        </Card>

        {/* Dynamic calculations case notes */}
        <Card className="border-border bg-card/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-mono font-bold flex items-center gap-1.5">
              <Info className="h-4.5 w-4.5 text-emerald-500" />
              How Breakeven & DP Charges work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded bg-background/30 border border-border/10 space-y-1.5">
              <span className="text-foreground font-bold block">1. Breakeven Formula</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Breakeven Points = Total Charges / Quantity. In order to avoid losses on a trade, your sell price must exceed your buy price by at least this breakeven points difference.
              </p>
            </div>
            <div className="p-3 rounded bg-background/30 border border-border/10 space-y-1.5">
              <span className="text-foreground font-bold block">2. Depository Participant (DP) Sell Charge</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Charged by CDSL/NSDL when delivery shares are debited from your demat account. It is flat per scrip per day (usually ₹13.5 to ₹20 depending on broker) and is levied only on Sell transactions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* October 2024 revised STT Ledger Table */}
      <Card className="border-border bg-card/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-mono font-bold">Latest STT/CTT Guidelines <span className="text-xs font-normal text-muted-foreground">(Effective Oct 1, 2024)</span></CardTitle>
          <p className="text-xs text-muted-foreground">Summary of the revised STT rates applied by the Ministry of Finance on F&O derivatives</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-t border-border/50">
              <thead>
                <tr className="bg-muted/10 border-b border-border/50 text-left">
                  <th className="px-5 py-3 font-bold text-muted-foreground">Market Segment</th>
                  <th className="px-5 py-3 font-bold text-muted-foreground">Buy Rate</th>
                  <th className="px-5 py-3 font-bold text-muted-foreground">Sell Rate</th>
                  <th className="px-5 py-3 font-bold text-muted-foreground">Oct 2024 Revision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-muted-foreground">
                <tr className="hover:bg-muted/5 transition-colors">
                  <td className="px-5 py-3 font-bold text-foreground">Equity Delivery</td>
                  <td className="px-5 py-3">0.10%</td>
                  <td className="px-5 py-3">0.10%</td>
                  <td className="px-5 py-3">Unchanged (calculated on turnover)</td>
                </tr>
                <tr className="hover:bg-muted/5 transition-colors">
                  <td className="px-5 py-3 font-bold text-foreground">Equity Intraday</td>
                  <td className="px-5 py-3">Nil</td>
                  <td className="px-5 py-3">0.025%</td>
                  <td className="px-5 py-3">Unchanged (calculated on sell turnover)</td>
                </tr>
                <tr className="hover:bg-muted/5 transition-colors">
                  <td className="px-5 py-3 font-bold text-foreground">F&O Futures</td>
                  <td className="px-5 py-3">Nil</td>
                  <td className="px-5 py-3 text-amber-500 font-bold">0.02%</td>
                  <td className="px-5 py-3 text-amber-500 font-semibold">Increased from 0.0125%</td>
                </tr>
                <tr className="hover:bg-muted/5 transition-colors">
                  <td className="px-5 py-3 font-bold text-foreground">F&O Options</td>
                  <td className="px-5 py-3">Nil</td>
                  <td className="px-5 py-3 text-amber-500 font-bold">0.10%</td>
                  <td className="px-5 py-3 text-amber-500 font-semibold">Increased from 0.0625% (on premium)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4: Evaluating the Best Broker Checklist */}
      <Card className="border-border bg-card/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-mono font-bold">How to Identify the Best Stockbroker</CardTitle>
          <p className="text-xs text-muted-foreground">A checklist to systematically review before opening a demat account</p>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-6">
          
          <Card className="border-border/50 bg-background/30 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 font-bold text-xs font-mono text-emerald-500">
                01
              </div>
              <h5 className="font-bold text-xs font-mono text-foreground uppercase tracking-wider">Review Total Costs</h5>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed leading-relaxed font-mono">
              Do not get lured by &quot;Zero Brokerage&quot; headlines alone. Double-check the broker&apos;s annual AMC charges, account opening fees, pledges charges, and dynamic DP sell scrip levies to understand the total cost per trade.
            </p>
          </Card>

          <Card className="border-border/50 bg-background/30 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 font-bold text-xs font-mono text-amber-500">
                02
              </div>
              <h5 className="font-bold text-xs font-mono text-foreground uppercase tracking-wider">Check Platform Uptime</h5>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed leading-relaxed font-mono">
              Low fee structures are useless if the trading platform lags or crashes during peak volatility hours (like budget days or major gap openings). Seek platforms offering excellent servers and high-speed execution.
            </p>
          </Card>

          <Card className="border-border/50 bg-background/30 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 font-bold text-xs font-mono text-purple-500">
                03
              </div>
              <h5 className="font-bold text-xs font-mono text-foreground uppercase tracking-wider">Charting & Strategies</h5>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed leading-relaxed font-mono">
              Experienced traders need high-fidelity charting tools (like TradingView layouts) and options strategy builders. Opt for brokers who offer API access for automated or custom algo integrations.
            </p>
          </Card>

        </CardContent>
      </Card>

      {/* SECTION 5: FAQs Accordion */}
      <Card className="border-border bg-card/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-mono font-bold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-emerald-500" />
            Frequently Asked Questions
          </CardTitle>
          <p className="text-xs text-muted-foreground">General queries about Indian broker structures and government transaction levies</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50 border-t border-border/50">
            {[
              {
                q: "What is Securities Transaction Tax (STT)?",
                a: "STT is a direct tax levied by the Government of India on the transaction of securities in the stock market (shares, derivatives, mutual funds). STT is levied at source to reduce tax evasion on stock earnings and is collected directly by the exchange (NSE/BSE) during order matching."
              },
              {
                q: "Why do brokers charge separate DP fees on Selling?",
                a: "DP (Depository Participant) charges represent administrative fees debited by NSDL or CDSL depositories to securely pull shares from your demat vault and send them to the clearing house. Because this transaction happens only during a Sell execution on delivery shares, DP charges are never charged on buys."
              },
              {
                q: "What are SEBI Turnover Fees?",
                a: "SEBI turnover charges are standard regulatory levies assessed by CDSL/NSE and forwarded directly to the Securities and Exchange Board of India. The current rate is ₹10 per ₹1 Crore of transaction volume (turnover), which is extremely small for standard retail volumes."
              },
              {
                q: "Can I avoid brokerage charges completely?",
                a: "Yes, many modern discount brokers (such as Zerodha, Dhan, Groww, INDmoney) offer completely free (₹0) brokerage for Equity Delivery long-term investments. However, intraday equity orders and F&O derivatives still attract standard flat ₹20 fees (or flat ₹10 on AllTimeTrader) across virtually all platforms."
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
