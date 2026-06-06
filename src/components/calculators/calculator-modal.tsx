'use client'

import { useState, useEffect } from 'react'
import { useAppStore, CALCULATORS } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Home, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { StockAverageCalculator } from './stock-average'
import { SipCalculator } from './sip-calculator'
import { BrokerageCalculator } from './brokerage-calculator'
import { OptionPainCalculator } from './option-pain'
import { PositionSizerCalculator } from './position-sizer'
import { PivotPointCalculator } from './pivot-point'
import { CagrCalculator } from './cagr-calculator'
import { FibonacciCalculator } from './fibonacci-calculator'
import { BreakEvenCalculator } from './break-even'
import { SwpCalculator } from './swp-calculator'
import { MarginCalculator } from './margin-calculator'
import { IntrinsicValueCalculator } from './intrinsic-value'

const CALCULATOR_COMPONENTS: Record<string, React.ComponentType> = {
  'stock-average': StockAverageCalculator,
  'sip': SipCalculator,
  'brokerage': BrokerageCalculator,
  'option-pain': OptionPainCalculator,
  'position-sizer': PositionSizerCalculator,
  'pivot-point': PivotPointCalculator,
  'cagr': CagrCalculator,
  'fibonacci': FibonacciCalculator,
  'break-even': BreakEvenCalculator,
  'swp': SwpCalculator,
  'margin': MarginCalculator,
  'intrinsic-value': IntrinsicValueCalculator,
}

function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-8 w-20 rounded-lg bg-accent/20 animate-pulse" />
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-accent"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">{resolvedTheme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  )
}

export function CalculatorModal() {
  const { activeCalculator, goHome } = useAppStore()
  const { resolvedTheme } = useTheme()

  const calcInfo = CALCULATORS.find((c) => c.id === activeCalculator)
  const CalcComponent = activeCalculator ? CALCULATOR_COMPONENTS[activeCalculator] : null

  // Stock Average, SIP, and Brokerage get a full-width immersive layout
  const isFullWidth = activeCalculator === 'stock-average' || activeCalculator === 'sip' || activeCalculator === 'brokerage'

  if (!activeCalculator || !CalcComponent || !calcInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground mb-4">No calculator selected</p>
        <Button onClick={goHome} variant="outline" className="gap-2">
          <Home className="h-4 w-4" />
          Go Home
        </Button>
      </div>
    )
  }

  // Full-width layout for stock-average
  if (isFullWidth) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Top bar with breadcrumb + theme toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={goHome} className="hover:text-primary transition-colors flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Home
            </button>
            <span>/</span>
            <span>Calculators</span>
            <span>/</span>
            <span className="text-foreground">{calcInfo.name}</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Calculator Component */}
        <CalcComponent />
      </div>
    )
  }

  // Standard layout for other calculators
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={goHome} className="hover:text-primary transition-colors flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Home
          </button>
          <span>/</span>
          <span>Calculators</span>
          <span>/</span>
          <span className="text-foreground">{calcInfo.name}</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {calcInfo.name}
        </h1>
        <p className="mt-1 text-muted-foreground">{calcInfo.description}</p>
      </div>

      {/* Calculator Component */}
      <CalcComponent />
    </div>
  )
}
