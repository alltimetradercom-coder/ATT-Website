'use client'

import { useState, useMemo } from 'react'
import { BROKERS, MARGIN_RATES } from '@/data/brokers'
import { BrokerLogoInline } from '@/components/broker-logo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatIndianNumber } from '@/lib/store'
import { Landmark, RotateCcw, Info, ChevronDown, ChevronUp, ExternalLink, Shield } from 'lucide-react'

export function MarginCalculator() {
  const [stockPrice, setStockPrice] = useState('1500')
  const [lotSize, setLotSize] = useState('1')
  const [quantity, setQuantity] = useState('100')
  const [segment, setSegment] = useState<'delivery' | 'intraday' | 'futures'>('intraday')
  const [selectedBrokerId, setSelectedBrokerId] = useState('zerodha')
  const [customMarginPct, setCustomMarginPct] = useState('')
  const [showFaq, setShowFaq] = useState<number | null>(null)

  const resetAll = () => {
    setStockPrice('1500'); setLotSize('1'); setQuantity('100'); setSegment('intraday'); setSelectedBrokerId('zerodha'); setCustomMarginPct('')
  }

  const selectedBroker = BROKERS.find(b => b.id === selectedBrokerId) || BROKERS[0]

  const result = useMemo(() => {
    const price = parseFloat(stockPrice) || 0
    const qty = segment === 'futures' ? (parseInt(lotSize) || 1) * (parseInt(quantity) || 1) : (parseInt(quantity) || 0)
    const customPct = parseFloat(customMarginPct)

    if (price <= 0 || qty <= 0) return null

    let marginPct = isNaN(customPct) || customPct <= 0
      ? MARGIN_RATES[selectedBroker.name]?.[segment] || 20
      : customPct

    const totalValue = price * qty
    const requiredMargin = totalValue * (marginPct / 100)
    const leverage = marginPct > 0 ? 100 / marginPct : 0
    const buyingPower = requiredMargin > 0 ? leverage : 0

    return { totalValue, requiredMargin, leverage, marginPct, qty, buyingPower }
  }, [stockPrice, lotSize, quantity, segment, selectedBrokerId, customMarginPct])

  const allBrokerMargins = useMemo(() => {
    if (!result) return []
    const price = parseFloat(stockPrice) || 0
    if (price <= 0) return []

    return BROKERS.map(broker => {
      const marginPct = MARGIN_RATES[broker.name]?.[segment] || 20
      const totalValue = result.totalValue
      const requiredMargin = totalValue * (marginPct / 100)
      return { broker, marginPct, requiredMargin, leverage: 100 / marginPct }
    }).sort((a, b) => a.requiredMargin - b.requiredMargin)
  }, [result, stockPrice, segment])

  const faqs = [
    { q: 'What is margin trading?', a: 'Margin trading allows you to buy more shares than your capital would normally permit by borrowing from your broker. For example, with 20% margin (5x leverage), ₹20,000 capital lets you buy shares worth ₹1,00,000. SEBI regulates margin requirements in India to protect investors and maintain market stability.' },
    { q: 'What is the difference between MIS, NRML, and CNC?', a: 'MIS (Margin Intraday Square-off): Intraday orders with higher leverage (3-5x). Auto-squared off before 3:15 PM. NRML (Normal): Carry-forward positions with standard margin. No auto square-off. CNC (Cash and Carry): Delivery trades requiring 100% margin (no leverage). Only MIS and NRML offer leverage — CNC is for long-term investing.' },
    { q: 'What are the risks of margin trading?', a: 'Margin amplifies both profits AND losses. With 5x leverage, a 10% price drop means 50% loss on your capital. If your position falls below the maintenance margin, your broker will issue a margin call or automatically square off your position. Never use margin for investments you can\'t afford to lose, and always use stop-losses with leveraged positions.' },
    { q: 'How does lot size affect F&O margin?', a: 'In F&O, you trade in lots, not individual shares. NIFTY lot size = 25 units, BANKNIFTY = 15 units. Total margin = Lot size × Number of lots × Price × Margin%. For NIFTY at 22000 with 50% margin: 25 × 1 × 22000 × 0.50 = ₹2,75,000 per lot. Each additional lot adds the same margin amount.' },
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
                LIVE CALCULATOR · SEBI Margin Rules
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Calculate Your{' '}
                <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Margin Requirements</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                Know exactly how much margin you need before placing a trade. Compare across brokers, segments, and order types.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={() => { const el = document.getElementById('margin-inputs'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                  <Landmark className="h-4 w-4" /> Calculate Now
                </button>
                <button onClick={resetAll} className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-5 py-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <RotateCcw className="h-4 w-4 text-primary" /> Reset
                </button>
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-3 shrink-0">
              {[
                { val: '7+', label: 'Brokers Compared', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { val: '3', label: 'Segment Types', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { val: 'SEBI', label: 'Compliant Rates', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
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
      <section id="margin-inputs" className="grid lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/50 via-primary/50 to-amber-500/50" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-mono font-bold">
                <Landmark className="h-5 w-5 text-emerald-500" /> Margin Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Stock Price (₹)</Label>
                  <Input type="number" placeholder="1500" value={stockPrice} onChange={(e) => setStockPrice(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                    {segment === 'futures' ? 'No. of Lots' : 'Quantity'}
                  </Label>
                  <Input type="number" placeholder="100" value={segment === 'futures' ? quantity : quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                </div>
              </div>
              {segment === 'futures' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Lot Size</Label>
                  <Input type="number" placeholder="25" value={lotSize} onChange={(e) => setLotSize(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
                  <p className="text-[10px] text-muted-foreground">NIFTY=25, BANKNIFTY=15, FINNIFTY=25</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Broker</Label>
                  <Select value={selectedBrokerId} onValueChange={setSelectedBrokerId}>
                    <SelectTrigger className="bg-background/50 border-border/50 font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BROKERS.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Segment</Label>
                  <Select value={segment} onValueChange={(v) => setSegment(v as typeof segment)}>
                    <SelectTrigger className="bg-background/50 border-border/50 font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery">CNC (Delivery)</SelectItem>
                      <SelectItem value="intraday">MIS (Intraday)</SelectItem>
                      <SelectItem value="futures">NRML (Futures)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">Custom Margin % (leave empty for broker rate)</Label>
                <Input type="number" placeholder="Auto" value={customMarginPct} onChange={(e) => setCustomMarginPct(e.target.value)} className="bg-background/50 border-border/50 font-mono text-sm font-bold" />
              </div>

              {/* Broker info badge */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                <BrokerLogoInline broker={selectedBroker} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{selectedBroker.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {segment === 'delivery' && `Delivery: ${MARGIN_RATES[selectedBroker.name]?.delivery || 100}% (No leverage)`}
                    {segment === 'intraday' && `Intraday: ${MARGIN_RATES[selectedBroker.name]?.intraday || 20}% margin (${(100 / (MARGIN_RATES[selectedBroker.name]?.intraday || 20)).toFixed(1)}x)`}
                    {segment === 'futures' && `Futures: ${MARGIN_RATES[selectedBroker.name]?.futures || 50}% margin (${(100 / (MARGIN_RATES[selectedBroker.name]?.futures || 50)).toFixed(1)}x)`}
                  </p>
                </div>
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
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
              {/* Required Margin */}
              <div className="att-result-card rounded-xl border border-primary/30 bg-card p-6 text-center">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Required Margin</p>
                <p className="text-4xl font-bold text-primary font-mono">{formatCurrency(result.requiredMargin)}</p>
                <p className="text-xs text-muted-foreground mt-2">{selectedBroker.name} · {segment === 'delivery' ? 'CNC' : segment === 'intraday' ? 'MIS' : 'NRML'}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Trade Value</div>
                  <div className="font-mono font-bold text-lg">{formatCurrency(result.totalValue)}</div>
                </div>
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Leverage</div>
                  <div className="font-mono font-bold text-lg text-[var(--att-gold)]">{result.leverage.toFixed(1)}x</div>
                </div>
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Margin %</div>
                  <div className="font-mono font-bold text-lg">{result.marginPct}%</div>
                </div>
                <div className="att-result-card rounded-xl border border-border bg-card p-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Quantity</div>
                  <div className="font-mono font-bold text-lg">{formatIndianNumber(result.qty).split('.')[0]}</div>
                </div>
              </div>

              {/* Broker Comparison */}
              {allBrokerMargins.length > 0 && (
                <Card className="border-border/50 bg-card/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono font-bold">Compare Margin Across Brokers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {allBrokerMargins.map(({ broker, marginPct, requiredMargin: reqMargin, leverage }) => (
                      <div key={broker.id} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${broker.id === selectedBrokerId ? 'border-primary/50 bg-primary/5' : 'border-border/30 hover:bg-muted/30'}`}>
                        <BrokerLogoInline broker={broker} size="xs" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold">{broker.name}</span>
                            {broker.id === selectedBrokerId && <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] px-1">Selected</Badge>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold font-mono">{formatCurrency(reqMargin)}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{marginPct}% &bull; {leverage.toFixed(1)}x</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Formula */}
              <div className="att-formula-block text-xs">
                Required Margin = Trade Value × Margin% = {formatCurrency(result.totalValue)} × {result.marginPct}% = {formatCurrency(result.requiredMargin)}<br />
                Leverage = 100 / Margin% = 100 / {result.marginPct} = {result.leverage.toFixed(1)}x
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader><CardTitle className="text-sm font-mono font-bold flex items-center gap-2"><Info className="h-4 w-4 text-emerald-500" /> Margin Trading in India</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="att-formula-block text-xs">
              Required Margin = Stock Price × Quantity × Margin%<br />
              Leverage = 100 ÷ Margin%<br />
              Buying Power = Capital × Leverage
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              SEBI regulates margin requirements for all Indian brokers. Delivery (CNC) requires 100% margin. Intraday (MIS) typically needs 20-25%. F&O (NRML) requires ~50% for futures. Margin requirements may increase for volatile stocks or during special events.
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
