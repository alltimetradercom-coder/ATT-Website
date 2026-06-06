'use client'

import Image from 'next/image'
import { type BrokerData } from '@/data/brokers'

interface BrokerLogoProps {
  broker: BrokerData
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  showBackground?: boolean
}

const SIZE_MAP = {
  xs: { container: 'h-6 w-6', img: 24 },
  sm: { container: 'h-8 w-8', img: 32 },
  md: { container: 'h-10 w-10', img: 40 },
  lg: { container: 'h-12 w-12', img: 48 },
}

const FALLBACK_SIZE_MAP = {
  xs: 'text-[8px]',
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
}

export function BrokerLogo({
  broker,
  size = 'md',
  className = '',
  showBackground = true,
}: BrokerLogoProps) {
  const sizeConfig = SIZE_MAP[size]

  // Brokers whose logos have their own dark background (work in both modes)
  const hasOwnBackground = ['indmoney', 'dhan'].includes(broker.id)

  const containerClasses = `
    relative rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0
    ${sizeConfig.container}
    ${!hasOwnBackground ? 'bg-white' : ''}
    ${hasOwnBackground ? '' : 'border border-border/30'}
    ${className}
  `

  return (
    <div className={containerClasses}>
      <Image
        src={broker.logo}
        alt={`${broker.name} logo`}
        width={sizeConfig.img}
        height={sizeConfig.img}
        className="object-contain p-0.5"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        onError={(e) => {
          // Fallback to broker initials
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `<span class="${FALLBACK_SIZE_MAP[size]} font-bold" style="color:${broker.brandColor}">${broker.shortName}</span>`
          }
        }}
        priority={size === 'lg'}
      />
    </div>
  )
}

/**
 * Inline logo for table rows - uses a simpler layout
 */
export function BrokerLogoInline({
  broker,
  size = 'sm',
}: {
  broker: BrokerData
  size?: 'xs' | 'sm' | 'md'
}) {
  const sizeConfig = SIZE_MAP[size]
  const hasOwnBackground = ['indmoney', 'dhan'].includes(broker.id)

  return (
    <div
      className={`
        relative rounded-md overflow-hidden flex items-center justify-center flex-shrink-0
        ${sizeConfig.container}
        ${!hasOwnBackground ? 'bg-white' : ''}
        ${!hasOwnBackground ? 'border border-border/20' : ''}
      `}
    >
      <Image
        src={broker.logo}
        alt={`${broker.name} logo`}
        width={sizeConfig.img}
        height={sizeConfig.img}
        className="object-contain p-0.5"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `<span class="${FALLBACK_SIZE_MAP[size]} font-bold" style="color:${broker.brandColor}">${broker.shortName}</span>`
          }
        }}
      />
    </div>
  )
}
