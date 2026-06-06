'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/store'
import { Calculator, GitBranch } from 'lucide-react'

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]

export function FibonacciCalculator() {
  const [high, setHigh] = useState('')
  const [low, setLow] = useState('')
  const [trend, setTrend] = useState<'uptrend' | 'downtrend'>('uptrend')
  const [result, setResult] = useState<{ level: number; price: number }[] | null>(null)

  const calculate = () => {
    const H = parseFloat(high)
    const L = parseFloat(low)
    if (isNaN(H) || isNaN(L) || H <= L) return

    const diff = H - L
    const levels = FIB_LEVELS.map((ratio) => {
      let price: number
      if (trend === 'uptrend') {
        price = H - diff * ratio
      } else {
        price = L + diff * ratio
      }
      return { level: ratio, price: Math.round(price * 100) / 100 }
    })

    setResult(levels)
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            Fibonacci Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">High Price</Label>
              <Input type="number" placeholder="18500" value={high} onChange={(e) => setHigh(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Low Price</Label>
              <Input type="number" placeholder="17800" value={low} onChange={(e) => setLow(e.target.value)} className="bg-background border-border/50" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Trend Direction</Label>
            <Select value={trend} onValueChange={(v) => setTrend(v as 'uptrend' | 'downtrend')}>
              <SelectTrigger className="bg-background border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uptrend">Uptrend (Retracement Down)</SelectItem>
                <SelectItem value="downtrend">Downtrend (Retracement Up)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={calculate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1">
            <Calculator className="h-4 w-4" />
            Calculate Fibonacci Levels
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="text-base text-primary">
              Fibonacci Retracement Levels ({trend === 'uptrend' ? 'Uptrend' : 'Downtrend'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.map(({ level, price }) => {
                const percent = (level * 100).toFixed(1)
                const isKeyLevel = level === 0.382 || level === 0.5 || level === 0.618
                const isExtreme = level === 0 || level === 1
                return (
                  <div
                    key={level}
                    className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${
                      isKeyLevel
                        ? 'bg-primary/10 border border-primary/20'
                        : isExtreme
                        ? 'bg-accent border border-border/50'
                        : 'bg-accent/50 border border-border/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isKeyLevel ? 'bg-primary' : isExtreme ? 'bg-white' : 'bg-muted-foreground'
                        }`}
                      />
                      <span className={`text-sm font-medium ${isKeyLevel ? 'text-primary' : ''}`}>
                        {percent}%
                      </span>
                    </div>
                    <span className={`font-semibold ${isKeyLevel ? 'text-primary' : ''}`}>
                      {formatCurrency(price)}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {trend === 'uptrend'
                ? 'For Uptrend: Level = High - (High-Low) × ratio'
                : 'For Downtrend: Level = Low + (High-Low) × ratio'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
