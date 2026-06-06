'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/store'
import { Calculator, Minus } from 'lucide-react'

export function BreakEvenCalculator() {
  const [buyPrice, setBuyPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [brokeragePerOrder, setBrokeragePerOrder] = useState('')
  const [otherChargesPercent, setOtherChargesPercent] = useState('')
  const [result, setResult] = useState<{
    breakEvenPrice: number
    totalCharges: number
    grossBreakEven: number
  } | null>(null)

  const calculate = () => {
    const bp = parseFloat(buyPrice)
    const qty = parseInt(quantity)
    const brokerage = parseFloat(brokeragePerOrder) || 0
    const otherPct = parseFloat(otherChargesPercent) || 0

    if (isNaN(bp) || isNaN(qty) || qty <= 0) return

    // Total brokerage (buy + sell)
    const totalBrokerage = brokerage * 2

    // Other charges as % of trade value (both sides)
    const buyValue = bp * qty
    const otherCharges = buyValue * (otherPct / 100) * 2

    const totalCharges = totalBrokerage + otherCharges

    // Break-even: need to cover total charges
    // (sellPrice * qty) - (buyPrice * qty) - totalCharges = 0
    // sellPrice = buyPrice + (totalCharges / qty)
    const breakEvenPrice = bp + totalCharges / qty

    setResult({
      breakEvenPrice,
      totalCharges,
      grossBreakEven: bp,
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Minus className="h-4 w-4 text-primary" />
            Break Even Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Buy Price (₹)</Label>
              <Input type="number" placeholder="1000" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Quantity</Label>
              <Input type="number" placeholder="10" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Brokerage Per Order (₹)</Label>
              <Input type="number" placeholder="20" value={brokeragePerOrder} onChange={(e) => setBrokeragePerOrder(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Other Charges (%)</Label>
              <Input type="number" placeholder="0.1" value={otherChargesPercent} onChange={(e) => setOtherChargesPercent(e.target.value)} className="bg-background border-border/50" />
            </div>
          </div>
          <Button onClick={calculate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1">
            <Calculator className="h-4 w-4" />
            Calculate Break Even
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="text-base text-primary">Break Even Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Break Even Price</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(result.breakEvenPrice)}</p>
                <p className="text-xs text-muted-foreground mt-1">Minimum sell price for no loss</p>
              </div>
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Charges</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(result.totalCharges)}</p>
              </div>
              <div className="rounded-lg bg-accent border border-border/50 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Buy Price</p>
                <p className="text-2xl font-bold">{formatCurrency(result.grossBreakEven)}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              You need to sell at {formatCurrency(result.breakEvenPrice)} or above to make a profit. 
              Charges eat up {formatCurrency(result.breakEvenPrice - result.grossBreakEven)} per share.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
