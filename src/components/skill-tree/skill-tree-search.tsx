'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { getLocalizedText } from './language-switcher'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X, Zap, Loader2 } from 'lucide-react'

interface SearchResult {
  nodeId: string
  title: string
  titleHi: string | null
  titleTe: string | null
  difficulty: string
  xp: number
  contentType: string
  realmId: number
  realmTitle: string
  realmTitleHi: string | null
  realmTitleTe: string | null
  realmIcon: string
  realmColor: string
  status: string
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Beginner': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
    case 'Intermediate': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
    case 'Advanced': return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25'
    default: return 'bg-muted text-muted-foreground border-border'
  }
}

export function SkillTreeSearch() {
  const { openNode, skillLanguage } = useAppStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/skill-tree/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (data.results) {
        setResults(data.results)
      }
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.trim().length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    debounceRef.current = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, performSearch])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter' && query.trim().length >= 2) {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectResult(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    openNode(result.nodeId)
    setQuery('')
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const showDropdown = isOpen && (query.trim().length >= 2 || results.length > 0)

  return (
    <div ref={containerRef} className="relative w-full sm:max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search skills, topics, realms..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true)
            }
          }}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9 h-9 text-sm rounded-lg border-border/60 bg-card/80 backdrop-blur-sm focus:border-primary/60 focus:ring-primary/20"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Results Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/60 bg-card/95 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {results.length === 0 && !isLoading && query.trim().length >= 2 ? (
              <div className="p-4 text-center">
                <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-2">
                  <Search className="h-4 w-4 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">No results found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
              </div>
            ) : (
              results.map((result, index) => {
                const realmTitle = getLocalizedText(
                  { title: result.realmTitle, titleHi: result.realmTitleHi, titleTe: result.realmTitleTe },
                  'title',
                  skillLanguage
                )
                const nodeTitle = getLocalizedText(
                  { title: result.title, titleHi: result.titleHi, titleTe: result.titleTe },
                  'title',
                  skillLanguage
                )

                return (
                  <button
                    key={result.nodeId}
                    onClick={() => handleSelectResult(result)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-primary/10'
                        : 'hover:bg-accent/50'
                    } ${index < results.length - 1 ? 'border-b border-border/30' : ''}`}
                  >
                    {/* Realm icon */}
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm shrink-0"
                      style={{ backgroundColor: `${result.realmColor}20` }}
                    >
                      {result.realmIcon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{nodeTitle}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: result.realmColor }}
                        >
                          {realmTitle}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">•</span>
                        <span className="text-[10px] text-muted-foreground">{result.nodeId}</span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[8px] font-bold px-1.5 py-0 h-4 ${getDifficultyColor(result.difficulty)}`}
                      >
                        {result.difficulty}
                      </Badge>
                      <span className="text-[10px] font-semibold text-primary flex items-center gap-0.5">
                        <Zap className="h-2.5 w-2.5" />
                        {result.xp}
                      </span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
