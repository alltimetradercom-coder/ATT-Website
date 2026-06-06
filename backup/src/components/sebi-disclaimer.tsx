'use client'

import { AlertTriangle } from 'lucide-react'

export function SebiDisclaimer() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-bold text-amber-400">IMPORTANT LEGAL DISCLOSURES</h2>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground mb-1">1. NOT SEBI REGISTERED</h3>
            <p>
              AllTimeTrader.com is NOT a SEBI registered investment advisor, research analyst, or stock broker.
              We do NOT provide buy/sell recommendations, stock tips, advisory services, portfolio management,
              or guaranteed returns.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-1">2. EDUCATIONAL PURPOSE ONLY</h3>
            <p>
              All calculators, tools, and data are for educational purposes only. Please consult a
              SEBI-registered advisor before making investment decisions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-1">3. DATA ACCURACY</h3>
            <p>
              Market data may be delayed. We are not responsible for data accuracy. Verify from official
              sources (NSE/BSE) before trading.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-1">4. REFERRAL DISCLOSURE</h3>
            <p>
              We earn referral commissions when you open a Demat account through our links. This does not
              affect your costs. We only recommend platforms we believe in.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-1">5. RISK DISCLAIMER</h3>
            <p>
              Trading in stock markets involves substantial risk. Past performance does not guarantee future
              returns. Never invest more than you can afford to lose.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
