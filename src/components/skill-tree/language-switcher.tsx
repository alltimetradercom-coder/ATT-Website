'use client'

import { useAppStore, type SkillLanguage } from '@/lib/store'
import { Button } from '@/components/ui/button'

const languages: { code: SkillLanguage; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'te', label: 'తెలుగు' },
]

export function LanguageSwitcher() {
  const { skillLanguage, setSkillLanguage } = useAppStore()

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant="ghost"
          size="sm"
          onClick={() => setSkillLanguage(lang.code)}
          className={`h-7 px-2.5 text-xs font-semibold rounded-md transition-all ${
            skillLanguage === lang.code
              ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          {lang.label}
        </Button>
      ))}
    </div>
  )
}

// Helper to get localized text based on language
export function getLocalizedText(
  obj: { title?: string; titleHi?: string | null; titleTe?: string | null } | null | undefined,
  field: 'title' | 'subtitle' | 'description' | 'bossName' | 'badgeTitle',
  language: SkillLanguage
): string {
  if (!obj) return ''
  const hiKey = `${field}Hi` as keyof typeof obj
  const teKey = `${field}Te` as keyof typeof obj
  const baseKey = field as keyof typeof obj

  if (language === 'hi' && obj[hiKey]) return obj[hiKey] as string
  if (language === 'te' && obj[teKey]) return obj[teKey] as string
  return (obj[baseKey] as string) || ''
}
