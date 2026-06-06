'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Shield, EyeOff, Lock } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-xs font-mono font-medium mb-4">
              <Shield className="h-3.5 w-3.5" />
              PRIVACY COMPLIANCE
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Last Updated: May 29, 2026
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
            <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500/90 font-medium">
              Privacy First: AllTimeTrader.com is designed as a local-first platform. We respect your financial privacy and do not store your trading logs, journal entries, or financial data on our remote servers.
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-emerald-500" />
                1. What Information We Do NOT Collect
              </h2>
              <p>
                - **Trading Journals**: Your trade history, entry/exit points, trading metrics, and capital requirements are saved **exclusively in your browser's local storage**. They are never transmitted, cached, or saved on our backend database.
              </p>
              <p>
                - **Mind & Psychology Logs**: Any notes you write in the Mind Journal regarding fear, greed, FOMO, or mental status are strictly confidential and stay on your local device. We have absolutely zero server visibility into this.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-500" />
                2. Information We Automatically Gather
              </h2>
              <p>
                Like most websites, we collect basic, non-personally identifiable analytical logs through standard tools (like Vercel Analytics and Google Analytics) to improve user experience:
              </p>
              <p>
                - Device models, screen resolutions, browser variants, and general geographical location (country level).
              </p>
              <p>
                - Page load performance, widget response rates, and feature interaction metrics (such as which calculators are opened most often).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">
                3. Cookies and Storage Settings
              </h2>
              <p>
                We use **cookies** and browser **Local Storage** to make your session seamless:
              </p>
              <p>
                - **Local Storage**: Retains your trading journal records, theme preference (light/dark), and recent calculator entries so they aren't lost when you refresh or close the tab.
              </p>
              <p>
                - **Functional Cookies**: Used for caching session-tokens for real-time market tickers to reduce API stress.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">
                4. Third-Party Integrations & Advertising
              </h2>
              <p>
                Our site incorporates third-party elements (such as TradingView market widgets and Vercel build systems). These external applications have their own privacy policies. 
              </p>
              <p>
                We also host referral/affiliate links to SEBI-registered brokers. Opening demat accounts through these links directs you to secure, encrypted broker portals which govern their own data collection under SEBI compliance.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">
                5. Contacting Us
              </h2>
              <p>
                If you have any questions or feedback regarding our privacy practices, please contact us at **privacy@alltimetrader.com**.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
