'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/store'
import { Calculator, Target, Plus, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

interface StrikeRow {
  id: string
  strike: string
  callOI: string
  putOI: string
}

export function OptionPainCalculator() {
  const [rows, setRows] = useState<StrikeRow[]>([
    { id: '1', strike: '', callOI: '', putOI: '' },
    { id: '2', strike: '', callOI: '', putOI: '' },
    { id: '3', strike: '', callOI: '', putOI: '' },
  ])
  const [result, setResult] = useState<{
    painPoint: number
    chartData: { strike: number; totalValue: number }[]
  } | null>(null)

  const addRow = () => {
    setRows([...rows, { id: Date.now().toString(), strike: '', callOI: '', putOI: '' }])
  }

  const removeRow = (id: string) => {
    if (rows.length > 2) {
      setRows(rows.filter((r) => r.id !== id))
    }
  }

  const updateRow = (id: string, field: keyof StrikeRow, value: string) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const calculate = () => {
    const parsed = rows
      .map((r) => ({
        strike: parseFloat(r.strike),
        callOI: parseFloat(r.callOI) || 0,
        putOI: parseFloat(r.putOI) || 0,
      }))
      .filter((r) => !isNaN(r.strike))

    if (parsed.length < 2) return

    // Calculate total option value at each strike
    const chartData = parsed.map(({ strike, callOI, putOI }) => {
      let totalValue = 0

      // For each strike, calculate total value of all options if they expire at this strike
      for (const row of parsed) {
        // Call options: value = max(0, strike - row.strike) * row.callOI
        const callValue = Math.max(0, strike - row.strike) * row.callOI
        // Put options: value = max(0, row.strike - strike) * row.putOI
        const putValue = Math.max(0, row.strike - strike) * row.putOI
        totalValue += callValue + putValue
      }

      return { strike, totalValue: Math.round(totalValue) }
    })

    // Pain point is the strike with minimum total option value
    const painPoint = chartData.reduce((min, curr) =>
      curr.totalValue < min.totalValue ? curr : min
    ).strike

    setResult({ painPoint, chartData })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Option Chain Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-xs text-muted-foreground mb-2">
            Enter strike prices with Call & Put Open Interest
          </div>
          {rows.map((row) => (
            <div key={row.id} className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Strike Price</Label>
                <Input
                  type="number"
                  placeholder="18000"
                  value={row.strike}
                  onChange={(e) => updateRow(row.id, 'strike', e.target.value)}
                  className="bg-background border-border/50"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Call OI</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={row.callOI}
                  onChange={(e) => updateRow(row.id, 'callOI', e.target.value)}
                  className="bg-background border-border/50"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Put OI</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={row.putOI}
                  onChange={(e) => updateRow(row.id, 'putOI', e.target.value)}
                  className="bg-background border-border/50"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 2}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex gap-3">
            <Button variant="outline" onClick={addRow} className="gap-1 text-sm">
              <Plus className="h-4 w-4" />
              Add Strike
            </Button>
            <Button
              onClick={calculate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1"
            >
              <Calculator className="h-4 w-4" />
              Calculate Pain Point
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="border-primary/30 bg-card">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Option Pain Point</p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(result.painPoint)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum option writers profit at this strike price
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Total Option Value at Each Strike</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="strike" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : String(v)} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                      labelStyle={{ color: '#9ca3af' }}
                      formatter={(value: number) => [value.toLocaleString('en-IN'), 'Total Value']}
                      labelFormatter={(label) => `Strike: ${label}`}
                    />
                    <Bar dataKey="totalValue" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.strike === result.painPoint ? '#10B981' : '#374151'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
