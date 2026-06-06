'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatIndianNumber } from '@/lib/store'
import { Calculator, Scale } from 'lucide-react'

export function PositionSizerCalculator() {
  const [accountSize, setAccountSize] = useState('')
  const [riskPercent, setRiskPercent] = useState('')
  const [entryPrice, setEntryPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [result, setResult] = useState<{
    riskAmount: number
    positionSize: number
    positionValue: number
    riskPerShare: number
  } | null>(null)

  const calculate = () => {
    const account = parseFloat(accountSize)
    const risk = parseFloat(riskPercent) / 100
    const entry = parseFloat(entryPrice)
    const sl = parseFloat(stopLoss)

    if (isNaN(account) || isNaN(risk) || isNaN(entry) || isNaN(sl)) return
    if (entry === sl) return

    const riskAmount = account * risk
    const riskPerShare = Math.abs(entry - sl)
    const positionSize = Math.floor(riskAmount / riskPerShare)
    const positionValue = positionSize * entry

    setResult({ riskAmount, positionSize, positionValue, riskPerShare })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            Position Sizing Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Account Size (₹)</Label>
              <Input type="number" placeholder="100000" value={accountSize} onChange={(e) => setAccountSize(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Risk Per Trade (%)</Label>
              <Input type="number" placeholder="2" value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Entry Price (₹)</Label>
              <Input type="number" placeholder="500" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Stop Loss Price (₹)</Label>
              <Input type="number" placeholder="480" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="bg-background border-border/50" />
            </div>
          </div>
          <Button onClick={calculate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1">
            <Calculator className="h-4 w-4" />
            Calculate Position Size
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="text-base text-primary">Position Size Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Risk Amount</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(result.riskAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">Max you can lose on this trade</p>
              </div>
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Position Size</p>
                <p className="text-2xl font-bold text-primary">{formatIndianNumber(result.positionSize).split('.')[0]} shares</p>
              </div>
              <div className="rounded-lg bg-accent border border-border/50 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Position Value</p>
                <p className="text-2xl font-bold">{formatCurrency(result.positionValue)}</p>
              </div>
              <div className="rounded-lg bg-accent border border-border/50 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Risk Per Share</p>
                <p className="text-2xl font-bold">{formatCurrency(result.riskPerShare)}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Formula: Position Size = Risk Amount / (Entry - StopLoss) = {formatCurrency(result.riskAmount)} / {formatCurrency(result.riskPerShare)} = {formatIndianNumber(result.positionSize).split('.')[0]} shares
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
