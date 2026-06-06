'use client'

import { useState } from 'react'
import { BROKERS, MARGIN_RATES, type BrokerData } from '@/data/brokers'
import { BrokerLogo, BrokerLogoInline } from '@/components/broker-logo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/store'
import { Calculator, Landmark, ExternalLink, TrendingUp, Shield } from 'lucide-react'

export function MarginCalculator() {
  const [stockPrice, setStockPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [marginPercent, setMarginPercent] = useState('')
  const [segment, setSegment] = useState<'delivery' | 'intraday' | 'futures'>('intraday')
  const [selectedBrokerId, setSelectedBrokerId] = useState('zerodha')
  const [result, setResult] = useState<{
    totalValue: number
    requiredMargin: number
    leverage: number
    marginPercent: number
  } | null>(null)

  const selectedBroker = BROKERS.find(b => b.id === selectedBrokerId) || BROKERS[0]

  const calculate = () => {
    const price = parseFloat(stockPrice)
    const qty = parseInt(quantity)

    if (isNaN(price) || isNaN(qty) || price <= 0 || qty <= 0) return

    // Use broker margin rate if custom not provided
    let marginPct = parseFloat(marginPercent)
    if (isNaN(marginPct) || marginPct <= 0) {
      marginPct = MARGIN_RATES[selectedBroker.name]?.[segment] || 20
    }

    const totalValue = price * qty
    const requiredMargin = totalValue * (marginPct / 100)
    const leverage = 100 / marginPct

    setResult({
      totalValue,
      requiredMargin,
      leverage,
      marginPercent: marginPct,
    })
  }

  // Compare all brokers for the same trade
  const getAllBrokerMargins = () => {
    const price = parseFloat(stockPrice)
    const qty = parseInt(quantity)
    if (isNaN(price) || isNaN(qty) || price <= 0 || qty <= 0) return []

    return BROKERS.map(broker => {
      const marginPct = MARGIN_RATES[broker.name]?.[segment] || 20
      const totalValue = price * qty
      const requiredMargin = totalValue * (marginPct / 100)
      return {
        broker,
        marginPct,
        requiredMargin,
        leverage: 100 / marginPct,
      }
    }).sort((a, b) => a.requiredMargin - b.requiredMargin)
  }

  const brokerMargins = result ? getAllBrokerMargins() : []

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Landmark className="h-4 w-4 text-primary" />
            Margin Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Stock Price (₹)</Label>
              <Input type="number" placeholder="500" value={stockPrice} onChange={(e) => setStockPrice(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Quantity</Label>
              <Input type="number" placeholder="100" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Broker</Label>
              <Select value={selectedBrokerId} onValueChange={setSelectedBrokerId}>
                <SelectTrigger className="bg-background border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BROKERS.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      <div className="flex items-center gap-2">
                        {b.name}
                        {b.isReferralPartner && (
                          <span className="text-[9px] text-orange-400">Referral</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Segment</Label>
              <Select value={segment} onValueChange={(v) => setSegment(v as typeof segment)}>
                <SelectTrigger className="bg-background border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="intraday">Intraday</SelectItem>
                  <SelectItem value="futures">Futures</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Custom Margin % (leave empty to use broker rate)</Label>
            <Input type="number" placeholder="Auto" value={marginPercent} onChange={(e) => setMarginPercent(e.target.value)} className="bg-background border-border/50" />
          </div>

          {/* Selected broker info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
            <BrokerLogoInline broker={selectedBroker} size="sm" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{selectedBroker.name}</p>
              <p className="text-xs text-muted-foreground">
                {segment === 'delivery' && `Delivery: ${MARGIN_RATES[selectedBroker.name]?.delivery || 100}% margin required`}
                {segment === 'intraday' && `Intraday: ${MARGIN_RATES[selectedBroker.name]?.intraday || 20}% margin (${(100 / (MARGIN_RATES[selectedBroker.name]?.intraday || 20)).toFixed(1)}x leverage)`}
                {segment === 'futures' && `Futures: ${MARGIN_RATES[selectedBroker.name]?.futures || 50}% margin (${(100 / (MARGIN_RATES[selectedBroker.name]?.futures || 50)).toFixed(1)}x leverage)`}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              SEBI
            </div>
          </div>

          <Button onClick={calculate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1">
            <Calculator className="h-4 w-4" />
            Calculate Margin
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="text-base text-primary flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Margin Results — {selectedBroker.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg bg-accent border border-border/50 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Trade Value</p>
                <p className="text-2xl font-bold">{formatCurrency(result.totalValue)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Required Margin</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(result.requiredMargin)}</p>
              </div>
              <div className="rounded-lg bg-accent border border-border/50 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Margin Requirement</p>
                <p className="text-2xl font-bold">{result.marginPercent}%</p>
              </div>
              <div className="rounded-lg bg-accent border border-border/50 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Leverage</p>
                <p className="text-2xl font-bold">{result.leverage.toFixed(1)}x</p>
              </div>
            </div>

            {/* Broker Comparison */}
            {brokerMargins.length > 0 && (
              <div className="border-t border-border/30 pt-4">
                <h4 className="text-sm font-semibold mb-3">Compare Margin Across Brokers</h4>
                <div className="space-y-2">
                  {brokerMargins.map(({ broker, marginPct, requiredMargin: reqMargin, leverage }) => (
                    <div
                      key={broker.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                        broker.id === selectedBrokerId
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border/30 hover:bg-muted/30'
                      }`}
                    >
                      <BrokerLogoInline broker={broker} size="xs" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold">{broker.name}</span>
                          {broker.id === selectedBrokerId && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] px-1">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatCurrency(reqMargin)}</p>
                        <p className="text-[10px] text-muted-foreground">{marginPct}% margin &bull; {leverage.toFixed(1)}x</p>
                      </div>
                      {broker.isReferralPartner && (
                        <Button variant="ghost" size="sm" className="text-primary text-xs gap-0.5 h-7" asChild>
                          <a href={broker.referralUrl} target="_blank" rel="noopener noreferrer">
                            Open <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
              You need {formatCurrency(result.requiredMargin)} margin to take a position worth {formatCurrency(result.totalValue)}.
              Leverage: {result.leverage.toFixed(1)}x. Margin requirements may vary based on stock-specific rules.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
