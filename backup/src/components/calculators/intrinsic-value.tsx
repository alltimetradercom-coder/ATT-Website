'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatPercent } from '@/lib/store'
import { Calculator, Diamond } from 'lucide-react'

type Method = 'graham' | 'dcf'

export function IntrinsicValueCalculator() {
  const [method, setMethod] = useState<Method>('graham')
  const [eps, setEps] = useState('')
  const [growthRate, setGrowthRate] = useState('')
  const [discountRate, setDiscountRate] = useState('') // For DCF / Y for Graham
  const [bookValue, setBookValue] = useState('') // For Graham Number
  const [currentPrice, setCurrentPrice] = useState('')
  const [result, setResult] = useState<{
    intrinsicValue: number
    marginOfSafety: number | null
    method: string
  } | null>(null)

  const calculate = () => {
    const e = parseFloat(eps)
    const g = parseFloat(growthRate) || 0
    const cp = parseFloat(currentPrice) || 0

    if (isNaN(e) || e <= 0) return

    let intrinsicValue: number
    let methodName: string

    if (method === 'graham') {
      const bv = parseFloat(bookValue)
      const y = parseFloat(discountRate) || 6.5 // Default AAA corporate bond yield

      if (!isNaN(bv) && bv > 0) {
        // Graham Number = √(22.5 × EPS × BVPS)
        intrinsicValue = Math.sqrt(22.5 * e * bv)
        methodName = 'Graham Number'
      } else {
        // Graham's Formula: IV = EPS × (8.5 + 2g) × 4.4 / Y
        intrinsicValue = e * (8.5 + 2 * g) * 4.4 / y
        methodName = "Graham's Formula"
      }
    } else {
      // Simplified DCF
      const r = parseFloat(discountRate) || 10
      const years = 10
      const terminalGrowth = 3
      const discountFactor = r / 100
      const termGrowthFactor = terminalGrowth / 100

      let totalPV = 0
      let futureEPS = e
      for (let yr = 1; yr <= years; yr++) {
        futureEPS = futureEPS * (1 + g / 100)
        totalPV += futureEPS / Math.pow(1 + discountFactor, yr)
      }

      // Terminal value
      const terminalValue = (futureEPS * (1 + termGrowthFactor)) / (discountFactor - termGrowthFactor)
      totalPV += terminalValue / Math.pow(1 + discountFactor, years)

      intrinsicValue = totalPV
      methodName = 'Simplified DCF'
    }

    const marginOfSafety = cp > 0 ? ((intrinsicValue - cp) / cp) * 100 : null

    setResult({
      intrinsicValue: Math.round(intrinsicValue * 100) / 100,
      marginOfSafety,
      method: methodName,
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Diamond className="h-4 w-4 text-primary" />
            Intrinsic Value Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Valuation Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as Method)}>
              <SelectTrigger className="bg-background border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="graham">Graham Number / Formula</SelectItem>
                <SelectItem value="dcf">Simplified DCF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">EPS (₹)</Label>
              <Input type="number" placeholder="50" value={eps} onChange={(e) => setEps(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Growth Rate (%)</Label>
              <Input type="number" placeholder="12" value={growthRate} onChange={(e) => setGrowthRate(e.target.value)} className="bg-background border-border/50" />
            </div>
            {method === 'graham' ? (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">Book Value Per Share (₹) — for Graham Number</Label>
                  <Input type="number" placeholder="300" value={bookValue} onChange={(e) => setBookValue(e.target.value)} className="bg-background border-border/50" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Corporate Bond Yield (Y) — default 6.5%</Label>
                  <Input type="number" placeholder="6.5" value={discountRate} onChange={(e) => setDiscountRate(e.target.value)} className="bg-background border-border/50" />
                </div>
              </>
            ) : (
              <div>
                <Label className="text-xs text-muted-foreground">Discount Rate (%)</Label>
                <Input type="number" placeholder="10" value={discountRate} onChange={(e) => setDiscountRate(e.target.value)} className="bg-background border-border/50" />
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">Current Market Price (₹) — optional</Label>
              <Input type="number" placeholder="1500" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} className="bg-background border-border/50" />
            </div>
          </div>
          <Button onClick={calculate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1">
            <Calculator className="h-4 w-4" />
            Calculate Intrinsic Value
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="text-base text-primary">Intrinsic Value — {result.method}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Intrinsic Value</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(result.intrinsicValue)}</p>
              </div>
              {result.marginOfSafety !== null && (
                <div className={`rounded-lg p-4 text-center ${
                  result.marginOfSafety > 0
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  <p className="text-xs text-muted-foreground mb-1">Margin of Safety</p>
                  <p className={`text-3xl font-bold ${result.marginOfSafety > 0 ? 'text-primary' : 'text-red-400'}`}>
                    {result.marginOfSafety > 0 ? '+' : ''}{result.marginOfSafety.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.marginOfSafety > 0 ? 'Stock is Undervalued' : 'Stock is Overvalued'}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              {method === 'graham' && bookValue ? (
                <p>Formula: Graham Number = √(22.5 × EPS × BVPS) = √(22.5 × {eps} × {bookValue})</p>
              ) : method === 'graham' ? (
                <p>Formula: IV = EPS × (8.5 + 2g) × 4.4 / Y = {eps} × (8.5 + 2×{growthRate}%) × 4.4 / {discountRate || 6.5}%</p>
              ) : (
                <p>Simplified DCF: 10-year EPS projection discounted at {discountRate || 10}% with terminal growth of 3%</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
