'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ChevronLeft,
  Award,
  Shield,
  Crown,
  Star,
  Share2,
  CheckCircle2,
  Zap,
  Trophy,
  Lock,
  Sparkles,
} from 'lucide-react'
import { REALMS } from '@/data/skill-tree-realms'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CertificateRealmDetail {
  id: number
  title: string
  icon: string
  color: string
}

interface CertificateData {
  id: number
  certificateId: string
  level: string
  realmIds: string
  issuedAt: string
  realmDetails: CertificateRealmDetail[]
}

interface EligibleLevel {
  level: string
  label: string
  emoji: string
  description: string
  realmNumbers: number[]
  progress: number // 0-100
  eligible: boolean
}

// ─── Level Config ────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<string, {
  label: string
  emoji: string
  description: string
  realmNumbers: number[]
  borderClass: string
  borderColor: string
  glowColor: string
}> = {
  genesis: {
    label: 'Genesis Survivor',
    emoji: '🌱',
    description: 'Completed the Genesis Realm',
    realmNumbers: [1],
    borderClass: 'border-[#CD7F32]',
    borderColor: '#CD7F32',
    glowColor: 'rgba(205,127,50,0.15)',
  },
  warrior: {
    label: 'Chart Warrior',
    emoji: '⚔️',
    description: 'Completed the Art of War Realm',
    realmNumbers: [2],
    borderClass: 'border-[#C0C0C0]',
    borderColor: '#C0C0C0',
    glowColor: 'rgba(192,192,192,0.15)',
  },
  guardian: {
    label: 'Fundamental Guardian',
    emoji: '🛡️',
    description: 'Completed The Shield Realm',
    realmNumbers: [3],
    borderClass: 'border-[#C0C0C0]',
    borderColor: '#C0C0C0',
    glowColor: 'rgba(192,192,192,0.15)',
  },
  slayer: {
    label: 'Options Slayer',
    emoji: '👹',
    description: 'Completed the Boss Realm',
    realmNumbers: [4],
    borderClass: 'border-[#FFD700]',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.15)',
  },
  shadow: {
    label: 'Shadow Agent',
    emoji: '🕵️',
    description: 'Completed Shadow Mechanics',
    realmNumbers: [5],
    borderClass: 'border-[#FFD700]',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.15)',
  },
  master: {
    label: 'Mind Master',
    emoji: '🧠',
    description: 'Completed Monster Mind',
    realmNumbers: [6],
    borderClass: 'border-[#FFD700]',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.15)',
  },
  empire: {
    label: 'Empire Architect',
    emoji: '🏰',
    description: 'Completed Empire Builder',
    realmNumbers: [7],
    borderClass: 'border-[#FFD700]',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.15)',
  },
  legendary: {
    label: 'Legendary',
    emoji: '🐉',
    description: 'Completed Legendary Trader',
    realmNumbers: [8],
    borderClass: 'border-[#FFD700]',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.15)',
  },
  quant: {
    label: 'Quant Sage',
    emoji: '📊',
    description: 'Completed Quant Lab',
    realmNumbers: [9],
    borderClass: 'border-[#FFD700]',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.15)',
  },
  professional: {
    label: 'Trading CEO',
    emoji: '💼',
    description: 'Completed Trader Business',
    realmNumbers: [10],
    borderClass: 'border-[#FFD700]',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.15)',
  },
  automation: {
    label: 'Automation Forge',
    emoji: '🔧',
    description: 'Completed Automation Lab',
    realmNumbers: [11],
    borderClass: 'border-[#FFD700]',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.15)',
  },
  'lore-keeper': {
    label: 'Lore Keeper',
    emoji: '📜',
    description: 'Completed Market Legends',
    realmNumbers: [12],
    borderClass: 'border-[#FFD700]',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.15)',
  },
  institutional: {
    label: 'Institutional Elite',
    emoji: '🏢',
    description: 'Completed Professional Careers',
    realmNumbers: [13],
    borderClass: 'border-[#FFD700]',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.15)',
  },
  'trader-novice': {
    label: 'Trader Novice',
    emoji: '🌟',
    description: 'Completed Realms 1–3',
    realmNumbers: [1, 2, 3],
    borderClass: 'border-[#C0C0C0]',
    borderColor: '#C0C0C0',
    glowColor: 'rgba(192,192,192,0.15)',
  },
  'trader-warrior': {
    label: 'Trader Warrior',
    emoji: '⚔️',
    description: 'Completed Realms 1–6',
    realmNumbers: [1, 2, 3, 4, 5, 6],
    borderClass: 'border-[#FFD700]',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.15)',
  },
  'trader-legend': {
    label: 'Trader Legend',
    emoji: '🏆',
    description: 'Completed Realms 1–9',
    realmNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    borderClass: 'border-[#FFD700]',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.2)',
  },
  'trader-grandmaster': {
    label: 'Trader Grandmaster',
    emoji: '👑',
    description: 'Completed All 13 Realms',
    realmNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    borderClass: 'border-[#FFD700]',
    borderColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.25)',
  },
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Certificate Card ────────────────────────────────────────────────────────

function CertificateCard({ cert, onShare }: { cert: CertificateData; onShare: (id: string) => void }) {
  const config = LEVEL_CONFIG[cert.level]
  if (!config) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className={`relative overflow-hidden border-2 ${config.borderClass} bg-card/90 backdrop-blur-sm`}
        style={{ boxShadow: `0 0 30px ${config.glowColor}` }}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden">
          <div
            className="absolute -top-8 -left-8 w-16 h-16 rotate-45"
            style={{ backgroundColor: config.borderColor, opacity: 0.2 }}
          />
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div
            className="absolute -top-8 -right-8 w-16 h-16 rotate-45"
            style={{ backgroundColor: config.borderColor, opacity: 0.2 }}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-16 h-16 overflow-hidden">
          <div
            className="absolute -bottom-8 -left-8 w-16 h-16 rotate-45"
            style={{ backgroundColor: config.borderColor, opacity: 0.2 }}
          />
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16 overflow-hidden">
          <div
            className="absolute -bottom-8 -right-8 w-16 h-16 rotate-45"
            style={{ backgroundColor: config.borderColor, opacity: 0.2 }}
          />
        </div>

        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: config.borderColor }} />

        <CardContent className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" style={{ color: config.borderColor }} />
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: config.borderColor }}>
                AllTimeTrader
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 tracking-wide">VERIFIED</span>
            </div>
          </div>

          {/* Emoji + Level */}
          <div className="flex flex-col items-center text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-5xl sm:text-6xl mb-3"
            >
              {config.emoji}
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-black text-foreground leading-tight">
              {config.label}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
          </div>

          {/* Realm icons row */}
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {cert.realmDetails.map((realm) => (
              <div
                key={realm.id}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border"
                style={{
                  backgroundColor: `${realm.color}15`,
                  borderColor: `${realm.color}30`,
                  color: realm.color,
                }}
              >
                <span>{realm.icon}</span>
                <span>{realm.title}</span>
              </div>
            ))}
          </div>

          {/* Certificate ID & Date */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="text-[10px] font-mono text-muted-foreground tracking-wide">
              {cert.certificateId}
            </div>
            <div className="text-xs text-muted-foreground">
              Issued on {formatDate(cert.issuedAt)}
            </div>
          </div>

          {/* Share button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(cert.certificateId)}
              className="gap-1.5 text-xs h-8"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share Certificate
            </Button>
          </div>
        </CardContent>

        {/* Bottom accent bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: config.borderColor }} />
      </Card>
    </motion.div>
  )
}

// ─── Eligible Level Card ─────────────────────────────────────────────────────

function EligibleLevelCard({
  level,
  onClaim,
  claiming,
}: {
  level: EligibleLevel
  onClaim: (level: string) => void
  claiming: boolean
}) {
  const config = LEVEL_CONFIG[level.level]
  if (!config) return null

  return (
    <Card className={`overflow-hidden border ${level.eligible ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border/60 bg-card/80 backdrop-blur-sm'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl shrink-0"
            style={{ backgroundColor: `${config.borderColor}20` }}
          >
            {level.eligible ? config.emoji : <Lock className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-sm font-bold text-foreground">{config.label}</h4>
              {level.eligible && (
                <Badge variant="outline" className="text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 h-4 px-1.5">
                  ELIGIBLE
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{level.description}</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold" style={{ color: level.eligible ? '#10B981' : config.borderColor }}>
                  {Math.round(level.progress)}%
                </span>
              </div>
              <Progress value={level.progress} className="h-1.5" />
            </div>
            {level.eligible && (
              <Button
                size="sm"
                onClick={() => onClaim(level.level)}
                disabled={claiming}
                className="mt-3 gap-1.5 text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Award className="h-3 w-3" />
                {claiming ? 'Claiming...' : 'Claim Certificate'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main View ───────────────────────────────────────────────────────────────

export function CertificateView() {
  const { goBackSkillTree } = useAppStore()
  const [certificates, setCertificates] = useState<CertificateData[]>([])
  const [eligibleLevels, setEligibleLevels] = useState<EligibleLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [shareToast, setShareToast] = useState<string | null>(null)

  // Fetch certificates + check eligible levels
  const loadData = useCallback(async () => {
    try {
      // Fetch existing certificates
      const certRes = await fetch('/api/skill-tree/certificate')
      const certData = await certRes.json()
      setCertificates(certData.certificates || [])

      // Fetch realm progress to determine eligibility
      const progressRes = await fetch('/api/skill-tree/progress')
      const progressData = await progressRes.json()

      if (progressData.realmProgress) {
        // Build realm completion map
        const realmProgressMap = new Map<number, { completed: number; total: number }>()
        for (const rp of progressData.realmProgress) {
          realmProgressMap.set(rp.realmNumber, {
            completed: rp.completedNodes,
            total: rp.totalNodes,
          })
        }

        // Calculate eligible levels
        const existingLevels = new Set((certData.certificates || []).map((c: CertificateData) => c.level))
        const levels: EligibleLevel[] = []

        for (const [levelKey, levelConfig] of Object.entries(LEVEL_CONFIG)) {
          if (existingLevels.has(levelKey)) continue // Already earned

          let totalNodes = 0
          let completedNodes = 0
          for (const rn of levelConfig.realmNumbers) {
            const rp = realmProgressMap.get(rn)
            if (rp) {
              totalNodes += rp.total
              completedNodes += rp.completed
            }
          }

          const progress = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0
          levels.push({
            level: levelKey,
            label: levelConfig.label,
            emoji: levelConfig.emoji,
            description: levelConfig.description,
            realmNumbers: levelConfig.realmNumbers,
            progress,
            eligible: progress >= 100,
          })
        }

        // Sort: eligible first, then by progress desc
        levels.sort((a, b) => {
          if (a.eligible && !b.eligible) return -1
          if (!a.eligible && b.eligible) return 1
          return b.progress - a.progress
        })

        setEligibleLevels(levels)
      }
    } catch (err) {
      console.error('Error loading certificates:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Claim certificate
  const handleClaim = async (level: string) => {
    setClaiming(level)
    try {
      const res = await fetch('/api/skill-tree/certificate/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      })
      const data = await res.json()
      if (res.ok && data.certificate) {
        // Refresh data
        await loadData()
      } else {
        console.error('Failed to claim:', data.error)
      }
    } catch (err) {
      console.error('Error claiming certificate:', err)
    } finally {
      setClaiming(null)
    }
  }

  // Share certificate
  const handleShare = (certificateId: string) => {
    const url = `${window.location.origin}/api/skill-tree/certificate/${certificateId}`
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(certificateId)
      setTimeout(() => setShareToast(null), 2000)
    }).catch(() => {
      // Fallback: just copy the path
      navigator.clipboard.writeText(`/api/skill-tree/certificate/${certificateId}`)
      setShareToast(certificateId)
      setTimeout(() => setShareToast(null), 2000)
    })
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-20 dark:opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background" />
        <div className="absolute top-10 right-10 h-32 w-32 rounded-full blur-[60px] opacity-30 bg-[#FFD700]" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-4 pb-8 sm:pt-6 sm:pb-12">
          {/* Back */}
          <button
            onClick={goBackSkillTree}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Skill Tree
          </button>

          {/* Title */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 px-4 py-1.5 text-xs font-semibold text-[#FFD700]"
            >
              <Award className="h-3.5 w-3.5" />
              CERTIFICATES
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3"
            >
              <span className="att-hero-gradient">Your Achievements</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-muted-foreground max-w-lg"
            >
              Complete realms to earn certificates. Each certificate is verifiable and shareable.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 grid grid-cols-2 gap-6 sm:gap-12"
            >
              <div className="flex flex-col items-center gap-1">
                <Trophy className="h-5 w-5 text-[#FFD700] mb-1" />
                <span className="text-2xl sm:text-3xl font-black text-foreground">{certificates.length}</span>
                <span className="text-xs text-muted-foreground font-medium">Earned</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Star className="h-5 w-5 text-primary mb-1" />
                <span className="text-2xl sm:text-3xl font-black text-foreground">{eligibleLevels.filter(l => l.eligible).length}</span>
                <span className="text-xs text-muted-foreground font-medium">Ready to Claim</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Earned Certificates Grid */}
      {certificates.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="h-5 w-5 text-[#FFD700]" />
            <h2 className="text-xl font-black text-foreground">Earned Certificates</h2>
            <div className="flex-1 h-px bg-border" />
            <Badge variant="outline" className="text-xs font-semibold">
              {certificates.length} {certificates.length === 1 ? 'Certificate' : 'Certificates'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <CertificateCard key={cert.certificateId} cert={cert} onShare={handleShare} />
            ))}
          </div>
        </section>
      )}

      {/* Eligible / Progress Levels */}
      {eligibleLevels.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-black text-foreground">Certificate Progress</h2>
            <div className="flex-1 h-px bg-border" />
            <Badge variant="outline" className="text-xs font-semibold">
              {eligibleLevels.length} Levels
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {eligibleLevels.map((level) => (
              <EligibleLevelCard
                key={level.level}
                level={level}
                onClaim={handleClaim}
                claiming={claiming === level.level}
              />
            ))}
          </div>
        </section>
      )}

      {/* No certificates yet */}
      {certificates.length === 0 && eligibleLevels.length === 0 && (
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-[#FFD700]/10 flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-[#FFD700]/50" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">No Certificates Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Complete all nodes in a realm to earn your first certificate. Start your journey by exploring the Genesis realm!
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Share Toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 rounded-lg bg-foreground text-background px-4 py-2 shadow-lg">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Certificate link copied!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
