'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { TrendingUp, BarChart3, Activity } from 'lucide-react'

const MARKETS = [
  { symbol: 'NSE:NIFTY50', title: 'NIFTY 50', icon: TrendingUp, color: '#10B981' },
  { symbol: 'NSE:BANKNIFTY', title: 'BANK NIFTY', icon: BarChart3, color: '#3B82F6' },
  { symbol: 'NSE:INDIAVIX', title: 'INDIA VIX', icon: Activity, color: '#F59E0B' },
]

function TradingViewWidget({ symbol, title, icon: Icon, color }: { symbol: string; title: string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!containerRef.current) return

    // Clear any previous widget
    containerRef.current.innerHTML = ''

    // Outer wrapper div (required by TradingView)
    const wrapper = document.createElement('div')
    wrapper.className = 'tradingview-widget-container'
    wrapper.style.height = '220px'
    wrapper.style.width = '100%'

    // Inner widget target div
    const inner = document.createElement('div')
    inner.className = 'tradingview-widget-container__widget'
    inner.style.height = '220px'
    inner.style.width = '100%'
    wrapper.appendChild(inner)

    // Inline config script — MUST come before the embed script
    const configScript = document.createElement('script')
    configScript.type = 'text/javascript'
    configScript.text = JSON.stringify({
      symbols: [[symbol, symbol + '|1D']],
      chartOnly: false,
      width: '100%',
      height: 220,
      locale: 'in',
      colorTheme: resolvedTheme === 'dark' ? 'dark' : 'light',
      isTransparent: true,
      autosize: true,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: 'right',
      scaleMode: 'Normal',
      fontFamily: 'inherit',
      fontSize: '10',
      noTimeScale: false,
      valuesTracking: '1',
      changeMode: 'price-and-percent',
      chartType: 'area',
      lineWidth: 2,
      lineType: 0,
      dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W', 'all|1M'],
    })
    wrapper.appendChild(configScript)

    // External embed script
    const embedScript = document.createElement('script')
    embedScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js'
    embedScript.async = true
    wrapper.appendChild(embedScript)

    containerRef.current.appendChild(wrapper)
  }, [symbol, resolvedTheme])

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground ml-auto">NSE</span>
      </div>
      {/* containerRef handles full widget injection — no React children inside */}
      <div className="min-h-[220px]" ref={containerRef} />
    </div>
  )
}

export function MarketSnapshot() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          MARKET{' '}
          <span className="text-primary">SNAPSHOT</span>
        </h2>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base">
          Powered by TradingView
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MARKETS.map((market) => (
          <TradingViewWidget
            key={market.symbol}
            symbol={market.symbol}
            title={market.title}
            icon={market.icon}
            color={market.color}
          />
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground/50 mt-4">
        Data delayed. Not for trading decisions.
      </p>
    </section>
  )
}
