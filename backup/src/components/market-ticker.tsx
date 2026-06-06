'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Activity, Radio, Clock } from 'lucide-react'

interface MarketItem {
  id: string
  name: string
  price: number
  change: number
  changePercent: number
  status: 'live' | 'stale' | 'fallback' | 'error'
}

interface MarketData {
  timestamp: number
  marketOpen: boolean
  data: MarketItem[]
  status?: string
}

// Format number in Indian style
function formatIndian(num: number, decimals = 2): string {
  const fixed = Math.abs(num).toFixed(decimals)
  const parts = fixed.split('.')
  let intPart = parts[0]

  if (intPart.length > 3) {
    const last3 = intPart.slice(-3)
    const remaining = intPart.slice(0, -3)
    intPart = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3
  }

  return (num < 0 ? '-' : '') + intPart + '.' + parts[1]
}

// Individual ticker item
function TickerItem({ item }: { item: MarketItem }) {
  const isUp = item.change >= 0
  const isVix = item.id === 'indiavix'
  const isUsdinr = item.id === 'usdinr'

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
      {/* Name */}
      <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground tracking-wide">
        {item.name}
      </span>

      {/* Price */}
      <span className="text-[11px] sm:text-xs font-bold text-foreground">
        {isUsdinr ? '' : '₹'}{formatIndian(item.price, isVix ? 2 : 2)}
      </span>

      {/* Change + arrow */}
      <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
        {isUp ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {isUp ? '+' : ''}{formatIndian(item.change, 2)}
      </span>

      {/* Change % */}
      <span className={`text-[10px] sm:text-xs font-medium ${isUp ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
        ({isUp ? '+' : ''}{item.changePercent.toFixed(2)}%)
      </span>
    </div>
  )
}

export function MarketTicker() {
  const [data, setData] = useState<MarketData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/market-data')
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setLastUpdated(new Date())
      }
    } catch {
      // Silent fail — keep showing last good data
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Refresh every 30 seconds during market hours, every 5 min after hours
    const interval = setInterval(() => {
      fetchData()
    }, 30_000)

    return () => clearInterval(interval)
  }, [fetchData])

  // Time display
  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })
    : '--:--:--'

  return (
    <div className="w-full border-b border-border/30 bg-muted/30 dark:bg-[#0f1225]/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex items-center justify-between h-9 sm:h-10 gap-2">
          {/* Market data items */}
          <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar flex-1">
            {isLoading ? (
              // Skeleton loading
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2 animate-pulse">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-3 w-14 bg-muted rounded" />
                </div>
              ))
            ) : data?.data ? (
              data.data.map((item) => (
                <TickerItem key={item.id} item={item} />
              ))
            ) : null}
          </div>

          {/* Right side: Market status + time */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {data?.marketOpen ? (
              <div className="flex items-center gap-1">
                <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium text-emerald-500 hidden sm:inline">
                  LIVE
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground hidden sm:inline">
                  Closed
                </span>
              </div>
            )}
            <span className="text-[10px] text-muted-foreground/70 font-mono tabular-nums">
              IST {timeStr}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
