'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { getLocalizedText, LanguageSwitcher } from './language-switcher'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ChevronLeft,
  Lock,
  Unlock,
  CheckCircle2,
  Circle,
  Zap,
  Skull,
  BookOpen,
  Trophy,
  ArrowRight,
} from 'lucide-react'

interface NodeData {
  id: number
  nodeId: string
  title: string
  titleHi: string | null
  titleTe: string | null
  slug: string
  contentType: string
  difficulty: string
  xp: number
  badge: string | null
  status: string
  subRealm: string | null
  subRealmHi: string | null
  subRealmTe: string | null
}

interface RealmInfo {
  id: number
  realmNumber: number
  slug: string
  title: string
  titleHi: string | null
  titleTe: string | null
  subtitle: string
  subtitleHi: string | null
  subtitleTe: string | null
  description: string
  descriptionHi: string | null
  descriptionTe: string | null
  icon: string
  spirit: string
  color: string
  bossName: string | null
  bossNameHi: string | null
  bossNameTe: string | null
  badgeEmoji: string
  badgeTitle: string
  badgeTitleHi: string | null
  badgeTitleTe: string | null
}

interface NodeProgressInfo {
  nodeId: number
  nodeNodeId: string
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  xpEarned: number
  quizBestScore: number
}

interface RealmProgressInfo {
  realmId: number
  realmNumber: number
  realmTitle: string
  totalNodes: number
  completedNodes: number
  xpEarned: number
}

interface RealmViewData {
  realm: RealmInfo
  nodes: NodeData[]
  edges: { edgeId: string; fromNodeId: number; toNodeId: number; relationship: string; label: string | null; strength: number }[]
  totalXp: number
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Beginner': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
    case 'Intermediate': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
    case 'Advanced': return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25'
    default: return 'bg-muted text-muted-foreground border-border'
  }
}

function getContentTypeIcon(contentType: string) {
  switch (contentType) {
    case 'Lesson': return <BookOpen className="h-3.5 w-3.5" />
    case 'Certification': return <Skull className="h-3.5 w-3.5" />
    case 'Quiz': return <Zap className="h-3.5 w-3.5" />
    case 'Glossary': return <BookOpen className="h-3.5 w-3.5" />
    default: return <Circle className="h-3.5 w-3.5" />
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
}

export function RealmView() {
  const { selectedRealmId, openNode, goBackSkillTree, skillLanguage } = useAppStore()
  const [data, setData] = useState<RealmViewData | null>(null)
  const [nodeProgressMap, setNodeProgressMap] = useState<Map<number, NodeProgressInfo>>(new Map())
  const [realmXpEarned, setRealmXpEarned] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)

  // Fetch realm data
  useEffect(() => {
    if (!selectedRealmId) return
    let cancelled = false
    fetch(`/api/skill-tree/realm/${selectedRealmId}`)
      .then((res) => res.json())
      .then((d) => { if (!cancelled) setData(d) })
      .catch(console.error)
    return () => { cancelled = true }
  }, [selectedRealmId])

  // Fetch progress data
  useEffect(() => {
    let cancelled = false
    fetch('/api/skill-tree/progress')
      .then((res) => res.json())
      .then((d) => {
        if (cancelled) return
        // Build a map of node DB id -> progress
        const map = new Map<number, NodeProgressInfo>()
        if (d.progress && Array.isArray(d.progress)) {
          for (const p of d.progress) {
            map.set(p.nodeId, {
              nodeId: p.nodeId,
              nodeNodeId: p.nodeNodeId,
              status: p.status,
              xpEarned: p.xpEarned,
              quizBestScore: p.quizBestScore,
            })
          }
        }
        setNodeProgressMap(map)

        // Find realm-specific progress
        if (d.realmProgress && Array.isArray(d.realmProgress) && selectedRealmId) {
          const rp = d.realmProgress.find((r: RealmProgressInfo) => r.realmId === selectedRealmId)
          if (rp) {
            setCompletedCount(rp.completedNodes)
            setRealmXpEarned(rp.xpEarned)
          }
        }
      })
      .catch(console.error)
    return () => { cancelled = true }
  }, [selectedRealmId])

  // Helper to get node status from progress data
  const getNodeStatus = (node: NodeData): 'completed' | 'available' | 'in_progress' | 'locked' => {
    const progress = nodeProgressMap.get(node.id)
    if (progress) {
      return progress.status
    }
    // If no progress record exists yet, determine based on position
    // First node in realm should be available
    return 'locked'
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  const { realm, nodes, totalXp } = data
  const title = getLocalizedText(realm, 'title', skillLanguage)
  const subtitle = getLocalizedText(realm, 'subtitle', skillLanguage)
  const description = getLocalizedText(realm, 'description', skillLanguage)
  const bossName = getLocalizedText(realm, 'bossName', skillLanguage)
  const progressPercent = nodes.length > 0 ? (completedCount / nodes.length) * 100 : 0

  // Group nodes by subRealm for visual organization
  const subRealms = new Map<string, NodeData[]>()
  for (const node of nodes) {
    const sub = getLocalizedText({ title: node.subRealm, titleHi: node.subRealmHi, titleTe: node.subRealmTe }, 'title', skillLanguage) || 'Main Path'
    if (!subRealms.has(sub)) subRealms.set(sub, [])
    subRealms.get(sub)!.push(node)
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-30 dark:opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background" />
        <div className="absolute top-10 right-10 h-40 w-40 rounded-full blur-[80px] opacity-30" style={{ backgroundColor: realm.color }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-4 pb-8 sm:pt-6 sm:pb-12">
          {/* Back button + Language */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goBackSkillTree}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Skill Tree
            </button>
            <LanguageSwitcher />
          </div>

          {/* Realm Header */}
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl text-4xl sm:text-5xl shadow-lg"
              style={{ backgroundColor: `${realm.color}20`, border: `2px solid ${realm.color}40` }}
            >
              {realm.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] font-bold" style={{ color: realm.color, borderColor: `${realm.color}40` }}>
                  Realm {realm.realmNumber}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-bold" style={{ color: realm.color, borderColor: `${realm.color}40` }}>
                  {realm.spirit}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">{title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-sm text-muted-foreground max-w-3xl leading-relaxed">{description}</p>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Nodes', value: `${completedCount}/${nodes.length}`, icon: <BookOpen className="h-4 w-4" /> },
              { label: 'XP Earned', value: realmXpEarned > 0 ? realmXpEarned.toLocaleString() : totalXp.toLocaleString(), icon: <Zap className="h-4 w-4" />, subLabel: realmXpEarned > 0 ? `of ${totalXp.toLocaleString()}` : 'XP Available' },
              { label: 'Boss', value: bossName || '—', icon: <Skull className="h-4 w-4" /> },
              { label: 'Badge', value: `${realm.badgeEmoji} ${getLocalizedText(realm, 'badgeTitle', skillLanguage)}`, icon: <Trophy className="h-4 w-4" /> },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/60 bg-card/50 p-3 flex items-center gap-2">
                <div className="text-muted-foreground">{stat.icon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-bold text-foreground truncate">{stat.value}</p>
                  {'subLabel' in stat && stat.subLabel && (
                    <p className="text-[10px] text-muted-foreground">{stat.subLabel}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Realm Progress</span>
              <span className="font-semibold">{completedCount}/{nodes.length} nodes completed</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
      </section>

      {/* Node Path */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        {Array.from(subRealms.entries()).map(([subRealmName, subRealmNodes]) => (
          <div key={subRealmName} className="mb-8">
            {subRealms.size > 1 && (
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">{subRealmName}</h3>
            )}

            {/* Visual node path */}
            <div className="relative mb-6">
              {/* Connection line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-border/60" style={{
                background: `linear-gradient(to right, ${realm.color}30, ${realm.color}15)`,
              }} />

              <div className="flex items-center gap-0 overflow-x-auto pb-3 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                {subRealmNodes.map((node, idx) => {
                  const status = getNodeStatus(node)
                  const isBoss = node.contentType === 'Certification'
                  const progressInfo = nodeProgressMap.get(node.id)

                  return (
                    <div key={node.id} className="flex items-center shrink-0">
                      {/* Node dot */}
                      <button
                        onClick={() => status !== 'locked' && openNode(node.nodeId)}
                        className={`relative z-10 flex flex-col items-center gap-1 group ${status === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                            status === 'completed'
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/20'
                              : status === 'in_progress'
                              ? 'border-amber-500 bg-amber-500/15 text-amber-500 group-hover:scale-110'
                              : status === 'available'
                              ? 'border-primary bg-primary/10 text-primary group-hover:scale-110 group-hover:shadow-lg dark:shadow-primary/20'
                              : 'border-muted-foreground/30 bg-muted/30 text-muted-foreground/40'
                          } ${isBoss ? 'h-12 w-12' : ''}`}
                          style={status === 'available' ? { borderColor: realm.color, backgroundColor: `${realm.color}15`, color: realm.color } : status === 'in_progress' ? { borderColor: '#F59E0B', backgroundColor: '#F59E0B15', color: '#F59E0B' } : {}}
                        >
                          {status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : status === 'in_progress' ? (
                            isBoss ? <Skull className="h-5 w-5" /> : <BookOpen className="h-4 w-4" />
                          ) : status === 'available' ? (
                            isBoss ? <Skull className="h-5 w-5" /> : <Unlock className="h-4 w-4" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </div>
                        <span className={`text-[9px] font-medium max-w-[60px] truncate text-center ${
                          status === 'locked' ? 'text-muted-foreground/40' : status === 'completed' ? 'text-emerald-500' : 'text-muted-foreground'
                        }`}>
                          {node.nodeId}
                        </span>
                        {progressInfo && progressInfo.quizBestScore > 0 && (
                          <span className="text-[8px] text-muted-foreground">{progressInfo.quizBestScore}%</span>
                        )}
                      </button>

                      {/* Arrow connector */}
                      {idx < subRealmNodes.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 shrink-0 mx-1" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Node Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {subRealmNodes.map((node) => {
                const status = getNodeStatus(node)
                const isBoss = node.contentType === 'Certification'
                const nodeTitle = getLocalizedText(node, 'title', skillLanguage)
                const progressInfo = nodeProgressMap.get(node.id)

                return (
                  <motion.div key={node.id} variants={itemVariants}>
                    <Card
                      className={`group cursor-pointer overflow-hidden border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 ${
                        status === 'available'
                          ? 'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10'
                          : status === 'in_progress'
                          ? 'hover:border-amber-500/40 hover:shadow-lg ring-1 ring-amber-500/20'
                          : status === 'completed'
                          ? 'border-emerald-500/30 hover:border-emerald-500/50'
                          : 'opacity-60 cursor-not-allowed'
                      } ${isBoss ? 'ring-1 ring-red-500/30' : ''}`}
                      onClick={() => status !== 'locked' && openNode(node.nodeId)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {getContentTypeIcon(node.contentType)}
                            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                              {nodeTitle}
                            </h4>
                          </div>
                          {isBoss && (
                            <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 h-4 bg-red-500/15 text-red-500 border-red-500/25 shrink-0">
                              BOSS
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                          <Badge variant="outline" className={`text-[9px] font-bold px-1.5 py-0 h-4 ${getDifficultyColor(node.difficulty)}`}>
                            {node.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Zap className="h-3 w-3" /> {node.xp} XP
                          </span>
                          <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 h-4 text-muted-foreground">
                            {node.contentType}
                          </Badge>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {status === 'completed' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Completed
                              {progressInfo && progressInfo.xpEarned > 0 && (
                                <span className="text-primary ml-1">+{progressInfo.xpEarned} XP</span>
                              )}
                            </span>
                          )}
                          {status === 'in_progress' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500">
                              <BookOpen className="h-3 w-3" /> In Progress
                              {progressInfo && progressInfo.quizBestScore > 0 && (
                                <span className="text-muted-foreground ml-1">Best: {progressInfo.quizBestScore}%</span>
                              )}
                            </span>
                          )}
                          {status === 'available' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                              <Unlock className="h-3 w-3" /> Available
                            </span>
                          )}
                          {status === 'locked' && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                              <Lock className="h-3 w-3" /> Locked
                            </span>
                          )}
                          {node.status === 'published' && status !== 'completed' && status !== 'locked' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 ml-auto">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Content Ready
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        ))}
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
