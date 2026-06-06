'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatIndianNumber } from '@/lib/store'
import { Calculator, ArrowDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'

export function SwpCalculator() {
  const [totalInvestment, setTotalInvestment] = useState('')
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState('')
  const [annualReturn, setAnnualReturn] = useState('')
  const [period, setPeriod] = useState('')
  const [result, setResult] = useState<{
    chartData: { month: number; balance: number; withdrawn: number }[]
    totalWithdrawn: number
    remainingBalance: number
    depletionMonth: number | null
  } | null>(null)

  const calculate = () => {
    const investment = parseFloat(totalInvestment)
    const withdrawal = parseFloat(monthlyWithdrawal)
    const rate = parseFloat(annualReturn) / 100 / 12
    const months = parseInt(period) * 12

    if (isNaN(investment) || isNaN(withdrawal) || isNaN(rate) || isNaN(months)) return
    if (investment <= 0 || withdrawal <= 0 || months <= 0) return

    let balance = investment
    let totalWithdrawn = 0
    let depletionMonth: number | null = null
    const chartData = [{ month: 0, balance: Math.round(balance), withdrawn: 0 }]

    for (let m = 1; m <= months; m++) {
      // Monthly return
      balance = balance * (1 + rate)
      // Withdraw
      balance -= withdrawal
      totalWithdrawn += withdrawal

      if (balance < 0) {
        balance = 0
        if (depletionMonth === null) depletionMonth = m
      }

      chartData.push({
        month: m,
        balance: Math.round(Math.max(0, balance)),
        withdrawn: Math.round(totalWithdrawn),
      })

      if (balance <= 0) break
    }

    setResult({
      chartData,
      totalWithdrawn: Math.round(totalWithdrawn),
      remainingBalance: Math.round(Math.max(0, balance)),
      depletionMonth,
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowDown className="h-4 w-4 text-primary" />
            SWP Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Total Investment (₹)</Label>
              <Input type="number" placeholder="1000000" value={totalInvestment} onChange={(e) => setTotalInvestment(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Monthly Withdrawal (₹)</Label>
              <Input type="number" placeholder="10000" value={monthlyWithdrawal} onChange={(e) => setMonthlyWithdrawal(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Expected Annual Return (%)</Label>
              <Input type="number" placeholder="8" value={annualReturn} onChange={(e) => setAnnualReturn(e.target.value)} className="bg-background border-border/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Period (years)</Label>
              <Input type="number" placeholder="15" value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-background border-border/50" />
            </div>
          </div>
          <Button onClick={calculate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1">
            <Calculator className="h-4 w-4" />
            Calculate SWP
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="border-primary/30 bg-card">
            <CardHeader>
              <CardTitle className="text-base text-primary">SWP Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-accent border border-border/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Withdrawn</p>
                  <p className="text-2xl font-bold">{formatCurrency(result.totalWithdrawn)}</p>
                </div>
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Remaining Balance</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(result.remainingBalance)}</p>
                </div>
                <div className="rounded-lg bg-accent border border-border/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Fund Depletes</p>
                  <p className="text-2xl font-bold">
                    {result.depletionMonth
                      ? `Year ${(result.depletionMonth / 12).toFixed(1)}`
                      : 'Never (within period)'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Balance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `Y${(v / 12).toFixed(0)}`} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => '₹' + (v >= 100000 ? (v / 100000).toFixed(0) + 'L' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : String(v))} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} formatter={(value: number, name: string) => [formatCurrency(value), name === 'balance' ? 'Balance' : 'Total Withdrawn']} labelFormatter={(label) => `Month ${label}`} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                    <Line type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="withdrawn" stroke="#6B7280" strokeWidth={1} strokeDasharray="5 5" dot={false} />
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
