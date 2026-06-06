'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FileText, Award, AlertCircle } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-500 text-xs font-mono font-medium mb-4">
              <FileText className="h-3.5 w-3.5" />
              TERMS OF USE
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Last Updated: May 29, 2026
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
            <div className="p-5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-500/90 font-medium">
              Welcome: By using AllTimeTrader.com, you agree to comply with the terms of service detailed below. If you do not agree, please stop using our calculators, journals, and tools.
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                1. Eligibility & Scope of Use
              </h2>
              <p>
                - You must be at least 18 years old or the legal age of majority in your jurisdiction to engage in financial calculations and demat platform registration.
              </p>
              <p>
                - AllTimeTrader.com grants you a non-exclusive, non-transferable, revocable license to access our calculators, discipline checkers, and trading loggers for **personal, non-commercial use only**.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">
                2. User Conduct & Prohibited Activities
              </h2>
              <p>
                You agree NOT to:
              </p>
              <p>
                - Use any web scrapers, automated spiders, or API scripts to aggressively scrape our real-time indexes, quotes, or Option Chain proxy servers. Doing so will result in an immediate IP block.
              </p>
              <p>
                - Replicate, license, copy, or redistribute our proprietary calculator templates, mathematical models, or source components without express written permission.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                3. Your Data Responsibilities (Local Storage Backups)
              </h2>
              <p>
                Since AllTimeTrader is designed as a **privacy-first local platform**, all your trading journals and entries reside exclusively in your browser&apos;s **Local Storage / Cookies**. 
              </p>
              <p>
                We do **NOT** back up or sync your journal data to our cloud servers. You are solely responsible for exporting and backing up your journals (via our built-in CSV/JSON export tools). 
              </p>
              <p>
                If you clear your browser cache, change devices, or wipe cookies, **your trade records will be permanently erased**, and AllTimeTrader holds zero responsibility for recovering them.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">
                4. Intellectual Property
              </h2>
              <p>
                All brand logos, layouts, original custom CSS styles, calculator formulas, and written guides on this site are the intellectual property of AllTimeTrader.com.
              </p>
              <p>
                Tailwind CSS, Chart.js, Lucide Icons, and TradingView elements are trademarks of their respective owners and are integrated under standard open-source or public licensing schemas.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">
                5. Limitation of Liability
              </h2>
              <p>
                Under no circumstances shall AllTimeTrader.com, its developer, or affiliates be held liable for any financial losses, trading damages, software errors, or server downtimes arising from the use of this website. You trade in Indian financial markets strictly at your own discretion and risk.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
