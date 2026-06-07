'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type SkillLanguage } from '@/lib/store'
import { LanguageSwitcher } from './language-switcher'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Link2,
  AlertTriangle,
  Lightbulb,
  Calculator,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react'

interface GlossaryTerm {
  id: number
  termId: string
  term: string
  termHi: string | null
  termTe: string | null
  simpleDefinition: string
  simpleDefinitionHi: string | null
  simpleDefinitionTe: string | null
  professionalDefinition: string | null
  formula: string | null
  commonMistake: string | null
  commonMistakeHi: string | null
  commonMistakeTe: string | null
  realExample: string | null
  realExampleHi: string | null
  realExampleTe: string | null
  relatedTerms: string | null
  nodeCount: number
}

interface TermNode {
  nodeId: string
  title: string
  slug: string
  realm: {
    id: number
    title: string
    icon: string
    color: string
  }
}

interface TermDetail extends GlossaryTerm {
  nodes: TermNode[]
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function getLocalizedField(
  obj: Record<string, unknown>,
  field: string,
  lang: SkillLanguage
): string {
  if (lang === 'hi') {
    const hiVal = obj[`${field}Hi`]
    if (hiVal && typeof hiVal === 'string') return hiVal
  }
  if (lang === 'te') {
    const teVal = obj[`${field}Te`]
    if (teVal && typeof teVal === 'string') return teVal
  }
  const base = obj[field]
  return (typeof base === 'string' ? base : '') || ''
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export function GlossaryView() {
  const { goBackSkillTree, skillLanguage, openNode } = useAppStore()
  const [terms, setTerms] = useState<GlossaryTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [selectedTerm, setSelectedTerm] = useState<TermDetail | null>(null)
  const [termDetailLoading, setTermDetailLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fetch all glossary terms
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/skill-tree/glossary')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setTerms(data.terms || [])
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Filter terms by search
  const filteredTerms = useMemo(() => {
    let result = terms
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          (t.termHi && t.termHi.includes(q)) ||
          (t.termTe && t.termTe.includes(q)) ||
          t.simpleDefinition.toLowerCase().includes(q) ||
          (t.professionalDefinition && t.professionalDefinition.toLowerCase().includes(q))
      )
    }
    if (selectedLetter) {
      result = result.filter((t) => t.term.toUpperCase().startsWith(selectedLetter))
    }
    return result
  }, [terms, search, selectedLetter])

  // Group by first letter
  const groupedTerms = useMemo(() => {
    const groups = new Map<string, GlossaryTerm[]>()
    for (const term of filteredTerms) {
      const letter = term.term.charAt(0).toUpperCase()
      if (!groups.has(letter)) groups.set(letter, [])
      groups.get(letter)!.push(term)
    }
    return groups
  }, [filteredTerms])

  // Available letters
  const availableLetters = useMemo(() => {
    return new Set(terms.map((t) => t.term.charAt(0).toUpperCase()))
  }, [terms])

  // Fetch term detail
  const fetchTermDetail = useCallback(async (termId: string) => {
    setTermDetailLoading(true)
    try {
      const res = await fetch(`/api/skill-tree/glossary/${termId}`)
      const data = await res.json()
      if (data.term) {
        setSelectedTerm({ ...data.term, nodes: data.nodes || [] } as TermDetail)
      }
    } catch (err) {
      console.error('Failed to fetch term detail:', err)
    } finally {
      setTermDetailLoading(false)
    }
  }, [])

  // Seed glossary
  const handleSeed = useCallback(async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/skill-tree/glossary/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ realmNumber: 1 }),
      })
      const data = await res.json()
      if (data.created > 0) {
        // Refresh terms list
        const refreshRes = await fetch('/api/skill-tree/glossary')
        const refreshData = await refreshRes.json()
        setTerms(refreshData.terms || [])
      }
    } catch (err) {
      console.error('Seed failed:', err)
    } finally {
      setSeeding(false)
    }
  }, [])

  // Scroll to letter group
  const scrollToLetter = useCallback((letter: string) => {
    setSelectedLetter(letter === selectedLetter ? null : letter)
    const el = document.getElementById(`glossary-group-${letter}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedLetter])

  // Handle keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement !== searchInputRef.current) {
          e.preventDefault()
          searchInputRef.current?.focus()
        }
      }
      if (e.key === 'Escape') {
        if (selectedTerm) {
          setSelectedTerm(null)
        } else if (search) {
          setSearch('')
          searchInputRef.current?.blur()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedTerm, search])

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-30 dark:opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background" />
        <div className="absolute top-10 left-1/4 h-48 w-48 rounded-full bg-emerald-500/10 blur-[80px] dark:bg-emerald-500/15" />
        <div className="absolute top-5 right-1/4 h-32 w-32 rounded-full bg-amber-500/10 blur-[60px] dark:bg-amber-500/15" />

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

          {/* Title */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <BookOpen className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                Trading Glossary
              </h1>
              <p className="text-sm text-muted-foreground">
                Master every trading term — from basic to advanced
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search terms... (press / to focus)"
              className="pl-10 pr-10 h-11 rounded-xl bg-card/80 border-border/60 focus:border-primary/40"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Stats + Seed Button */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-xs font-semibold">
              {terms.length} {terms.length === 1 ? 'term' : 'terms'}
            </Badge>
            {search && (
              <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
                {filteredTerms.length} results
              </Badge>
            )}
            {terms.length === 0 && !loading && (
              <Button
                size="sm"
                onClick={handleSeed}
                disabled={seeding}
                className="gap-1.5 rounded-lg text-xs h-8"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {seeding ? 'Generating...' : 'Generate Glossary (Realm 1)'}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Alphabet Sidebar + Terms Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="min-h-[30vh] flex flex-col items-center justify-center text-center gap-3">
            <BookOpen className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="text-lg font-bold text-muted-foreground">
                {terms.length === 0 ? 'No glossary terms yet' : 'No terms found'}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {terms.length === 0
                  ? 'Generate glossary terms to get started'
                  : 'Try a different search query'}
              </p>
            </div>
            {terms.length === 0 && (
              <Button
                onClick={handleSeed}
                disabled={seeding}
                className="gap-2 rounded-xl mt-2"
              >
                <Sparkles className="h-4 w-4" />
                {seeding ? 'Generating with AI...' : 'Generate Glossary for Realm 1'}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex gap-4">
            {/* Alphabet Quick Jump — Hidden on mobile */}
            <div className="hidden md:flex flex-col items-center gap-0.5 sticky top-4 self-start shrink-0">
              {ALPHABET.map((letter) => {
                const isAvailable = availableLetters.has(letter)
                const isActive = selectedLetter === letter
                return (
                  <button
                    key={letter}
                    onClick={() => isAvailable && scrollToLetter(letter)}
                    disabled={!isAvailable}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isAvailable
                        ? 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                        : 'text-muted-foreground/20 cursor-default'
                    }`}
                  >
                    {letter}
                  </button>
                )
              })}
            </div>

            {/* Mobile Alphabet Strip */}
            <div className="md:hidden fixed bottom-4 left-0 right-0 z-40 px-4">
              <div className="mx-auto max-w-md flex items-center justify-center gap-0.5 rounded-2xl bg-card/95 backdrop-blur-md border border-border/60 p-1.5 shadow-lg">
                {ALPHABET.filter((l) => availableLetters.has(l)).map((letter) => (
                  <button
                    key={letter}
                    onClick={() => scrollToLetter(letter)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
                      selectedLetter === letter
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms List */}
            <div className="flex-1 min-w-0 pb-16 md:pb-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {Array.from(groupedTerms.entries()).map(([letter, groupTerms]) => (
                  <div key={letter} id={`glossary-group-${letter}`}>
                    {/* Letter Header */}
                    <div className="flex items-center gap-3 mb-3 sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2">
                      <span className="text-2xl font-black text-primary">{letter}</span>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground font-medium">
                        {groupTerms.length} {groupTerms.length === 1 ? 'term' : 'terms'}
                      </span>
                    </div>

                    {/* Term Cards */}
                    <div className="space-y-2">
                      {groupTerms.map((term) => (
                        <motion.div key={term.id} variants={itemVariants}>
                          <Card
                            className="group cursor-pointer overflow-hidden border border-border/60 bg-card/80 backdrop-blur-sm hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
                            onClick={() => fetchTermDetail(term.termId)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  {/* Term Name */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                      {getLocalizedField(term as unknown as Record<string, unknown>, 'term', skillLanguage)}
                                    </h3>
                                    {skillLanguage !== 'en' && term.term && (
                                      <span className="text-xs text-muted-foreground">({term.term})</span>
                                    )}
                                    {term.nodeCount > 0 && (
                                      <Badge variant="outline" className="text-[9px] font-semibold px-1.5 py-0 h-4 text-emerald-600 dark:text-emerald-400 border-emerald-500/25">
                                        <Link2 className="h-2.5 w-2.5 mr-0.5" />
                                        {term.nodeCount}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Simple Definition */}
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {getLocalizedField(term as unknown as Record<string, unknown>, 'simpleDefinition', skillLanguage)}
                                  </p>

                                  {/* Formula preview */}
                                  {term.formula && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                      <Calculator className="h-3 w-3" />
                                      <span className="font-mono truncate">{term.formula}</span>
                                    </div>
                                  )}
                                </div>

                                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        )}
      </section>

      {/* Term Detail Panel */}
      <AnimatePresence>
        {selectedTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => setSelectedTerm(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-border/60 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-card border-b border-border/60 p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-black text-foreground">
                        {getLocalizedField(selectedTerm as unknown as Record<string, unknown>, 'term', skillLanguage)}
                      </h2>
                      {skillLanguage !== 'en' && selectedTerm.term && (
                        <span className="text-sm text-muted-foreground">({selectedTerm.term})</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedTerm.termId}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTerm(null)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {termDetailLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
                </div>
              ) : (
                <div className="p-4 sm:p-6 space-y-5">
                  {/* Simple Definition */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-bold text-foreground">Simple Definition</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                      {getLocalizedField(selectedTerm as unknown as Record<string, unknown>, 'simpleDefinition', skillLanguage)}
                    </p>
                  </div>

                  {/* Professional Definition */}
                  {selectedTerm.professionalDefinition && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">Professional Definition</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                        {selectedTerm.professionalDefinition}
                      </p>
                    </div>
                  )}

                  {/* Formula */}
                  {selectedTerm.formula && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-bold text-foreground">Formula</span>
                      </div>
                      <div className="ml-6 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                        <code className="text-sm font-mono text-amber-700 dark:text-amber-300">
                          {selectedTerm.formula}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* Common Mistake */}
                  {getLocalizedField(selectedTerm as unknown as Record<string, unknown>, 'commonMistake', skillLanguage) && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-bold text-foreground">Common Mistake</span>
                      </div>
                      <div className="ml-6 rounded-lg bg-red-500/5 border border-red-500/20 p-3">
                        <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                          {getLocalizedField(selectedTerm as unknown as Record<string, unknown>, 'commonMistake', skillLanguage)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Real Example */}
                  {getLocalizedField(selectedTerm as unknown as Record<string, unknown>, 'realExample', skillLanguage) && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        <span className="text-sm font-bold text-foreground">Real Example</span>
                      </div>
                      <div className="ml-6 rounded-lg bg-violet-500/5 border border-violet-500/20 p-3">
                        <p className="text-sm text-violet-700 dark:text-violet-300 leading-relaxed">
                          {getLocalizedField(selectedTerm as unknown as Record<string, unknown>, 'realExample', skillLanguage)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Related Terms */}
                  {selectedTerm.relatedTerms && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Link2 className="h-4 w-4 text-cyan-500" />
                        <span className="text-sm font-bold text-foreground">Related Terms</span>
                      </div>
                      <div className="ml-6 flex flex-wrap gap-1.5">
                        {(() => {
                          try {
                            const related = JSON.parse(selectedTerm.relatedTerms)
                            if (Array.isArray(related)) {
                              return related.map((rt: string) => (
                                <Badge
                                  key={rt}
                                  variant="outline"
                                  className="text-xs cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors"
                                  onClick={() => {
                                    setSelectedTerm(null)
                                    setTimeout(() => fetchTermDetail(rt), 100)
                                  }}
                                >
                                  {rt}
                                </Badge>
                              ))
                            }
                          } catch { /* ignore */ }
                          return null
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Linked Nodes */}
                  {selectedTerm.nodes && selectedTerm.nodes.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-bold text-foreground">
                          Used in {selectedTerm.nodes.length} {selectedTerm.nodes.length === 1 ? 'lesson' : 'lessons'}
                        </span>
                      </div>
                      <div className="ml-6 space-y-1.5">
                        {selectedTerm.nodes.map((node) => (
                          <button
                            key={node.nodeId}
                            onClick={() => {
                              setSelectedTerm(null)
                              openNode(node.nodeId)
                            }}
                            className="w-full flex items-center gap-2 rounded-lg p-2 text-left hover:bg-muted/50 transition-colors group"
                          >
                            <span className="text-lg">{node.realm.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {node.title}
                              </p>
                              <p className="text-xs text-muted-foreground">{node.realm.title}</p>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-all shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEBI Disclaimer */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-8">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-xs text-muted-foreground">
            ⚠️ <strong>Disclaimer:</strong> AllTimeTrader.com is NOT a SEBI registered investment advisor. This glossary is for educational purposes only. Please consult a SEBI-registered advisor before making investment decisions.
          </p>
        </div>
      </section>
    </div>
  )
}
