'use client'

import { useState, useEffect } from 'react'
import { useJournalStore, type Trade, type TradeStats } from './journal-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatIndianNumber, formatPercent } from '@/lib/store'
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  BookOpen,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

const STRATEGIES = ['Scalping', 'Intraday', 'Swing', 'Positional', 'Option Selling']

function StatCard({ title, value, subtext, color }: { title: string; value: string; subtext?: string; color?: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 text-center">
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <p className={`text-xl font-bold ${color || ''}`}>{value}</p>
      {subtext && <p className="text-[10px] text-muted-foreground mt-0.5">{subtext}</p>}
    </div>
  )
}

function StatsDashboard({ stats }: { stats: TradeStats }) {
  return (
    <Card className="border-border/50 bg-card mb-6">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Trading Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard title="Total Trades" value={String(stats.totalTrades)} />
          <StatCard title="Win Rate" value={formatPercent(stats.winRate)} subtext={`${stats.wins}W / ${stats.losses}L`} color={stats.winRate >= 50 ? 'text-primary' : 'text-red-400'} />
          <StatCard title="Total P&L" value={formatCurrency(stats.totalPnl)} color={stats.totalPnl >= 0 ? 'text-primary' : 'text-red-400'} />
          <StatCard title="Avg P&L/Trade" value={formatCurrency(stats.avgPnl)} color={stats.avgPnl >= 0 ? 'text-primary' : 'text-red-400'} />
          <StatCard title="Best Trade" value={formatCurrency(stats.bestTrade)} color="text-primary" />
          <StatCard title="Worst Trade" value={formatCurrency(stats.worstTrade)} color="text-red-400" />
          <StatCard title="Profit Factor" value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)} color={stats.profitFactor >= 1 ? 'text-primary' : 'text-red-400'} />
          <StatCard title="Avg Win / Avg Loss" value={`${formatCurrency(stats.avgWin)} / ${formatCurrency(stats.avgLoss)}`} />
        </div>
      </CardContent>
    </Card>
  )
}

export function TradingJournal() {
  const { trades, addTrade, deleteTrade, getTradeStats, hydrated, hydrate } = useJournalStore()

  // Hydrate from localStorage on mount
  useEffect(() => {
    hydrate()
  }, [hydrate])

  const stats = getTradeStats()

  const [open, setOpen] = useState(false)
  const [filterStrategy, setFilterStrategy] = useState('all')
  const [filterResult, setFilterResult] = useState<'all' | 'win' | 'loss'>('all')
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null)

  // Form state
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formSymbol, setFormSymbol] = useState('')
  const [formEntry, setFormEntry] = useState('')
  const [formExit, setFormExit] = useState('')
  const [formQty, setFormQty] = useState('')
  const [formDirection, setFormDirection] = useState<'long' | 'short'>('long')
  const [formStrategy, setFormStrategy] = useState('Intraday')
  const [formEmotionBefore, setFormEmotionBefore] = useState([3])
  const [formEmotionAfter, setFormEmotionAfter] = useState([3])
  const [formNotes, setFormNotes] = useState('')

  const resetForm = () => {
    setFormDate(new Date().toISOString().split('T')[0])
    setFormSymbol('')
    setFormEntry('')
    setFormExit('')
    setFormQty('')
    setFormDirection('long')
    setFormStrategy('Intraday')
    setFormEmotionBefore([3])
    setFormEmotionAfter([3])
    setFormNotes('')
  }

  const handleAddTrade = () => {
    if (!formSymbol || !formEntry || !formExit || !formQty) return

    addTrade({
      id: Date.now().toString(),
      date: formDate,
      symbol: formSymbol.toUpperCase(),
      entryPrice: parseFloat(formEntry),
      exitPrice: parseFloat(formExit),
      quantity: parseInt(formQty),
      direction: formDirection,
      strategy: formStrategy,
      emotionBefore: formEmotionBefore[0],
      emotionAfter: formEmotionAfter[0],
      notes: formNotes,
      createdAt: new Date().toISOString(),
    })

    resetForm()
    setOpen(false)
  }

  const getPnl = (trade: Trade) => {
    return trade.direction === 'long'
      ? (trade.exitPrice - trade.entryPrice) * trade.quantity
      : (trade.entryPrice - trade.exitPrice) * trade.quantity
  }

  const filteredTrades = trades.filter((t) => {
    if (filterStrategy !== 'all' && t.strategy !== filterStrategy) return false
    if (filterResult === 'win' && getPnl(t) <= 0) return false
    if (filterResult === 'loss' && getPnl(t) > 0) return false
    return true
  })

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Trading Journal
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1">
              <Plus className="h-4 w-4" />
              Add Trade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add New Trade</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="bg-background border-border/50" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Symbol</Label>
                  <Input placeholder="RELIANCE" value={formSymbol} onChange={(e) => setFormSymbol(e.target.value)} className="bg-background border-border/50" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Entry Price (₹)</Label>
                  <Input type="number" placeholder="0" value={formEntry} onChange={(e) => setFormEntry(e.target.value)} className="bg-background border-border/50" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Exit Price (₹)</Label>
                  <Input type="number" placeholder="0" value={formExit} onChange={(e) => setFormExit(e.target.value)} className="bg-background border-border/50" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Quantity</Label>
                  <Input type="number" placeholder="0" value={formQty} onChange={(e) => setFormQty(e.target.value)} className="bg-background border-border/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Direction</Label>
                  <Select value={formDirection} onValueChange={(v) => setFormDirection(v as 'long' | 'short')}>
                    <SelectTrigger className="bg-background border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Strategy</Label>
                  <Select value={formStrategy} onValueChange={setFormStrategy}>
                    <SelectTrigger className="bg-background border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STRATEGIES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Emotion Before Trade: {formEmotionBefore[0]}/5</Label>
                <Slider value={formEmotionBefore} onValueChange={setFormEmotionBefore} min={1} max={5} step={1} className="mt-2" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Emotion After Trade: {formEmotionAfter[0]}/5</Label>
                <Slider value={formEmotionAfter} onValueChange={setFormEmotionAfter} min={1} max={5} step={1} className="mt-2" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <Textarea placeholder="Trade notes..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} className="bg-background border-border/50" rows={3} />
              </div>
              <Button onClick={handleAddTrade} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Save Trade
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {trades.length > 0 && <StatsDashboard stats={stats} />}

      {/* Filters */}
      {trades.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterStrategy} onValueChange={setFilterStrategy}>
            <SelectTrigger className="w-36 bg-background border-border/50 text-sm">
              <SelectValue placeholder="Strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Strategies</SelectItem>
              {STRATEGIES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterResult} onValueChange={(v) => setFilterResult(v as typeof filterResult)}>
            <SelectTrigger className="w-28 bg-background border-border/50 text-sm">
              <SelectValue placeholder="Result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="win">Wins</SelectItem>
              <SelectItem value="loss">Losses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Trade Log */}
      {filteredTrades.length === 0 ? (
        <Card className="border-border/50 bg-card">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {trades.length === 0 ? 'No trades yet. Add your first trade!' : 'No trades match your filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Desktop table */}
          <div className="hidden md:block">
            <Card className="border-border/50 bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead>Exit</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrades.map((trade) => {
                    const pnl = getPnl(trade)
                    const isExpanded = expandedTrade === trade.id
                    return (
                      <>
                        <TableRow key={trade.id} className="border-border/30 cursor-pointer" onClick={() => setExpandedTrade(isExpanded ? null : trade.id)}>
                          <TableCell className="text-xs">{trade.date}</TableCell>
                          <TableCell className="font-semibold">{trade.symbol}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={trade.direction === 'long' ? 'border-primary/30 text-primary' : 'border-red-500/30 text-red-400'}>
                              {trade.direction.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(trade.entryPrice)}</TableCell>
                          <TableCell>{formatCurrency(trade.exitPrice)}</TableCell>
                          <TableCell>{trade.quantity}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{trade.strategy}</Badge>
                          </TableCell>
                          <TableCell className={`text-right font-bold ${pnl >= 0 ? 'text-primary' : 'text-red-400'}`}>
                            {formatCurrency(pnl)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => { e.stopPropagation(); deleteTrade(trade.id) }}
                            >
                              <Trash2 className="h-3 w-3 text-red-400" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${trade.id}-detail`} className="border-border/30 bg-accent/30">
                            <TableCell colSpan={9} className="px-6 py-3">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div><span className="text-muted-foreground">Emotion Before:</span> {trade.emotionBefore}/5</div>
                                <div><span className="text-muted-foreground">Emotion After:</span> {trade.emotionAfter}/5</div>
                                <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {trade.notes || '—'}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filteredTrades.map((trade) => {
              const pnl = getPnl(trade)
              return (
                <Card key={trade.id} className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{trade.symbol}</span>
                        <Badge variant="outline" className={trade.direction === 'long' ? 'border-primary/30 text-primary text-[10px]' : 'border-red-500/30 text-red-400 text-[10px]'}>
                          {trade.direction.toUpperCase()}
                        </Badge>
                      </div>
                      <span className={`font-bold ${pnl >= 0 ? 'text-primary' : 'text-red-400'}`}>
                        {formatCurrency(pnl)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>{trade.date}</div>
                      <div>Entry: {formatCurrency(trade.entryPrice)}</div>
                      <div>Exit: {formatCurrency(trade.exitPrice)}</div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="text-[10px]">{trade.strategy}</Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteTrade(trade.id)}>
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
