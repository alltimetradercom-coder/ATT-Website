'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/store'
import { Calculator, Crosshair } from 'lucide-react'

type Method = 'classic' | 'fibonacci' | 'camarilla' | 'woodie' | 'demmark'

interface PivotResult {
  pp: number
  r1: number; r2: number; r3: number; r4: number
  s1: number; s2: number; s3: number; s4: number
}

export function PivotPointCalculator() {
  const [high, setHigh] = useState('')
  const [low, setLow] = useState('')
  const [close, setClose] = useState('')
  const [open, setOpen] = useState('')
  const [method, setMethod] = useState<Method>('classic')
  const [result, setResult] = useState<PivotResult | null>(null)

  const calculate = () => {
    const H = parseFloat(high)
    const L = parseFloat(low)
    const C = parseFloat(close)
    const O = parseFloat(open)
    if (isNaN(H) || isNaN(L) || isNaN(C)) return

    let res: PivotResult

    switch (method) {
      case 'classic':
      default: {
        const pp = (H + L + C) / 3
        res = {
          pp,
          r1: 2 * pp - L,
          r2: pp + (H - L),
          r3: H + 2 * (pp - L),
          r4: 0,
          s1: 2 * pp - H,
          s2: pp - (H - L),
          s3: L - 2 * (H - pp),
          s4: 0,
        }
        break
      }
      case 'fibonacci': {
        const pp = (H + L + C) / 3
        res = {
          pp,
          r1: pp + 0.382 * (H - L),
          r2: pp + 0.618 * (H - L),
          r3: pp + (H - L),
          r4: 0,
          s1: pp - 0.382 * (H - L),
          s2: pp - 0.618 * (H - L),
          s3: pp - (H - L),
          s4: 0,
        }
        break
      }
      case 'camarilla': {
        res = {
          pp: (H + L + C) / 3,
          r4: C + (H - L) * 1.1 / 2,
          r3: C + (H - L) * 1.1 / 4,
          r2: C + (H - L) * 1.1 / 6,
          r1: C + (H - L) * 1.1 / 12,
          s1: C - (H - L) * 1.1 / 12,
          s2: C - (H - L) * 1.1 / 6,
          s3: C - (H - L) * 1.1 / 4,
          s4: C - (H - L) * 1.1 / 2,
        }
        break
      }
      case 'woodie': {
        const pp = (H + L + 2 * C) / 4
        res = {
          pp,
          r1: 2 * pp - L,
          r2: pp + (H - L),
          r3: H + 2 * (pp - L),
          r4: 0,
          s1: 2 * pp - H,
          s2: pp - (H - L),
          s3: L - 2 * (H - pp),
          s4: 0,
        }
        break
      }
      case 'demmark': {
        // DeMark requires Open price
        let x: number
        if (!isNaN(O)) {
          if (C < O) x = H + 2 * L + C
          else if (C > O) x = 2 * H + L + C
          else x = H + L + 2 * C
        } else {
          // Fallback if no open price provided
          x = H + L + 2 * C
        }
        const pp = x / 4
        res = {
          pp,
          r1: x / 2 - L,
          r2: pp + (H - L),
          r3: H + 2 * (pp - L),
          r4: 0,
          s1: x / 2 - H,
          s2: pp - (H - L),
          s3: L - 2 * (H - pp),
          s4: 0,
        }
        break
      }
    }

    setResult(res)
  }

  const formatLevel = (v: number) => isNaN(v) || v === 0 ? '—' : formatCurrency(v)

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-primary" />
            Pivot Point Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">High Price</Label>
              <Input type="number" placeholder="18500" value={high} onChange={(e) => setHigh(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Low Price</Label>
              <Input type="number" placeholder="18200" value={low} onChange={(e) => setLow(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Close Price</Label>
              <Input type="number" placeholder="18400" value={close} onChange={(e) => setClose(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className={`text-xs ${method === 'demmark' ? 'text-amber-400 font-medium' : 'text-muted-foreground'}`}>
                Open Price {method === 'demmark' ? '(Required for DeMark)' : '(Optional)'}
              </Label>
              <Input type="number" placeholder="18300" value={open} onChange={(e) => setOpen(e.target.value)} className="bg-background border-border/50" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as Method)}>
              <SelectTrigger className="bg-background border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="fibonacci">Fibonacci</SelectItem>
                <SelectItem value="camarilla">Camarilla</SelectItem>
                <SelectItem value="woodie">Woodie</SelectItem>
                <SelectItem value="demmark">DeMark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={calculate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1">
            <Calculator className="h-4 w-4" />
            Calculate Pivot Points
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="text-base text-primary capitalize">{method} Pivot Points</CardTitle>
          </CardHeader>
          <CardContent>
            {/* PP */}
            <div className="rounded-lg bg-accent border border-border/50 p-4 text-center mb-4">
              <p className="text-xs text-muted-foreground mb-1">Pivot Point (PP)</p>
              <p className="text-3xl font-bold">{formatLevel(result.pp)}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Resistance */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary mb-2">Resistance Levels</h4>
                {[
                  { label: 'R3', value: result.r3 },
                  { label: 'R2', value: result.r2 },
                  { label: 'R1', value: result.r1 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-2">
                    <span className="text-sm font-medium text-primary">{label}</span>
                    <span className="font-semibold">{formatLevel(value)}</span>
                  </div>
                ))}
                {result.r4 !== 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-2">
                    <span className="text-sm font-medium text-primary">R4</span>
                    <span className="font-semibold">{formatLevel(result.r4)}</span>
                  </div>
                )}
              </div>

              {/* Support */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-red-400 mb-2">Support Levels</h4>
                {[
                  { label: 'S1', value: result.s1 },
                  { label: 'S2', value: result.s2 },
                  { label: 'S3', value: result.s3 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between rounded-lg bg-red-500/5 border border-red-500/20 px-4 py-2">
                    <span className="text-sm font-medium text-red-400">{label}</span>
                    <span className="font-semibold">{formatLevel(value)}</span>
                  </div>
                ))}
                {result.s4 !== 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-red-500/5 border border-red-500/20 px-4 py-2">
                    <span className="text-sm font-medium text-red-400">S4</span>
                    <span className="font-semibold">{formatLevel(result.s4)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
