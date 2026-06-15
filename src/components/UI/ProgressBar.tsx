import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  label?: string
  max?: number
  showPercentage?: boolean
  className?: string
}

export default function ProgressBar({
  value,
  label,
  max = 100,
  showPercentage = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gold-300">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-mono text-gold-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="relative w-full h-2.5 rounded-full bg-ink-700 overflow-hidden border border-ink-600/50">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #B88A3A 0%, #D4A853 50%, #E5B52E 100%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
