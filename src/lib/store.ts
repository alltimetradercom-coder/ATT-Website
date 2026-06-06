'use client'

import { create } from 'zustand'

export type View = 'home' | 'calculator' | 'journal' | 'mind-journal' | 'demat'

interface AppStore {
  currentView: View
  activeCalculator: string | null
  setView: (view: View) => void
  openCalculator: (id: string) => void
  goHome: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  currentView: 'home',
  activeCalculator: null,
  setView: (view) => set({ currentView: view, activeCalculator: view === 'calculator' ? null : null }),
  openCalculator: (id) => set({ currentView: 'calculator', activeCalculator: id }),
  goHome: () => set({ currentView: 'home', activeCalculator: null }),
}))

export const CALCULATORS = [
  { id: 'stock-average', name: 'Stock Average Calculator', description: 'Calculate your average stock price', icon: 'Calculator', badge: '✅ Popular', badgeColor: 'text-primary' },
  { id: 'sip', name: 'SIP Calculator', description: 'Plan your SIP returns', icon: 'TrendingUp', badge: '✅ Popular', badgeColor: 'text-primary' },
  { id: 'brokerage', name: 'Brokerage Calculator', description: 'Compare brokerage across brokers', icon: 'IndianRupee', badge: '🔥 Referral', badgeColor: 'text-orange-400' },
  { id: 'option-pain', name: 'Option Pain Calculator', description: 'Find option expiry pain point', icon: 'Target', badge: null, badgeColor: '' },
  { id: 'position-sizer', name: 'Position Sizer', description: 'Calculate optimal position size', icon: 'Scale', badge: null, badgeColor: '' },
  { id: 'pivot-point', name: 'Pivot Point Calculator', description: 'Classic & Fibonacci pivots', icon: 'Crosshair', badge: null, badgeColor: '' },
  { id: 'cagr', name: 'CAGR Calculator', description: 'Compound annual growth rate', icon: 'BarChart3', badge: null, badgeColor: '' },
  { id: 'fibonacci', name: 'Fibonacci Calculator', description: 'Fibonacci retracement levels', icon: 'GitBranch', badge: null, badgeColor: '' },
  { id: 'break-even', name: 'Break Even Calculator', description: 'Find your break-even point', icon: 'Minus', badge: null, badgeColor: '' },
  { id: 'swp', name: 'SWP Calculator', description: 'Systematic withdrawal plan', icon: 'ArrowDown', badge: null, badgeColor: '' },
  { id: 'margin', name: 'Margin Calculator', description: 'Calculate margin requirements', icon: 'Landmark', badge: null, badgeColor: '' },
  { id: 'intrinsic-value', name: 'Intrinsic Value Calculator', description: 'Estimate stock intrinsic value', icon: 'Diamond', badge: null, badgeColor: '' },
] as const

export function formatIndianNumber(num: number): string {
  if (num === 0) return '0'
  const isNegative = num < 0
  const absNum = Math.abs(num)
  
  const parts = absNum.toFixed(2).split('.')
  let intPart = parts[0]
  const decPart = parts[1]
  
  // Indian number formatting: last 3 digits, then groups of 2
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3)
    const remaining = intPart.slice(0, -3)
    const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3
    intPart = formatted
  }
  
  const result = intPart + '.' + decPart
  return isNegative ? '-' + result : result
}

export function formatCurrency(num: number): string {
  return '₹' + formatIndianNumber(num)
}

export function formatPercent(num: number): string {
  return num.toFixed(2) + '%'
}
