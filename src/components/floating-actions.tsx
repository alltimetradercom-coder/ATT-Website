'use client'

import { useEffect, useState } from 'react'
import { ArrowUp, Share2, Check } from 'lucide-react'

export function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [copied, setCopied] = useState(false)

  // Listen to scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleShare = async () => {
    const shareData = {
      title: 'AllTimeTrader',
      text: 'Free trading calculators, trading journal & discipline tools purpose-built for Indian stock market traders!',
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share error:', err)
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.log('Clipboard error:', err)
      }
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Copied Link Toast/Pill */}
      {copied && (
        <div className="absolute right-14 bottom-14 bg-card/95 border border-primary/20 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs text-primary font-semibold animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
          <Check className="h-3.5 w-3.5" />
          Link Copied!
        </div>
      )}

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-border/60 bg-card/75 backdrop-blur-md shadow-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-card hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
        title="Share this page"
      >
        <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* Scroll to Top Button */}
      <button
        onClick={handleScrollTop}
        className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-border/60 bg-card/75 backdrop-blur-md shadow-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-card hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer ${
          showScrollTop ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
        }`}
        title="Scroll to Top"
      >
        <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </div>
  )
}
