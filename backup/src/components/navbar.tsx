'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAppStore, CALCULATORS } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  TrendingUp,
  Menu,
  Calculator,
  BookOpen,
  BarChart3,
  ChevronDown,
  X,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from 'next-themes'

function ChromeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3A9 9 0 0 0 3.27 7.5 L7.5 10.5 A4.5 4.5 0 0 1 12 7.5 Z" fill="#EA4335"/>
      <path d="M12 7.5 A4.5 4.5 0 0 1 16.5 10.5 L21.13 7.5 A9 9 0 0 0 12 3 Z" fill="#FBBC05"/>
      <path d="M16.5 10.5 A4.5 4.5 0 0 1 12 16.5 L12 21 A9 9 0 0 0 21.13 7.5 Z" fill="#34A853"/>
      <path d="M12 16.5 A4.5 4.5 0 0 1 7.5 10.5 L3.27 7.5 A9 9 0 0 0 12 21 Z" fill="#4285F4"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
      <circle cx="12" cy="12" r="3" fill="#1A73E8"/>
    </svg>
  )
}

export function Navbar() {
  const { setView, openCalculator, goHome, currentView } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()

  const handleGoHome = () => {
    goHome()
    if (pathname !== '/') {
      router.push('/')
    }
  }

  const handleOpenCalculator = (id: string) => {
    openCalculator(id)
    if (pathname !== '/') {
      router.push('/')
    }
  }

  const handleSetView = (view: 'home' | 'calculator' | 'journal' | 'mind-journal' | 'demat') => {
    setView(view)
    if (pathname !== '/') {
      router.push('/')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <button onClick={handleGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            All<span className="text-primary">Time</span>Trader
          </span>
        </button>

        {/* Desktop Nav */}
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Calculators Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="group gap-1.5 text-xs lg:text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-3.5 py-2 transition-all duration-200">
                <Calculator className="h-4 w-4 text-muted-foreground/80 group-hover:text-primary transition-colors" />
                Calculators
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-y-[1px] transition-all" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-card/90 backdrop-blur-xl border border-border/60 shadow-xl rounded-2xl p-1.5 animate-in fade-in-50 slide-in-from-top-1.5 duration-200">
              {CALCULATORS.map((calc) => (
                <DropdownMenuItem
                  key={calc.id}
                  onClick={() => handleOpenCalculator(calc.id)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 focus:text-primary focus:bg-primary/10 transition-all duration-150 cursor-pointer"
                >
                  <span className="flex-1 font-semibold">{calc.name}</span>
                  {calc.badge && (
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-primary/15 border border-primary/25 ${calc.badgeColor}`}>
                      {calc.badge}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Journal Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="group gap-1.5 text-xs lg:text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-3.5 py-2 transition-all duration-200">
                <BookOpen className="h-4 w-4 text-muted-foreground/80 group-hover:text-primary transition-colors" />
                Journal
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-y-[1px] transition-all" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-card/90 backdrop-blur-xl border border-border/60 shadow-xl rounded-2xl p-1.5 animate-in fade-in-50 slide-in-from-top-1.5 duration-200">
              <DropdownMenuItem 
                onClick={() => handleSetView('journal')} 
                className="rounded-xl px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 focus:text-primary focus:bg-primary/10 transition-all duration-150 cursor-pointer"
              >
                Trade Journal
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSetView('mind-journal')} 
                className="rounded-xl px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 focus:text-primary focus:bg-primary/10 transition-all duration-150 cursor-pointer"
              >
                Mind Journal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Markets Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="group gap-1.5 text-xs lg:text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-3.5 py-2 transition-all duration-200">
                <BarChart3 className="h-4 w-4 text-muted-foreground/80 group-hover:text-primary transition-colors" />
                Markets
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-y-[1px] transition-all" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-card/90 backdrop-blur-xl border border-border/60 shadow-xl rounded-2xl p-1.5 animate-in fade-in-50 slide-in-from-top-1.5 duration-200">
              <DropdownMenuItem 
                onClick={handleGoHome} 
                className="rounded-xl px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 focus:text-primary focus:bg-primary/10 transition-all duration-150 cursor-pointer"
              >
                Nifty 50
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleGoHome} 
                className="rounded-xl px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 focus:text-primary focus:bg-primary/10 transition-all duration-150 cursor-pointer"
              >
                Bank Nifty
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleGoHome} 
                className="rounded-xl px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 focus:text-primary focus:bg-primary/10 transition-all duration-150 cursor-pointer"
              >
                India VIX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            className="text-xs lg:text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-3.5 py-2 transition-all duration-200" 
            onClick={() => handleSetView('demat')}
          >
            Demat Offers
          </Button>

          <Button 
            variant="ghost" 
            className="group text-xs lg:text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-3.5 py-2 transition-all duration-200" 
            asChild
          >
            <Link href="/chrome-extension" className="flex items-center gap-1.5">
              <ChromeIcon className="h-4 w-4 shrink-0" />
              Chrome Extension
            </Link>
          </Button>
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center h-9 w-9 rounded-xl border border-border/60 bg-card/50 hover:bg-accent hover:border-primary/30 transition-all duration-200 text-muted-foreground hover:text-primary hover:scale-105 cursor-pointer"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="h-4 w-4 hidden dark:block" />
          </button>
          <div className="flex h-9 items-center rounded-xl bg-primary/15 px-3 text-xs font-bold text-primary border border-primary/25 hover:bg-primary/20 transition-colors">
            ATT
          </div>
        </div>

        {/* Mobile menu & mobile theme toggle */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center h-9 w-9 rounded-xl border border-border/60 bg-card/40 text-muted-foreground hover:text-primary transition-all duration-200 cursor-pointer"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="h-4 w-4 hidden dark:block" />
          </button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-accent">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-card border-border p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="font-bold">All<span className="text-primary">Time</span>Trader</span>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-4rem)] p-4 space-y-2">
              <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Calculators</div>
              {CALCULATORS.map((calc) => (
                <button
                  key={calc.id}
                  onClick={() => { handleOpenCalculator(calc.id); setMobileOpen(false) }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <span>{calc.name}</span>
                  {calc.badge && <span className={`text-xs ${calc.badgeColor}`}>{calc.badge}</span>}
                </button>
              ))}

              <div className="text-xs font-semibold uppercase text-muted-foreground mt-4 mb-2">Journal</div>
              <button
                onClick={() => { handleSetView('journal'); setMobileOpen(false) }}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                Trade Journal
              </button>
              <button
                onClick={() => { handleSetView('mind-journal'); setMobileOpen(false) }}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                Mind Journal
              </button>

              <div className="text-xs font-semibold uppercase text-muted-foreground mt-4 mb-2">Markets</div>
              <button
                onClick={() => { handleGoHome(); setMobileOpen(false) }}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                Nifty 50
              </button>
              <button
                onClick={() => { handleGoHome(); setMobileOpen(false) }}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                Bank Nifty
              </button>
              <button
                onClick={() => { handleGoHome(); setMobileOpen(false) }}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                India VIX
              </button>

              <div className="border-t border-border mt-4 pt-4 space-y-2">
                <button
                  onClick={() => { handleSetView('demat'); setMobileOpen(false) }}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  Demat Offers
                </button>
                <Link
                  href="/chrome-extension"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <ChromeIcon className="h-4 w-4 shrink-0" />
                  Chrome Extension
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      </div>
    </header>
  )
}
