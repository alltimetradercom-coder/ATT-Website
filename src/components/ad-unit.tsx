'use client'

interface AdUnitProps {
  variant?: 'leaderboard' | 'rectangle'
}

export function AdUnit({ variant = 'leaderboard' }: AdUnitProps) {
  const sizeClass = variant === 'leaderboard'
    ? 'max-w-[728px] h-[90px]'
    : 'max-w-[300px] h-[250px]'

  return (
    <div className="flex justify-center py-4">
      <div
        className={`flex items-center justify-center border border-dashed border-border/50 rounded-lg bg-muted/20 ${sizeClass} w-full`}
      >
        <span className="text-xs text-muted-foreground/50 uppercase tracking-wider">Advertisement</span>
      </div>
    </div>
  )
}
