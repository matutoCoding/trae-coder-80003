import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  disabled,
  loading,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants: Record<ButtonVariant, string> = {
    primary: cn(
      'bg-gradient-to-r from-lacquer-600 to-lacquer-700',
      'text-gold-300',
      'border border-gold-600/50',
      'hover:from-lacquer-500 hover:to-lacquer-600',
      'hover:text-gold-200',
      'hover:border-gold-500/70',
      'hover:shadow-gold/30',
      'active:from-lacquer-700 active:to-lacquer-800',
      'focus:ring-gold-500/50'
    ),
    secondary: cn(
      'bg-transparent',
      'text-gold-400',
      'border border-gold-600/60',
      'hover:bg-gold-500/10',
      'hover:text-gold-300',
      'hover:border-gold-500',
      'focus:ring-gold-500/40'
    ),
    ghost: cn(
      'bg-transparent',
      'text-gold-400',
      'border border-transparent',
      'hover:bg-gold-500/10',
      'hover:text-gold-300',
      'focus:ring-gold-500/30'
    ),
  }

  return (
    <button
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
