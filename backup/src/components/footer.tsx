'use client'

import Link from 'next/link'
import { useAppStore, CALCULATORS } from '@/lib/store'
import { TrendingUp, Twitter, Github, Youtube, Linkedin, Heart } from 'lucide-react'

export function Footer() {
  const { openCalculator, setView, goHome } = useAppStore()

  return (
    <footer className="border-t border-border/50 bg-card/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold">
                All<span className="text-primary">Time</span>Trader
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Trade With Rules. Not Emotions.
            </p>
            <div className="flex items-center gap-3">
              <button className="h-8 w-8 rounded-md bg-accent flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </button>
              <button className="h-8 w-8 rounded-md bg-accent flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube">
                <Youtube className="h-4 w-4" />
              </button>
              <button className="h-8 w-8 rounded-md bg-accent flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Column 2: Calculators */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Calculators</h3>
            <ul className="space-y-1.5">
              {CALCULATORS.map((calc) => (
                <li key={calc.id}>
                  <button
                    onClick={() => openCalculator(calc.id)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {calc.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Resources</h3>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => setView('journal')}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Trading Journal
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView('mind-journal')}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Mind Journal
                </button>
              </li>
              <li>
                <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Chrome Extension
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView('demat')}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Demat Offers
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="/disclaimer" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © 2025 AllTimeTrader.com. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-400 fill-red-400" /> for Indian Traders
          </p>
        </div>
      </div>
    </footer>
  )
}
