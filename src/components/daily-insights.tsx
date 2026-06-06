'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Target,
  Shield,
  Brain,
  ArrowRight,
  Sparkles,
  Clock,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

interface Insight {
  id: string
  category: 'strategy' | 'market' | 'risk' | 'psychology' | 'tool'
  title: string
  content: string
  actionable: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

const INSIGHTS_POOL: Insight[] = [
  {
    id: '1',
    category: 'strategy',
    title: 'The 1% Rule for Position Sizing',
    content: 'Never risk more than 1% of your total capital on a single trade. If your capital is ₹5,00,000, your maximum risk per trade should be ₹5,000. This ensures that even a string of losses won\'t wipe out your account, giving you staying power to recover and profit.',
    actionable: 'Use our Position Sizer tool to calculate the right quantity based on your stop-loss and risk tolerance.',
    icon: <Target className="h-5 w-5" />,
    color: '#10B981',
    bgColor: 'rgba(16,185,129,0.08)',
  },
  {
    id: '2',
    category: 'market',
    title: 'Pre-Market Preparation Checklist',
    content: 'Successful traders spend 30-60 minutes before market open analyzing global cues, FII/DII data, and overnight news. Check US market close, SGX Nifty levels, and any sector-specific news that could impact your watchlist stocks. This routine helps you form a clear bias for the day.',
    actionable: 'Create a pre-market checklist in your Trading Journal and fill it every morning before 9:00 AM.',
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.08)',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: '3',
    category: 'risk',
    title: 'Why Stop-Loss is Non-Negotiable',
    content: 'A trade without a stop-loss is gambling, not trading. Markets can gap down overnight, and without a predefined exit, a small loss can become catastrophic. Always set your stop-loss before entering a trade — never move it further away from your entry point. Treat it as your insurance premium.',
    actionable: 'Calculate your break-even price including all charges using our Break-Even Calculator before placing trades.',
    color: '#EF4444',
    bgColor: 'rgba(239,68,68,0.08)',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: '4',
    category: 'psychology',
    title: 'Revenge Trading Destroys Accounts',
    content: 'After a losing trade, the urge to "win it back" is intense but dangerous. Revenge trading leads to oversized positions, ignored stop-losses, and compounding losses. The market doesn\'t owe you anything — accept losses as the cost of doing business and stick to your plan.',
    actionable: 'Use the Mind Journal to log your emotional state after each trade and identify revenge trading patterns.',
    color: '#8B5CF6',
    bgColor: 'rgba(139,92,246,0.08)',
    icon: <Brain className="h-5 w-5" />,
  },
  {
    id: '5',
    category: 'tool',
    title: 'Averaging Down: Double-Edged Sword',
    content: 'Averaging down can reduce your breakeven price, but it also increases your position size in a losing trade. Only average down if your original thesis is still valid, the stock is in an uptrend on higher timeframes, and you have a clear exit plan. Never average down to avoid taking a loss.',
    actionable: 'Use our Stock Average Calculator to see the exact new average price and total capital at risk before averaging down.',
    color: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.08)',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: '6',
    category: 'strategy',
    title: 'The Power of Intraday Pivot Points',
    content: 'Pivot points provide objective support and resistance levels that many institutional traders watch. When price approaches a pivot level with volume confirmation, the probability of a bounce or reversal increases significantly. Use them as reference points, not absolute rules.',
    actionable: 'Use our Pivot Point Calculator to get daily levels for Nifty, Bank Nifty, and your favorite stocks.',
    color: '#10B981',
    bgColor: 'rgba(16,185,129,0.08)',
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: '7',
    category: 'market',
    title: 'Sector Rotation: Follow the Money',
    content: 'Money rotates between sectors — when banking weakens, IT or pharma often strengthens. Track sectoral indices daily and identify which sectors are leading and lagging. Trading the leading sector\'s strongest stock gives you a higher probability setup than trading a lagging sector.',
    actionable: 'Check the Market Snapshot section daily to track sectoral index performance and identify rotation.',
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.08)',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: '8',
    category: 'risk',
    title: 'The 2:1 Reward-to-Risk Minimum',
    content: 'If your potential profit is not at least twice your potential loss, the trade isn\'t worth taking. Even with a 40% win rate, a 2:1 reward-to-risk ratio keeps you profitable over time. Always calculate your R:R before entering — if it\'s below 2:1, wait for a better entry.',
    actionable: 'Before every trade, write down your entry, stop-loss, and target in your Trading Journal to enforce discipline.',
    color: '#EF4444',
    bgColor: 'rgba(239,68,68,0.08)',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: '9',
    category: 'psychology',
    title: 'Journaling: The Most Underrated Edge',
    content: 'The difference between a losing trader and a profitable one often comes down to self-awareness. Maintaining a trading journal helps you identify patterns in your behavior — which setups work for you, which times of day you trade best, and what emotional triggers lead to mistakes.',
    actionable: 'Start using the AllTimeTrader Trading Journal today. Log at least your last 10 trades and look for patterns.',
    color: '#8B5CF6',
    bgColor: 'rgba(139,92,246,0.08)',
    icon: <Brain className="h-5 w-5" />,
  },
  {
    id: '10',
    category: 'strategy',
    title: 'Fibonacci Levels Work — With Confirmation',
    content: 'Fibonacci retracement levels (38.2%, 50%, 61.8%) are not magic numbers — they work because millions of traders watch them. The key is using them as zones, not exact prices. Wait for candlestick confirmation (pin bar, engulfing) at Fibonacci levels before entering.',
    actionable: 'Use our Fibonacci Calculator to get retracement levels for any stock and plan your entries around key zones.',
    color: '#10B981',
    bgColor: 'rgba(16,185,129,0.08)',
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: '11',
    category: 'market',
    title: 'Option Pain: Where Maximum Pain Lies',
    content: 'Option Pain theory suggests that the market tends to move toward the price where the maximum number of options expire worthless. While not always accurate, it provides a useful reference point for monthly expiry trading. Combine it with support/resistance for higher confidence.',
    actionable: 'Check Option Pain levels for Nifty and Bank Nifty before expiry week to identify likely settlement zones.',
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.08)',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: '12',
    category: 'tool',
    title: 'Brokerage Eats Into Returns More Than You Think',
    content: 'For active traders, brokerage and charges can eat 2-5% of returns annually. A trader doing 200 trades/year paying ₹20/order on ₹50,000 trades loses ₹40,000 just in brokerage. Zero-delivery brokers save long-term investors money, while flat-fee brokers benefit high-value intraday traders.',
    actionable: 'Use our Brokerage Calculator to compare total charges across all brokers for your typical trade size.',
    color: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.08)',
    icon: <Zap className="h-5 w-5" />,
  },
]

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  strategy: { label: 'Strategy', color: '#10B981' },
  market: { label: 'Market Intel', color: '#3B82F6' },
  risk: { label: 'Risk Mgmt', color: '#EF4444' },
  psychology: { label: 'Psychology', color: '#8B5CF6' },
  tool: { label: 'Tool Tip', color: '#F59E0B' },
}

export function DailyInsights() {
  const [mounted, setMounted] = useState(false)
  const [todaysInsights, setTodaysInsights] = useState<Insight[]>([])
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    // Pick 4 random insights based on the day (changes daily)
    const today = new Date()
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()

    // Simple seeded shuffle
    const shuffled = [...INSIGHTS_POOL].sort((a, b) => {
      const hashA = (seed * a.id.charCodeAt(0)) % 100
      const hashB = (seed * b.id.charCodeAt(0)) % 100
      return hashA - hashB
    })

    // Pick one from each category if possible, then fill remaining
    const categories = ['strategy', 'market', 'risk', 'psychology']
    const selected: Insight[] = []

    categories.forEach((cat) => {
      const found = shuffled.find((i) => i.category === cat && !selected.includes(i))
      if (found) selected.push(found)
    })

    // Fill to 4 if needed
    while (selected.length < 4) {
      const next = shuffled.find((i) => !selected.includes(i))
      if (next) selected.push(next)
      else break
    }

    setTodaysInsights(selected)
  }, [])

  const filteredInsights = activeFilter === 'all'
    ? todaysInsights
    : todaysInsights.filter((i) => i.category === activeFilter)

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (!mounted) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Daily Insights from <span className="text-primary">AllTimeTrader</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading today&apos;s insights...</p>
          </div>
        </div>

        {/* Insights Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/30 bg-card/50 h-[220px] animate-pulse">
              <CardContent className="p-5 space-y-4">
                <div className="h-4 bg-muted rounded w-1/4 mt-4" />
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Daily Insights from <span className="text-primary">AllTimeTrader</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{dateStr}</p>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Actionable trading wisdom refreshed daily. Apply these insights to trade smarter.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-muted/50 text-muted-foreground border border-transparent hover:text-foreground'
          }`}
        >
          All Insights
        </button>
        {Object.entries(CATEGORY_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              activeFilter === key
                ? 'border'
                : 'bg-muted/50 text-muted-foreground border border-transparent hover:text-foreground'
            }`}
            style={activeFilter === key ? {
              backgroundColor: `${meta.color}20`,
              color: meta.color,
              borderColor: `${meta.color}40`,
            } : {}}
          >
            {meta.label}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInsights.map((insight) => (
          <Card
            key={insight.id}
            className="border-border/30 bg-card hover:border-border/60 transition-all duration-300 overflow-hidden group"
            style={{ borderLeftWidth: '3px', borderLeftColor: insight.color }}
          >
            <CardContent className="p-5">
              {/* Category badge + Icon */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: insight.bgColor, color: insight.color }}
                  >
                    {insight.icon}
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-medium"
                    style={{
                      borderColor: `${insight.color}40`,
                      color: insight.color,
                    }}
                  >
                    {CATEGORY_META[insight.category]?.label}
                  </Badge>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">
                {insight.title}
              </h3>

              {/* Content */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {expandedId === insight.id
                  ? insight.content
                  : insight.content.slice(0, 150) + (insight.content.length > 150 ? '...' : '')
                }
              </p>

              {/* Expand/collapse */}
              {insight.content.length > 150 && (
                <button
                  onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
                >
                  {expandedId === insight.id ? 'Show less' : 'Read more'}
                </button>
              )}

              {/* Actionable tip */}
              <div
                className="rounded-lg p-3 mt-2"
                style={{ backgroundColor: insight.bgColor }}
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: insight.color }} />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: insight.color }}>
                      Actionable Tip
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {insight.actionable}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          New insights every trading day. Bookmark this page and check back daily.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary">
            <RefreshCw className="h-3 w-3" />
            Refreshes daily at 8:00 AM
          </Badge>
        </div>
      </div>
    </section>
  )
}
