import { cn } from '@/lib/utils'

interface CardProps {
  title?: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export default function Card({ title, subtitle, children, className }: CardProps) {
  return (
    <div
      className={cn(
        'relative p-6 rounded-lg',
        'bg-gradient-to-br from-lacquer-800/30 via-ink-900/80 to-ink-950',
        'border border-gold-600/30',
        'shadow-lacquer hover:shadow-gold/20',
        'transition-all duration-300 ease-out',
        'before:content-[""] before:absolute before:top-0 before:left-0 before:w-4 before:h-4 before:border-t-2 before:border-l-2 before:border-gold-500 before:rounded-tl-sm',
        'before:pointer-events-none',
        'after:content-[""] after:absolute after:bottom-0 after:right-0 after:w-4 after:h-4 after:border-b-2 after:border-r-2 after:border-gold-500 after:rounded-br-sm',
        'after:pointer-events-none',
        className
      )}
    >
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gold-500 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gold-500 rounded-bl-sm pointer-events-none" />

      {(title || subtitle) && (
        <div className="mb-4 pb-3 border-b border-gold-600/20">
          {title && (
            <h3 className="text-lg font-serif font-semibold text-gold-gradient">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-ink-400">{subtitle}</p>
          )}
        </div>
      )}

      <div className="text-ink-100">
        {children}
      </div>
    </div>
  )
}
