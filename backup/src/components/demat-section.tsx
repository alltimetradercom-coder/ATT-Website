'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { BROKERS, type BrokerData } from '@/data/brokers'
import { BrokerLogo, BrokerLogoInline } from '@/components/broker-logo'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Star,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  TrendingUp,
  Users,
  Zap,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
} from 'lucide-react'

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i <= fullStars
              ? 'fill-yellow-400 text-yellow-400'
              : i === fullStars + 1 && hasHalf
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
      <span className={`ml-1 ${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

function BrokerCard({ broker, isExpanded, onToggle }: { broker: BrokerData; isExpanded: boolean; onToggle: () => void }) {
  return (
    <Card
      className={`border transition-all duration-300 overflow-hidden ${
        broker.highlighted
          ? 'border-primary/50 shadow-lg shadow-primary/5'
          : 'border-border/50 hover:border-border'
      }`}
    >
      <CardContent className="p-0">
        {/* Main Row */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Logo */}
            <BrokerLogo broker={broker} size="lg" />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg">{broker.name}</h3>
                {broker.badge && (
                  <Badge
                    className="text-[10px] font-semibold px-2 py-0"
                    style={{
                      backgroundColor: `${broker.badgeColor}20`,
                      color: broker.badgeColor,
                      borderColor: `${broker.badgeColor}40`,
                    }}
                  >
                    {broker.badge}
                  </Badge>
                )}
                {broker.isReferralPartner && (
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[9px]">
                    Referral Partner
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{broker.tagline}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <StarRating rating={broker.rating} size="sm" />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {broker.activeClients}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  SEBI
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <Button
                size="sm"
                className="gap-1 text-xs font-semibold"
                style={{
                  backgroundColor: broker.brandColor,
                  color: '#fff',
                }}
                asChild
              >
                <a href={broker.referralUrl} target="_blank" rel="noopener noreferrer">
                  Open Account
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
              <button
                onClick={onToggle}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
              >
                {isExpanded ? 'Less' : 'Details'}
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Quick Fees Row */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Opening</p>
              <p className={`text-sm font-bold ${broker.accountOpeningFee === 0 ? 'text-primary' : ''}`}>
                {broker.accountOpeningFee === 0 ? 'FREE' : `₹${broker.accountOpeningFee}`}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Delivery</p>
              <p className="text-sm font-bold text-primary">₹0</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Intraday</p>
              <p className="text-sm font-bold">₹{broker.intradayFlat}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-[10px] sm:text-xs text-muted-foreground">AMC</p>
              <p className={`text-sm font-bold ${broker.amcAnnual === 0 ? 'text-primary' : ''}`}>
                {broker.amcAnnual === 0 ? 'FREE' : `₹${broker.amcAnnual}/yr`}
              </p>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-border/30 px-4 sm:px-5 pb-4 pt-3 bg-muted/10">
            {/* Detailed Fees */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-yellow-400" />
                Brokerage Charges
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                <div className="flex justify-between p-1.5 rounded bg-background/50">
                  <span className="text-muted-foreground text-xs">Equity Delivery</span>
                  <span className="font-semibold text-primary text-xs">₹0</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-background/50">
                  <span className="text-muted-foreground text-xs">Intraday</span>
                  <span className="font-semibold text-xs">₹{broker.intradayFlat}/order</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-background/50">
                  <span className="text-muted-foreground text-xs">F&O</span>
                  <span className="font-semibold text-xs">₹{broker.optionsFlat}/order</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-background/50">
                  <span className="text-muted-foreground text-xs">Futures</span>
                  <span className="font-semibold text-xs">₹{broker.futuresFlat}/order</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-background/50">
                  <span className="text-muted-foreground text-xs">AMC</span>
                  <span className={`font-semibold text-xs ${broker.amcAnnual === 0 ? 'text-primary' : ''}`}>
                    {broker.amcAnnual === 0 ? '₹0 (Free)' : `₹${broker.amcAnnual}/year`}
                  </span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-background/50">
                  <span className="text-muted-foreground text-xs">Opening</span>
                  <span className={`font-semibold text-xs ${broker.accountOpeningFee === 0 ? 'text-primary' : ''}`}>
                    {broker.accountOpeningFee === 0 ? '₹0 (Free)' : `₹${broker.accountOpeningFee}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Features & Platforms
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                {[
                  { label: 'Research', available: broker.hasResearch },
                  { label: 'Mutual Funds', available: broker.hasMutualFunds },
                  { label: 'IPO', available: broker.hasIPO },
                  { label: 'Smallcase', available: broker.hasSmallcase },
                  { label: 'Margin Trading', available: broker.hasMarginTrading },
                  { label: 'Commodities', available: broker.hasCommodities },
                  { label: 'Currency', available: broker.hasCurrency },
                  { label: 'US Stocks', available: broker.hasUsStocks },
                  { label: 'Algo Trading', available: broker.hasAlgoTrading },
                ].map((feat) => (
                  <div key={feat.label} className="flex items-center gap-1 p-1">
                    {feat.available ? (
                      <Check className="h-3 w-3 text-primary flex-shrink-0" />
                    ) : (
                      <X className="h-3 w-3 text-red-400/50 flex-shrink-0" />
                    )}
                    <span className={feat.available ? '' : 'text-muted-foreground/60'}>{feat.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {broker.platforms.map((p) => (
                  <Badge key={p} variant="outline" className="text-[10px] border-border/40">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5 text-primary" />
                  Pros
                </h4>
                <ul className="space-y-1">
                  {broker.pros.slice(0, 3).map((pro, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1">
                  <ThumbsDown className="h-3.5 w-3.5 text-red-400" />
                  Cons
                </h4>
                <ul className="space-y-1">
                  {broker.cons.slice(0, 3).map((con, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <X className="h-3 w-3 text-red-400 mt-0.5 flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Best For */}
            <div className="mt-3 p-2 rounded-lg border border-border/30 bg-background/50">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Best for:</span> {broker.bestFor}
              </p>
            </div>

            {/* Expanded CTA */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Since {broker.founded} &bull; {broker.activeClients} active clients
              </p>
              <Button
                size="sm"
                className="gap-1 text-xs font-semibold"
                style={{
                  backgroundColor: broker.brandColor,
                  color: '#fff',
                }}
                asChild
              >
                <a href={broker.referralUrl} target="_blank" rel="noopener noreferrer">
                  {broker.referralText}
                  <ArrowRight className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[800px] text-sm">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left py-3 px-2 font-semibold text-primary">Broker</th>
            <th className="text-center py-3 px-2 font-semibold">Opening</th>
            <th className="text-center py-3 px-2 font-semibold">Delivery</th>
            <th className="text-center py-3 px-2 font-semibold">Intraday</th>
            <th className="text-center py-3 px-2 font-semibold">F&O</th>
            <th className="text-center py-3 px-2 font-semibold">AMC</th>
            <th className="text-center py-3 px-2 font-semibold">Rating</th>
            <th className="text-center py-3 px-2 font-semibold">Features</th>
            <th className="text-right py-3 px-2 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {BROKERS.map((broker) => (
            <tr
              key={broker.id}
              className={`border-b border-border/20 transition-colors hover:bg-muted/30 ${
                broker.highlighted ? 'bg-primary/5' : ''
              }`}
            >
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <BrokerLogoInline broker={broker} size="sm" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm">{broker.name}</span>
                      {broker.badge && (
                        <Badge
                          className="text-[8px] px-1 py-0"
                          style={{
                            backgroundColor: `${broker.badgeColor}20`,
                            color: broker.badgeColor,
                            borderColor: `${broker.badgeColor}40`,
                          }}
                        >
                          {broker.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{broker.activeClients} clients</p>
                  </div>
                </div>
              </td>
              <td className="text-center py-3 px-2">
                <span className={broker.accountOpeningFee === 0 ? 'text-primary font-semibold' : ''}>
                  {broker.accountOpeningFee === 0 ? 'FREE' : `₹${broker.accountOpeningFee}`}
                </span>
              </td>
              <td className="text-center py-3 px-2 text-primary font-semibold">₹0</td>
              <td className="text-center py-3 px-2 font-semibold">₹{broker.intradayFlat}</td>
              <td className="text-center py-3 px-2 font-semibold">₹{broker.optionsFlat}</td>
              <td className="text-center py-3 px-2">
                <span className={broker.amcAnnual === 0 ? 'text-primary font-semibold' : ''}>
                  {broker.amcAnnual === 0 ? 'FREE' : `₹${broker.amcAnnual}/yr`}
                </span>
              </td>
              <td className="text-center py-3 px-2">
                <StarRating rating={broker.rating} size="sm" />
              </td>
              <td className="text-center py-3 px-2">
                <div className="flex flex-wrap gap-0.5 justify-center">
                  {broker.hasResearch && <Badge variant="outline" className="text-[8px] px-1 py-0">Research</Badge>}
                  {broker.hasMutualFunds && <Badge variant="outline" className="text-[8px] px-1 py-0">MF</Badge>}
                  {broker.hasIPO && <Badge variant="outline" className="text-[8px] px-1 py-0">IPO</Badge>}
                  {broker.hasAlgoTrading && <Badge variant="outline" className="text-[8px] px-1 py-0">Algo</Badge>}
                  {broker.hasUsStocks && <Badge variant="outline" className="text-[8px] px-1 py-0">US</Badge>}
                </div>
              </td>
              <td className="text-right py-3 px-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs"
                  style={{
                    borderColor: `${broker.brandColor}50`,
                    color: broker.brandColor,
                  }}
                  asChild
                >
                  <a href={broker.referralUrl} target="_blank" rel="noopener noreferrer">
                    Open
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DematSection() {
  const { setView } = useAppStore()
  const [expandedBroker, setExpandedBroker] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  const toggleBroker = (id: string) => {
    setExpandedBroker(expandedBroker === id ? null : id)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary">SEBI Registered Brokers</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Compare & Open{' '}
          <span className="text-primary">Demat Account</span>
        </h2>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
          Choose the best demat account for your trading style. All brokers listed are SEBI-registered
          with transparent fee structures. Zero delivery brokerage across all platforms.
        </p>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {BROKERS.filter(b => b.highlighted || b.badge).map((broker) => (
          <div
            key={broker.id}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-border/30 bg-card hover:border-border/60 transition-colors"
          >
            <BrokerLogo broker={broker} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{broker.name}</p>
              {broker.badge && (
                <p className="text-[10px] font-medium" style={{ color: broker.badgeColor }}>
                  {broker.badge}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">All Brokers</h3>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'cards' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'table' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Broker Cards View */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          {BROKERS.map((broker) => (
            <BrokerCard
              key={broker.id}
              broker={broker}
              isExpanded={expandedBroker === broker.id}
              onToggle={() => toggleBroker(broker.id)}
            />
          ))}
        </div>
      )}

      {/* Table View (Desktop) */}
      {viewMode === 'table' && (
        <Card className="border-border/50 bg-card overflow-hidden">
          <ComparisonTable />
        </Card>
      )}

      {/* Info boxes */}
      <div className="mt-8 space-y-3">
        <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Our Recommendation</p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">For beginners:</strong> Angel One — Zero opening fee, zero AMC, plus free
              research reports and stock recommendations to help you get started confidently.
              <br />
              <strong className="text-foreground">For active traders:</strong> Zerodha — Most reliable platform with
              excellent charting, fastest execution, and the largest trader community in India.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Referral Disclosure</p>
            <p className="text-sm text-muted-foreground">
              We earn referral commission from marked brokers when you open an account through our links.
              This does not affect your account opening charges or brokerage fees — you pay the same
              as going directly. Commissions help us keep AllTimeTrader free for all users.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
