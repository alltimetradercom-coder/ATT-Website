'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { LanguageSwitcher, getLocalizedText } from './language-switcher'
import { REALMS, TOTAL_NODES, TOTAL_XP, type RealmData } from '@/data/skill-tree-realms'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Network, Sparkles, Trophy, Zap, ChevronRight, Star, Map } from 'lucide-react'

interface LandingData {
  realms: RealmData[]
  totalNodes: number
  totalXp: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function getSpiritBadge(spirit: string) {
  switch (spirit) {
    case 'Beginner': return { variant: 'secondary' as const, color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' }
    case 'Core Skill': return { variant: 'secondary' as const, color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25' }
    case 'Defense': return { variant: 'secondary' as const, color: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25' }
    case 'Boss Fight': return { variant: 'secondary' as const, color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25' }
    case 'Hidden Layer': return { variant: 'secondary' as const, color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/25' }
    case 'Inner Battle': return { variant: 'secondary' as const, color: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/25' }
    case 'Long Game': return { variant: 'secondary' as const, color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25' }
    case 'Elite': return { variant: 'secondary' as const, color: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/25' }
    case 'Numbers': return { variant: 'secondary' as const, color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/25' }
    case 'Professional': return { variant: 'secondary' as const, color: 'bg-stone-500/15 text-stone-600 dark:text-stone-400 border-stone-500/25' }
    case 'Builder': return { variant: 'secondary' as const, color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/25' }
    case 'Lore': return { variant: 'secondary' as const, color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25' }
    case 'Career': return { variant: 'secondary' as const, color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25' }
    default: return { variant: 'secondary' as const, color: 'bg-muted text-muted-foreground border-border' }
  }
}

export function SkillTreeLanding() {
  const { openRealm, openKnowledgeMap, skillLanguage } = useAppStore()
  const data: LandingData = { realms: REALMS, totalNodes: TOTAL_NODES, totalXp: TOTAL_XP }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 hero-grid opacity-40 dark:opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[100px] dark:bg-primary/20" />
        <div className="absolute top-10 right-1/4 h-48 w-48 rounded-full bg-amber-500/10 blur-[80px] dark:bg-amber-500/15" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="flex flex-col items-center text-center">
            {/* Language Switcher */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <LanguageSwitcher />
            </div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold text-primary"
            >
              <Zap className="h-3.5 w-3.5" />
              270 LESSONS • 13 REALMS • GAMIFIED
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-4"
            >
              <span className="att-hero-gradient">ATT Skill Tree</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8"
            >
              Enter the Trading Universe — Master every realm, defeat every boss, become a{' '}
              <span className="text-primary font-semibold">Legendary Trader</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              <Button
                size="lg"
                onClick={() => openRealm(1)}
                className="group gap-2 text-base font-bold rounded-xl h-12 px-6 bg-primary hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Start Your Journey
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={openKnowledgeMap}
                className="group gap-2 text-base font-bold rounded-xl h-12 px-6"
              >
                <Network className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Knowledge Map
              </Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 grid grid-cols-3 gap-6 sm:gap-12"
            >
              {[
                { label: 'Total Nodes', value: data.totalNodes, icon: Star },
                { label: 'Total XP', value: data.totalXp.toLocaleString(), icon: Trophy },
                { label: 'Realms', value: data.realms.length, icon: Map },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1">
                  <stat.icon className="h-5 w-5 text-primary mb-1" />
                  <span className="text-2xl sm:text-3xl font-black text-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Realms Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-black text-foreground">Choose Your Realm</h2>
          <div className="flex-1 h-px bg-border" />
          <Badge variant="outline" className="text-xs font-semibold">
            {data.realms.length} Realms
          </Badge>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {data.realms.map((realm) => {
            const spiritBadge = getSpiritBadge(realm.spirit)
            const title = getLocalizedText(realm, 'title', skillLanguage)
            const subtitle = getLocalizedText(realm, 'subtitle', skillLanguage)

            return (
              <motion.div key={realm.id} variants={itemVariants}>
                <Card
                  className="group cursor-pointer overflow-hidden border border-border/60 bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10"
                  onClick={() => openRealm(realm.id)}
                >
                  <CardContent className="p-0">
                    {/* Color accent bar */}
                    <div
                      className="h-1.5 w-full"
                      style={{ backgroundColor: realm.color }}
                    />

                    <div className="p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{realm.icon}</span>
                          <div>
                            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-tight">
                              {title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                      </div>

                      {/* Spirit Badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 h-5 ${spiritBadge.color}`}>
                          {realm.spirit}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {realm.nodeCount} {realm.nodeCount === 1 ? 'node' : 'nodes'}
                        </span>
                      </div>

                      {/* Progress bar placeholder (0% completed for now) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-muted-foreground">0/{realm.nodeCount}</span>
                        </div>
                        <Progress value={0} className="h-1.5" />
                      </div>

                      {/* Boss indicator */}
                      {realm.bossName && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>👹</span>
                          <span>Boss: {getLocalizedText(realm, 'bossName', skillLanguage)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Bottom Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
        <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🌱', label: 'Beginner Realms', value: data.realms.filter((r) => r.spirit === 'Beginner').length },
              { icon: '⚔️', label: 'Core Skill Realms', value: data.realms.filter((r) => r.spirit === 'Core Skill' || r.spirit === 'Defense').length },
              { icon: '👹', label: 'Boss Fights', value: data.realms.filter((r) => r.spirit === 'Boss Fight').length },
              { icon: '🐉', label: 'Elite Realms', value: data.realms.filter((r) => r.spirit === 'Elite' || r.spirit === 'Lore').length },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-2xl font-black text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEBI Disclaimer */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-8">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-xs text-muted-foreground">
            ⚠️ <strong>Disclaimer:</strong> AllTimeTrader.com is NOT a SEBI registered investment advisor. This Skill Tree is for educational purposes only. Please consult a SEBI-registered advisor before making investment decisions.
          </p>
        </div>
      </section>
    </div>
  )
}
