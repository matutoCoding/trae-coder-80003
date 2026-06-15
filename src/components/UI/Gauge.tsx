import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface GaugeProps {
  value: number
  min?: number
  max?: number
  label?: string
  className?: string
}

export default function Gauge({
  value,
  min = 0,
  max = 100,
  label,
  className,
}: GaugeProps) {
  const [displayValue, setDisplayValue] = useState(min)

  const clampedValue = Math.min(Math.max(value, min), max)
  const percentage = ((clampedValue - min) / (max - min)) * 100

  const getStatusColor = () => {
    if (percentage >= 80) return '#C93838'
    if (percentage >= 50) return '#D4A853'
    return '#4CAF50'
  }

  const getTextColor = () => {
    if (percentage >= 80) return 'text-lacquer-400'
    if (percentage >= 50) return 'text-gold-400'
    return 'text-green-400'
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(clampedValue)
    }, 100)
    return () => clearTimeout(timer)
  }, [clampedValue])

  const angle = (percentage / 100) * 180 - 90
  const radius = 80
  const strokeWidth = 12
  const centerX = 100
  const centerY = 100

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    }
  }

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
  }

  const statusColor = getStatusColor()
  const needleEnd = polarToCartesian(centerX, centerY, radius - strokeWidth - 5, angle + 90)

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative w-52 h-28">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4CAF50" />
              <stop offset="50%" stopColor="#D4A853" />
              <stop offset="100%" stopColor="#C93838" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={describeArc(centerX, centerY, radius, 0, 180)}
            fill="none"
            stroke="#383838"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          <path
            d={describeArc(centerX, centerY, radius, 0, percentage * 1.8)}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#glow)"
            style={{
              strokeDasharray: 500,
              strokeDashoffset: 500,
              animation: 'gaugeFill 1.5s ease-out forwards',
            }}
          />

          <g transform={`rotate(${angle}, ${centerX}, ${centerY})`} style={{ transition: 'transform 1s ease-out' }}>
            <line
              x1={centerX}
              y1={centerY}
              x2={centerX}
              y2={centerY - radius + strokeWidth + 8}
              stroke={statusColor}
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r="8"
              fill={statusColor}
              filter="url(#glow)"
            />
          </g>

          <circle cx={centerX} cy={centerY} r="5" fill="#1A1A1A" />
        </svg>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-ink-500">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div className={cn('text-3xl font-bold font-serif', getTextColor())}>
          {Math.round(displayValue)}
        </div>
        {label && (
          <div className="text-sm text-ink-400 mt-1">{label}</div>
        )}
      </div>

      <style>{`
        @keyframes gaugeFill {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}
