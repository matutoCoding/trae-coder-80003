import { cn } from '@/lib/utils'

type BadgeColor = 'gold' | 'red' | 'green' | 'gray'

interface BadgeProps {
  color?: BadgeColor
  pulsing?: boolean
  dot?: boolean
  children?: React.ReactNode
  className?: string
}

export default function Badge({
  color = 'gold',
  pulsing = false,
  dot = false,
  children,
  className,
}: BadgeProps) {
  const colors: Record<BadgeColor, string> = {
    gold: cn(
      'bg-gold-500/20 text-gold-300 border-gold-500/40',
      pulsing && 'shadow-[0_0_8px_rgba(212,168,83,0.6)]'
    ),
    red: cn(
      'bg-lacquer-500/20 text-lacquer-300 border-lacquer-500/40',
      pulsing && 'shadow-[0_0_8px_rgba(201,56,56,0.6)]'
    ),
    green: cn(
      'bg-green-500/20 text-green-400 border-green-500/40',
      pulsing && 'shadow-[0_0_8px_rgba(76,175,80,0.6)]'
    ),
    gray: cn(
      'bg-ink-600/50 text-ink-300 border-ink-500/40',
      pulsing && 'shadow-[0_0_8px_rgba(102,102,102,0.4)]'
    ),
  }

  const dotColors: Record<BadgeColor, string> = {
    gold: 'bg-gold-400',
    red: 'bg-lacquer-400',
    green: 'bg-green-400',
    gray: 'bg-ink-400',
  }

  if (dot) {
    return (
      <span className="relative inline-flex">
        <span
          className={cn(
            'inline-flex h-2.5 w-2.5 rounded-full',
            dotColors[color],
            pulsing && 'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75'
          )}
        />
        <span
          className={cn(
            'relative inline-flex rounded-full h-2.5 w-2.5',
            dotColors[color]
          )}
        />
        {children && (
          <span className="ml-2 text-xs text-ink-300">{children}</span>
        )}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colors[color],
        pulsing && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  )
}
