'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { MarketTicker } from '@/components/market-ticker'
import { Hero } from '@/components/hero'
import { AdUnit } from '@/components/ad-unit'
import { ToolCards } from '@/components/tool-cards'
import { JournalSection } from '@/components/journal-section'
import { MarketSnapshot } from '@/components/market-snapshot'
import { DematSection } from '@/components/demat-section'
import { BlogSection } from '@/components/blog-section'
import { DailyInsights } from '@/components/daily-insights'
import { SebiDisclaimer } from '@/components/sebi-disclaimer'
import { Footer } from '@/components/footer'
import { CalculatorModal } from '@/components/calculators/calculator-modal'
import { TradingJournal } from '@/components/journal/trading-journal'
import { MindJournal } from '@/components/journal/mind-journal'
import { FloatingActions } from '@/components/floating-actions'
import { InstallBanner } from '@/components/install-banner'
import { SkillTreeLanding } from '@/components/skill-tree/skill-tree-landing'
import { RealmView } from '@/components/skill-tree/realm-view'
import { NodeView } from '@/components/skill-tree/node-view'
import { KnowledgeMap } from '@/components/skill-tree/knowledge-map'
import { GlossaryView } from '@/components/skill-tree/glossary-view'
import { CertificateView } from '@/components/skill-tree/certificate-view'
import { ChevronLeft } from 'lucide-react'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

function BackButton({ goHome }: { goHome: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4">
      <button onClick={goHome} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Back to Home
      </button>
    </div>
  )
}

export default function Home() {
  const { currentView, goHome, selectedSkillView } = useAppStore()

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentView, selectedSkillView])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {currentView !== 'skill-tree' && <MarketTicker />}
      {currentView !== 'skill-tree' && <InstallBanner />}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'calculator' && (
            <motion.div key="calculator" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
              <CalculatorModal />
            </motion.div>
          )}

          {currentView === 'journal' && (
            <motion.div key="journal" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
              <BackButton goHome={goHome} />
              <TradingJournal />
            </motion.div>
          )}

          {currentView === 'mind-journal' && (
            <motion.div key="mind-journal" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
              <BackButton goHome={goHome} />
              <MindJournal />
            </motion.div>
          )}

          {currentView === 'demat' && (
            <motion.div key="demat" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
                <button onClick={goHome} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Home
                </button>
              </div>
              <DematSection />
            </motion.div>
          )}

          {currentView === 'skill-tree' && (
            <motion.div key="skill-tree" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
              <AnimatePresence mode="wait">
                {selectedSkillView === 'landing' && (
                  <motion.div key="st-landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <SkillTreeLanding />
                  </motion.div>
                )}
                {selectedSkillView === 'realm' && (
                  <motion.div key="st-realm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <RealmView />
                  </motion.div>
                )}
                {selectedSkillView === 'node' && (
                  <motion.div key="st-node" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <NodeView />
                  </motion.div>
                )}
                {selectedSkillView === 'map' && (
                  <motion.div key="st-map" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                    <KnowledgeMap />
                  </motion.div>
                )}
                {selectedSkillView === 'glossary' && (
                  <motion.div key="st-glossary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <GlossaryView />
                  </motion.div>
                )}
                {selectedSkillView === 'certificate' && (
                  <motion.div key="st-certificate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <CertificateView />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {currentView === 'home' && (
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
              <Hero />
              <AdUnit variant="leaderboard" />
              <ToolCards />
              <AdUnit variant="rectangle" />
              <JournalSection />
              <MarketSnapshot />
              <DematSection />
              <DailyInsights />
              <BlogSection />
              <AdUnit variant="leaderboard" />
              <SebiDisclaimer />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {currentView !== 'skill-tree' && <Footer />}
      {currentView !== 'skill-tree' && <FloatingActions />}
    </div>
  )
}
