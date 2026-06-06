'use client'

import { useAppStore, CALCULATORS } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight,
  Calculator,
  TrendingUp,
  IndianRupee,
  Target,
  Scale,
  Crosshair,
  BarChart3,
  GitBranch,
  Minus,
  ArrowDown,
  Landmark,
  Diamond,
} from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Calculator,
  TrendingUp,
  IndianRupee,
  Target,
  Scale,
  Crosshair,
  BarChart3,
  GitBranch,
  Minus,
  ArrowDown,
  Landmark,
  Diamond,
}

const USAGE_COUNTS: Record<string, string> = {
  'stock-average': '12.5K',
  'sip': '15.2K',
  'brokerage': '8.7K',
  'option-pain': '5.3K',
  'position-sizer': '6.1K',
  'pivot-point': '7.8K',
  'cagr': '9.4K',
  'fibonacci': '6.9K',
  'break-even': '4.2K',
  'swp': '3.8K',
  'margin': '5.6K',
  'intrinsic-value': '4.1K',
}

const RATINGS: Record<string, string> = {
  'stock-average': '4.9',
  'sip': '4.8',
  'brokerage': '4.7',
  'option-pain': '4.6',
  'position-sizer': '4.7',
  'pivot-point': '4.8',
  'cagr': '4.7',
  'fibonacci': '4.6',
  'break-even': '4.5',
  'swp': '4.5',
  'margin': '4.6',
  'intrinsic-value': '4.5',
}

export function ToolCards() {
  const { openCalculator } = useAppStore()

  return (
    <section id="tools-section" className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          FREE TRADING{' '}
          <span className="text-primary">CALCULATORS</span>
        </h2>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base">
          Tools that Indian traders actually use daily
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {CALCULATORS.map((tool) => {
          const IconComp = ICON_MAP[tool.icon] || Calculator
          return (
            <div
              key={tool.id}
              onClick={() => openCalculator(tool.id)}
              className="group relative flex flex-col p-5 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-xs hover:border-primary/30 hover:bg-card/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_-10px_rgba(16,185,129,0.08),0_4px_12px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              {/* Badge */}
              {tool.badge && (
                <div className="absolute -top-2.5 right-4 z-10">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-card border border-primary/30 shadow-xs ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>
              )}

              {/* Icon & Title */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <IconComp className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1 pr-4">
                {tool.description}
              </p>

              {/* Bottom Row */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/20 group-hover:border-border/40 transition-colors">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-medium">
                  <span className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/5 px-1.5 py-0.5 rounded-md text-amber-600 dark:text-amber-500 font-semibold">
                    <span className="text-[9px]">★</span> {RATINGS[tool.id]}
                  </span>
                  <span>•</span>
                  <span>{USAGE_COUNTS[tool.id]} users</span>
                </div>
                
                <div className="flex items-center text-[10px] font-semibold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Open <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
