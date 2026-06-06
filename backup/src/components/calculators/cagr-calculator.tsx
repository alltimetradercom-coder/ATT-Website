'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatPercent } from '@/lib/store'
import { Calculator, BarChart3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function CagrCalculator() {
  const [initialValue, setInitialValue] = useState('')
  const [finalValue, setFinalValue] = useState('')
  const [years, setYears] = useState('')
  const [result, setResult] = useState<{
    cagr: number
    absoluteReturn: number
    chartData: { year: number; value: number }[]
  } | null>(null)

  const calculate = () => {
    const iv = parseFloat(initialValue)
    const fv = parseFloat(finalValue)
    const n = parseFloat(years)

    if (isNaN(iv) || isNaN(fv) || isNaN(n) || iv <= 0 || n <= 0) return

    const cagr = Math.pow(fv / iv, 1 / n) - 1
    const absoluteReturn = ((fv - iv) / iv) * 100

    // Growth chart
    const chartData = []
    for (let y = 0; y <= n; y++) {
      chartData.push({
        year: y,
        value: Math.round(iv * Math.pow(1 + cagr, y)),
      })
    }

    setResult({ cagr: cagr * 100, absoluteReturn, chartData })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            CAGR Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Initial Value (₹)</Label>
              <Input type="number" placeholder="100000" value={initialValue} onChange={(e) => setInitialValue(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Final Value (₹)</Label>
              <Input type="number" placeholder="250000" value={finalValue} onChange={(e) => setFinalValue(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Time Period (years)</Label>
              <Input type="number" placeholder="5" value={years} onChange={(e) => setYears(e.target.value)} className="bg-background border-border/50" />
            </div>
          </div>
          <Button onClick={calculate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1">
            <Calculator className="h-4 w-4" />
            Calculate CAGR
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="border-primary/30 bg-card">
            <CardHeader>
              <CardTitle className="text-base text-primary">CAGR Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">CAGR</p>
                  <p className="text-3xl font-bold text-primary">{result.cagr.toFixed(2)}%</p>
                </div>
                <div className="rounded-lg bg-accent border border-border/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Absolute Return</p>
                  <p className="text-3xl font-bold">{result.absoluteReturn.toFixed(2)}%</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Formula: CAGR = (FV/IV)^(1/n) - 1 = ({formatCurrency(parseFloat(finalValue))}/{formatCurrency(parseFloat(initialValue))})^(1/{years}) - 1 = {result.cagr.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Growth Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 12 }} label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: '#9ca3af' }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => '₹' + (v >= 100000 ? (v / 100000).toFixed(0) + 'L' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : String(v))} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} formatter={(value: number) => [formatCurrency(value), 'Value']} />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
