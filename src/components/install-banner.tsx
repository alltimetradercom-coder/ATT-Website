'use client'

import { useEffect, useRef, useState } from 'react'
import { Smartphone, X, ArrowDownToLine, Share, HelpCircle } from 'lucide-react'

export function InstallBanner() {
  const deferredPromptRef = useRef<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showInstructions, setShowInstructions] = useState<'none' | 'ios' | 'chrome'>('none')
  const [nativePromptAvailable, setNativePromptAvailable] = useState(false)

  useEffect(() => {
    // 1. Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true

    if (isStandalone) return

    // 0. Allow force-reset via ?reset_install=1 in URL (for testing)
    const params = new URLSearchParams(window.location.search)
    if (params.get('reset_install') === '1') {
      localStorage.removeItem('att_install_dismissed')
      // Clean up URL without reload
      params.delete('reset_install')
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '')
      window.history.replaceState({}, '', newUrl)
    }

    // 2. Check if user dismissed it recently (24h cooldown)
    const dismissed = localStorage.getItem('att_install_dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      if (!isNaN(dismissedTime) && Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
        return
      }
    }

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isApple = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isApple)

    // 4. Capture beforeinstallprompt for Android/Chrome BEFORE showing banner
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e
      setNativePromptAvailable(true)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 5. Show banner after 3s for iOS (native prompt won't fire on iOS)
    //    For Android/Chrome — only show once beforeinstallprompt fires
    let timer: ReturnType<typeof setTimeout> | null = null
    if (isApple) {
      timer = setTimeout(() => setIsVisible(true), 3000)
    }

    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      setShowInstructions('ios')
      return
    }

    const prompt = deferredPromptRef.current
    if (prompt) {
      try {
        await prompt.prompt()
        const { outcome } = await prompt.userChoice
        console.log(`PWA install outcome: ${outcome}`)
        deferredPromptRef.current = null
        setNativePromptAvailable(false)
        setIsVisible(false)
      } catch (err) {
        console.error('Install prompt error:', err)
        setShowInstructions('chrome')
      }
    } else {
      // No native prompt — show manual instructions
      setShowInstructions('chrome')
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('att_install_dismissed', Date.now().toString())
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl shadow-2xl p-4 sm:p-5">
        {/* Top neon accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent" />
        
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {showInstructions === 'none' && (
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/25">
              <Smartphone className="h-6 w-6" />
            </div>
            
            <div className="flex-1 pr-6">
              <h4 className="font-bold text-sm text-foreground">Install AllTimeTrader</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Install like a native app on your device for instant calculations, offline support, and full-screen trading journal tracking.
              </p>
              <button
                onClick={handleInstall}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-3 py-1.5 shadow-md shadow-primary/15 transition-all cursor-pointer"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
                Install App
              </button>
            </div>
          </div>
        )}

        {showInstructions === 'ios' && (
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/25">
              <Share className="h-5 w-5" />
            </div>
            
            <div className="flex-1 pr-6">
              <h4 className="font-bold text-sm text-foreground">Install on iPhone / iPad</h4>
              <ol className="text-xs text-muted-foreground mt-2 space-y-1.5 list-decimal pl-4 leading-relaxed">
                <li>Tap the <span className="font-semibold text-foreground">Share</span> button in Safari at the bottom.</li>
                <li>Scroll down and select <span className="font-semibold text-foreground">Add to Home Screen</span>.</li>
                <li>Tap <span className="font-semibold text-foreground text-primary">Add</span> in the top right corner.</li>
              </ol>
              <button
                onClick={() => setShowInstructions('none')}
                className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {showInstructions === 'chrome' && (
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/25">
              <HelpCircle className="h-5 w-5" />
            </div>
            
            <div className="flex-1 pr-6">
              <h4 className="font-bold text-sm text-foreground">How to Install</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                If the automatic prompt didn&apos;t trigger:
              </p>
              <ol className="text-xs text-muted-foreground mt-2 space-y-1.5 list-decimal pl-4 leading-relaxed">
                <li>Click the <span className="font-semibold text-foreground">Install Icon</span> in the browser search bar at the top right.</li>
                <li>Or, tap the <span className="font-semibold text-foreground font-bold">Menu button (⋮ or ≡)</span> and select <span className="font-semibold text-foreground">Install app</span> or <span className="font-semibold text-foreground">Add to Home screen</span>.</li>
              </ol>
              <button
                onClick={() => setShowInstructions('none')}
                className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
