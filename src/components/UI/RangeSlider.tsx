import { cn } from '@/lib/utils'

interface RangeSliderProps {
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  id?: string
}

export default function RangeSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  id,
}: RangeSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || value !== undefined) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <label
              htmlFor={id}
              className="text-sm font-medium text-gold-300"
            >
              {label}
            </label>
          )}
          <span className="text-sm font-mono text-gold-400 bg-ink-800/50 px-2 py-0.5 rounded border border-gold-600/30">
            {value}
          </span>
        </div>
      )}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-full bg-ink-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-150"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="relative w-full h-1.5 bg-transparent appearance-none cursor-pointer z-10"
          style={{ WebkitAppearance: 'none' }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-ink-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
