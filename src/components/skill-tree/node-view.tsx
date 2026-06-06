'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { getLocalizedText, LanguageSwitcher } from './language-switcher'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ChevronLeft,
  Zap,
  BookOpen,
  Skull,
  Lock,
  Trophy,
  Sparkles,
  FileText,
  Brain,
  ClipboardList,
  Link2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'

interface ConnectedNode {
  nodeId: string
  title: string
  titleHi: string | null
  titleTe: string | null
  difficulty: string
  xp: number
  contentType: string
  relationship: string
  direction: string
  realm: { id: number; title: string; icon: string; color: string }
}

interface NodeViewData {
  node: {
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
    badgeHi: string | null
    badgeTe: string | null
    content: string | null
    contentHi: string | null
    contentTe: string | null
    tldr: string | null
    tldrHi: string | null
    tldrTe: string | null
    cheatsheet: string | null
    cheatsheetHi: string | null
    cheatsheetTe: string | null
    mindNote: string | null
    mindNoteHi: string | null
    mindNoteTe: string | null
    status: string
    subRealm: string | null
    subRealmHi: string | null
    subRealmTe: string | null
    storyChapter: string | null
    bossBattle: string | null
    lore: string | null
  }
  realm: {
    id: number
    realmNumber: number
    title: string
    titleHi: string | null
    titleTe: string | null
    icon: string
    color: string
    slug: string
  }
  connectedNodes: ConnectedNode[]
  edges: { edgeId: string; from: string; to: string; relationship: string; label: string | null }[]
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Beginner': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
    case 'Intermediate': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
    case 'Advanced': return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25'
    default: return 'bg-muted text-muted-foreground border-border'
  }
}

function getRelationshipLabel(rel: string) {
  switch (rel) {
    case 'prerequisite': return 'Prerequisite'
    case 'leads_to': return 'Leads To'
    case 'related_to': return 'Related'
    case 'used_in': return 'Used In'
    case 'commonly_confused_with': return 'Commonly Confused'
    case 'cross_realm': return 'Cross-Realm'
    default: return rel
  }
}

export function NodeView() {
  const { selectedNodeId, goBackSkillTree, openNode, openRealm, selectedRealmId, skillLanguage } = useAppStore()
  const [data, setData] = useState<NodeViewData | null>(null)

  useEffect(() => {
    if (!selectedNodeId) return
    let cancelled = false
    fetch(`/api/skill-tree/node/${encodeURIComponent(selectedNodeId)}`)
      .then((res) => res.json())
      .then((d) => { if (!cancelled) setData(d) })
      .catch(console.error)
    return () => { cancelled = true }
  }, [selectedNodeId])

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  const { node, realm, connectedNodes } = data
  const nodeTitle = getLocalizedText(node, 'title', skillLanguage)
  const realmTitle = getLocalizedText(realm, 'title', skillLanguage)
  const isBoss = node.contentType === 'Certification'
  const hasContent = node.content && node.content.length > 10

  // Parse TL;DR if it exists
  let tldrItems: string[] = []
  if (node.tldr) {
    try {
      tldrItems = JSON.parse(node.tldr)
    } catch {
      tldrItems = [node.tldr]
    }
  }

  // Parse cheatsheet if it exists
  let cheatsheetItems: string[] = []
  if (node.cheatsheet) {
    try {
      cheatsheetItems = JSON.parse(node.cheatsheet)
    } catch {
      cheatsheetItems = [node.cheatsheet]
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-20 dark:opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background" />
        <div className="absolute top-10 right-10 h-32 w-32 rounded-full blur-[60px] opacity-30" style={{ backgroundColor: realm.color }} />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 pt-4 pb-8 sm:pt-6 sm:pb-12">
          {/* Back + Language */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goBackSkillTree}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to {realmTitle}
            </button>
            <LanguageSwitcher />
          </div>

          {/* Realm breadcrumb */}
          <button
            onClick={() => openRealm(realm.id)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
          >
            <span>{realm.icon}</span>
            <span>{realmTitle}</span>
            <ChevronLeft className="h-3 w-3 rotate-180" />
            <span>{node.nodeId}</span>
          </button>

          {/* Node Header */}
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl text-2xl sm:text-3xl shrink-0 ${
                isBoss ? 'ring-2 ring-red-500/50' : ''
              }`}
              style={{ backgroundColor: `${realm.color}20`, border: `2px solid ${realm.color}40` }}
            >
              {isBoss ? <Skull className="h-7 w-7" style={{ color: realm.color }} /> : <BookOpen className="h-7 w-7" style={{ color: realm.color }} />}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-foreground leading-tight">{nodeTitle}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className={`text-[10px] font-bold ${getDifficultyColor(node.difficulty)}`}>
                  {node.difficulty}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-bold" style={{ color: realm.color, borderColor: `${realm.color}40` }}>
                  {node.contentType}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/25 bg-primary/10">
                  <Zap className="h-3 w-3 mr-0.5" /> {node.xp} XP
                </Badge>
                {isBoss && (
                  <Badge variant="outline" className="text-[10px] font-bold bg-red-500/15 text-red-500 border-red-500/25">
                    <Skull className="h-3 w-3 mr-0.5" /> BOSS BATTLE
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-4 rounded-xl border border-border/60 bg-card/50 p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">XP Progress</span>
              <span className="font-bold text-primary">0 / {node.xp} XP</span>
            </div>
            <Progress value={0} className="h-2" />
            {node.badge && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Trophy className="h-3.5 w-3.5" />
                <span>Badge: <strong className="text-foreground">{getLocalizedText({ title: node.badge, titleHi: node.badgeHi, titleTe: node.badgeTe }, 'title', skillLanguage)}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-16 space-y-6">
        {/* Lore/Story */}
        {node.lore && (
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="h-1 w-full" style={{ backgroundColor: realm.color }} />
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4" style={{ color: realm.color }} />
                <h3 className="font-bold text-foreground">Story</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{node.lore}</p>
            </CardContent>
          </Card>
        )}

        {/* Mind Note */}
        {node.mindNote && (
          <Card className="border-primary/30 bg-primary/5 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-primary text-sm">Mind Note</h3>
              </div>
              <p className="text-sm text-foreground italic">&ldquo;{getLocalizedText({ title: node.mindNote, titleHi: node.mindNoteHi, titleTe: node.mindNoteTe }, 'title', skillLanguage)}&rdquo;</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content or Coming Soon */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 w-full" style={{ backgroundColor: realm.color }} />
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4" style={{ color: realm.color }} />
              <h3 className="font-bold text-foreground">Lesson Content</h3>
            </div>
            {hasContent ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {getLocalizedText(
                    { title: node.content || '', titleHi: node.contentHi, titleTe: node.contentTe },
                    'title',
                    skillLanguage
                  )}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative mb-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-primary/50" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                  </div>
                </div>
                <h4 className="text-lg font-bold text-foreground mb-1">Coming Soon</h4>
                <p className="text-sm text-muted-foreground max-w-sm">
                  This lesson is being crafted by our trading mentors. Check back soon to unlock the knowledge within!
                </p>
                <Badge variant="outline" className="mt-3 text-xs">
                  {node.contentType} • {node.xp} XP
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TL;DR */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 w-full" style={{ backgroundColor: realm.color }} />
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4" style={{ color: realm.color }} />
              <h3 className="font-bold text-foreground">TL;DR</h3>
            </div>
            {tldrItems.length > 0 ? (
              <ul className="space-y-2">
                {tldrItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground/60 italic">Quick summary coming soon...</p>
            )}
          </CardContent>
        </Card>

        {/* Cheatsheet */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 w-full" style={{ backgroundColor: realm.color }} />
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="h-4 w-4" style={{ color: realm.color }} />
              <h3 className="font-bold text-foreground">Cheatsheet</h3>
            </div>
            {cheatsheetItems.length > 0 ? (
              <ul className="space-y-2">
                {cheatsheetItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground/60 italic">Quick revision notes coming soon...</p>
            )}
          </CardContent>
        </Card>

        {/* Quiz Placeholder */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 w-full bg-amber-500" />
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Skull className="h-4 w-4 text-amber-500" />
              <h3 className="font-bold text-foreground">Quiz Challenge</h3>
            </div>
            <div className="flex flex-col items-center py-6 text-center">
              <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
                <Skull className="h-6 w-6 text-amber-500/60" />
              </div>
              <p className="text-sm text-muted-foreground">Quiz questions are being prepared for this node.</p>
              <Badge variant="outline" className="mt-2 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25">
                +10 XP per correct answer
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Connected Nodes */}
        {connectedNodes.length > 0 && (
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="h-1 w-full" style={{ backgroundColor: realm.color }} />
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="h-4 w-4" style={{ color: realm.color }} />
                <h3 className="font-bold text-foreground">Connected Nodes</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {connectedNodes.map((cn) => (
                  <button
                    key={cn.nodeId}
                    onClick={() => openNode(cn.nodeId)}
                    className="group flex items-center gap-3 rounded-lg border border-border/60 bg-background/50 p-3 text-left hover:border-primary/40 transition-all"
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm shrink-0"
                      style={{ backgroundColor: `${cn.realm.color}20` }}
                    >
                      {cn.realm.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {getLocalizedText(cn, 'title', skillLanguage)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[8px] font-bold px-1 py-0 h-3" style={{ color: cn.realm.color, borderColor: `${cn.realm.color}40` }}>
                          {getRelationshipLabel(cn.relationship)}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{cn.xp} XP</span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* SEBI Disclaimer */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-500">SEBI DISCLAIMER</span>
          </div>
          <p className="text-xs text-muted-foreground">
            AllTimeTrader.com is NOT a SEBI registered investment advisor, research analyst, or stock broker.
            This content is for educational purposes only. Please consult a SEBI-registered advisor before making investment decisions.
            Trading in stock markets involves substantial risk. Past performance does not guarantee future returns.
          </p>
        </div>
      </div>
    </div>
  )
}
