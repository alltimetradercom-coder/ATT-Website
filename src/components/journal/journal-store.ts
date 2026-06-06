'use client'

import { create } from 'zustand'

// Trade types
export interface Trade {
  id: string
  date: string
  symbol: string
  entryPrice: number
  exitPrice: number
  quantity: number
  direction: 'long' | 'short'
  strategy: string
  emotionBefore: number
  emotionAfter: number
  notes: string
  createdAt: string
}

export interface MindEntry {
  id: string
  date: string
  type: 'pre-trade' | 'post-trade'
  mood: number
  confidence: number
  fomo: number
  followingPlan: boolean | null
  sleepQuality: number
  emotionalState: string
  whatWentWell: string
  whatCouldImprove: string
  lessonLearned: string
  notes: string
  createdAt: string
}

interface JournalStore {
  trades: Trade[]
  mindEntries: MindEntry[]
  hydrated: boolean
  addTrade: (trade: Trade) => void
  updateTrade: (id: string, trade: Partial<Trade>) => void
  deleteTrade: (id: string) => void
  addMindEntry: (entry: MindEntry) => void
  updateMindEntry: (id: string, entry: Partial<MindEntry>) => void
  deleteMindEntry: (id: string) => void
  getTradeStats: () => TradeStats
  hydrate: () => void
}

export interface TradeStats {
  totalTrades: number
  winRate: number
  totalPnl: number
  avgPnl: number
  bestTrade: number
  worstTrade: number
  profitFactor: number
  wins: number
  losses: number
  avgWin: number
  avgLoss: number
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key: string, data: unknown) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // ignore storage errors
  }
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  trades: [],
  mindEntries: [],
  hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined' || get().hydrated) return
    const trades = loadFromStorage<Trade[]>('att_trades', [])
    const mindEntries = loadFromStorage<MindEntry[]>('att_mind_entries', [])
    set({ trades, mindEntries, hydrated: true })
  },

  addTrade: (trade) => {
    set((state) => {
      const trades = [trade, ...state.trades]
      saveToStorage('att_trades', trades)
      return { trades }
    })
  },

  updateTrade: (id, updates) => {
    set((state) => {
      const trades = state.trades.map((t) => (t.id === id ? { ...t, ...updates } : t))
      saveToStorage('att_trades', trades)
      return { trades }
    })
  },

  deleteTrade: (id) => {
    set((state) => {
      const trades = state.trades.filter((t) => t.id !== id)
      saveToStorage('att_trades', trades)
      return { trades }
    })
  },

  addMindEntry: (entry) => {
    set((state) => {
      const mindEntries = [entry, ...state.mindEntries]
      saveToStorage('att_mind_entries', mindEntries)
      return { mindEntries }
    })
  },

  updateMindEntry: (id, updates) => {
    set((state) => {
      const mindEntries = state.mindEntries.map((e) => (e.id === id ? { ...e, ...updates } : e))
      saveToStorage('att_mind_entries', mindEntries)
      return { mindEntries }
    })
  },

  deleteMindEntry: (id) => {
    set((state) => {
      const mindEntries = state.mindEntries.filter((e) => e.id !== id)
      saveToStorage('att_mind_entries', mindEntries)
      return { mindEntries }
    })
  },

  getTradeStats: () => {
    const { trades } = get()
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalPnl: 0,
        avgPnl: 0,
        bestTrade: 0,
        worstTrade: 0,
        profitFactor: 0,
        wins: 0,
        losses: 0,
        avgWin: 0,
        avgLoss: 0,
      }
    }

    const pnls = trades.map((t) => {
      const pnl = t.direction === 'long'
        ? (t.exitPrice - t.entryPrice) * t.quantity
        : (t.entryPrice - t.exitPrice) * t.quantity
      return pnl
    })

    const wins = pnls.filter((p) => p > 0)
    const losses = pnls.filter((p) => p < 0)
    const totalPnl = pnls.reduce((a, b) => a + b, 0)
    const totalWins = wins.reduce((a, b) => a + b, 0)
    const totalLosses = Math.abs(losses.reduce((a, b) => a + b, 0))

    return {
      totalTrades: trades.length,
      winRate: (wins.length / pnls.length) * 100,
      totalPnl,
      avgPnl: totalPnl / trades.length,
      bestTrade: Math.max(...pnls),
      worstTrade: Math.min(...pnls),
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
      wins: wins.length,
      losses: losses.length,
      avgWin: wins.length > 0 ? totalWins / wins.length : 0,
      avgLoss: losses.length > 0 ? totalLosses / losses.length : 0,
    }
  },
}))
