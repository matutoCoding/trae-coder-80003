import { useState, useMemo, useEffect } from 'react'
import Card from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import ProgressBar from '@/components/UI/ProgressBar'
import Badge from '@/components/UI/Badge'
import { useAppStore } from '@/store/useAppStore'
import { calculateStackHeight, calculateTotalThreadLength, calculateCoilingDensity } from '@/utils/densityCalc'
import { generateSpiralPath, generateCirclePath } from '@/utils/pathGenerator'
import type { CoilingLayer, PathData } from '@/types'

const CoilingModelPage = () => {
  const { currentCoilingModel, currentMixture } = useAppStore()
  
  const [rotateX, setRotateX] = useState(25)
  const [rotateY, setRotateY] = useState(30)
  const [lightAngle, setLightAngle] = useState(45)
  const [layers] = useState<CoilingLayer[]>(() => {
    const result: CoilingLayer[] = []
    const layerCount = 5
    for (let i = 0; i < layerCount; i++) {
      const paths: PathData[] = []
      const spiralPath = generateSpiralPath(150, 150, 20 + i * 15, 100 - i * 10, 3 + i, 60)
      paths.push({
        id: `spiral-${i}`,
        points: spiralPath,
        color: i % 2 === 0 ? '#D4A853' : '#C93838'
      })
      for (let j = 0; j < 3; j++) {
        const circleRadius = 30 + j * 25 + i * 5
        const circlePath = generateCirclePath(150, 150, circleRadius, 80)
        paths.push({
          id: `circle-${i}-${j}`,
          points: circlePath,
          color: i % 2 === 0 ? '#E5B52E' : '#A82B2B'
        })
      }
      result.push({
        id: `layer-${i}`,
        name: `第${i + 1}层`,
        paths,
        density: 65 + i * 8,
        height: 0.8 + i * 0.6,
        order: i
      })
    }
    return result
  })

  const [dryingStatus, setDryingStatus] = useState<'not-dry' | 'drying' | 'dry'>('drying')
  const [dryingProgress, setDryingProgress] = useState(65)

  useEffect(() => {
    if (dryingStatus === 'drying' && dryingProgress < 100) {
      const timer = setInterval(() => {
        setDryingProgress(prev => {
          if (prev >= 100) {
            setDryingStatus('dry')
            return 100
          }
          return prev + 0.5
        })
      }, 500)
      return () => clearInterval(timer)
    }
  }, [dryingStatus, dryingProgress])

  const totalHeight = useMemo(() => {
    if (currentCoilingModel) {
      return currentCoilingModel.totalHeight
    }
    return calculateStackHeight(currentMixture.recommendedDiameter, layers.length, 0.9)
  }, [currentCoilingModel, currentMixture.recommendedDiameter, layers.length])

  const totalThreadLength = useMemo(() => {
    if (currentCoilingModel) {
      return currentCoilingModel.wireLength
    }
    return calculateTotalThreadLength(layers)
  }, [currentCoilingModel, layers])

  const coilingDensity = useMemo(() => {
    if (currentCoilingModel) {
      return currentCoilingModel.baseDensity
    }
    const area = Math.PI * 100 * 100
    const allPaths = layers.flatMap(l => l.paths)
    return calculateCoilingDensity(allPaths, area)
  }, [currentCoilingModel, layers])

  const totalLayers = currentCoilingModel?.totalLayers || layers.length

  const processSteps = [
    { id: 'twisting', name: '搓线', duration: 2, description: '将漆料搓成均匀漆线', icon: '🧵' },
    { id: 'coiling', name: '盘绕', duration: 4, description: '按图案盘绕漆线', icon: '🔄' },
    { id: 'stacking', name: '堆叠', duration: 3, description: '多层堆叠成型', icon: '📚' },
    { id: 'gilding', name: '贴金', duration: 2, description: '贴金箔装饰', icon: '✨' },
  ]

  const totalTime = processSteps.reduce((sum, step) => sum + step.duration, 0)

  const dryingTime = Math.ceil(totalHeight * 2.5)
  const currentTemp = 22
  const currentHumidity = 65

  const getDryingStatusInfo = () => {
    switch (dryingStatus) {
      case 'not-dry':
        return { color: 'gray' as const, text: '未干燥', pulsing: false }
      case 'drying':
        return { color: 'gold' as const, text: '干燥中', pulsing: true }
      case 'dry':
        return { color: 'green' as const, text: '已干燥', pulsing: false }
    }
  }

  const dryingInfo = getDryingStatusInfo()

  return (
    <div className="min-h-screen bg-ink-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-serif font-bold text-gold-gradient mb-2">
            盘绕造型
          </h1>
          <p className="text-ink-400 text-lg">
            模拟堆叠层次与光影效果，规划工序流程
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="立体模拟" subtitle="2.5D立体效果展示漆线堆叠">
              <div className="flex flex-col gap-6">
                <div 
                  className="relative w-full h-96 rounded-lg overflow-hidden bg-gradient-to-br from-ink-900 to-ink-950 border border-gold-600/20"
                  style={{ perspective: '1000px' }}
                >
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.3s ease-out'
                    }}
                  >
                    <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
                      {layers.map((layer, index) => (
                        <div
                          key={layer.id}
                          className="absolute"
                          style={{
                            transform: `translateZ(${index * 20}px)`,
                            transformStyle: 'preserve-3d',
                            left: '50%',
                            top: '50%',
                            marginLeft: '-150px',
                            marginTop: '-150px',
                          }}
                        >
                          <svg width="300" height="300" viewBox="0 0 300 300">
                            <defs>
                              <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                              <linearGradient id={`line-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={index % 2 === 0 ? '#E5B52E' : '#D95252'} />
                                <stop offset="50%" stopColor={index % 2 === 0 ? '#D4A853' : '#C93838'} />
                                <stop offset="100%" stopColor={index % 2 === 0 ? '#B88A3A' : '#A82B2B'} />
                              </linearGradient>
                            </defs>
                            {layer.paths.map((path) => {
                              const pathD = path.points.map((p, i) => 
                                i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
                              ).join(' ')
                              return (
                                <path
                                  key={path.id}
                                  d={pathD}
                                  fill="none"
                                  stroke={`url(#line-gradient-${index})`}
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  filter={`url(#glow-${index})`}
                                  style={{
                                    filter: `drop-shadow(${Math.cos(lightAngle * Math.PI / 180) * 2}px ${Math.sin(lightAngle * Math.PI / 180) * 2}px 4px rgba(0,0,0,0.5))`
                                  }}
                                />
                              )
                            })}
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div 
                    className="absolute w-32 h-32 rounded-full opacity-30 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                      left: `${30 + Math.cos(lightAngle * Math.PI / 180) * 20}%`,
                      top: `${20 + Math.sin(lightAngle * Math.PI / 180) * 20}%`,
                      transform: 'translate(-50%, -50%)',
                      transition: 'all 0.3s ease-out'
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-ink-800/50 rounded-lg p-3 border border-gold-600/20">
                    <div className="text-xs text-ink-400 mb-1">堆叠高度</div>
                    <div className="text-xl font-serif font-bold text-gold-300">
                      {totalHeight.toFixed(2)} <span className="text-sm font-normal text-ink-400">mm</span>
                    </div>
                  </div>
                  <div className="bg-ink-800/50 rounded-lg p-3 border border-gold-600/20">
                    <div className="text-xs text-ink-400 mb-1">盘绕密度</div>
                    <div className="text-xl font-serif font-bold text-gold-300">
                      {coilingDensity.toFixed(1)} <span className="text-sm font-normal text-ink-400">%</span>
                    </div>
                  </div>
                  <div className="bg-ink-800/50 rounded-lg p-3 border border-gold-600/20">
                    <div className="text-xs text-ink-400 mb-1">总层数</div>
                    <div className="text-xl font-serif font-bold text-lacquer-400">
                      {totalLayers} <span className="text-sm font-normal text-ink-400">层</span>
                    </div>
                  </div>
                  <div className="bg-ink-800/50 rounded-lg p-3 border border-gold-600/20">
                    <div className="text-xs text-ink-400 mb-1">用线量</div>
                    <div className="text-xl font-serif font-bold text-gold-300">
                      {(totalThreadLength / 1000).toFixed(2)} <span className="text-sm font-normal text-ink-400">m</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gold-300">角度控制</div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-ink-400 mb-1">
                          <span>水平旋转</span>
                          <span>{rotateY}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={rotateY}
                          onChange={(e) => setRotateY(Number(e.target.value))}
                          className="w-full h-2 bg-ink-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-ink-400 mb-1">
                          <span>垂直倾斜</span>
                          <span>{rotateX}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={rotateX}
                          onChange={(e) => setRotateX(Number(e.target.value))}
                          className="w-full h-2 bg-ink-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gold-300">光影控制</div>
                    <div>
                      <div className="flex justify-between text-xs text-ink-400 mb-1">
                        <span>光源角度</span>
                        <span>{lightAngle}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={lightAngle}
                        onChange={(e) => setLightAngle(Number(e.target.value))}
                        className="w-full h-2 bg-ink-700 rounded-lg appearance-none cursor-pointer accent-lacquer-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" className="flex-1 py-1.5 text-xs" onClick={() => { setRotateX(25); setRotateY(30); setLightAngle(45); }}>
                        重置视角
                      </Button>
                      <Button variant="secondary" className="flex-1 py-1.5 text-xs" onClick={() => { setRotateX(0); setRotateY(0); setLightAngle(45); }}>
                        正视图
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="密度高度计算" subtitle="盘绕参数统计">
              <div className="space-y-5">
                <div className="flex justify-center">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                      <defs>
                        <linearGradient id="density-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#D4A853" />
                          <stop offset="100%" stopColor="#E5B52E" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#383838"
                        strokeWidth="10"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="url(#density-gradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(coilingDensity / 100) * 314} 314`}
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
                      />
                      <text
                        x="60"
                        y="55"
                        textAnchor="middle"
                        className="text-2xl font-serif font-bold fill-gold-300"
                        style={{ fontSize: '24px' }}
                      >
                        {Math.round(coilingDensity)}%
                      </text>
                      <text
                        x="60"
                        y="75"
                        textAnchor="middle"
                        className="fill-ink-400"
                        style={{ fontSize: '12px' }}
                      >
                        盘绕密度
                      </text>
                    </svg>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gold-300">堆叠高度</span>
                      <span className="text-sm font-mono text-gold-400">{totalHeight.toFixed(2)} mm</span>
                    </div>
                    <ProgressBar value={Math.min((totalHeight / 10) * 100, 100)} showPercentage={false} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gold-300">总用线量</span>
                      <span className="text-sm font-mono text-gold-400">{(totalThreadLength / 1000).toFixed(2)} m</span>
                    </div>
                    <ProgressBar value={Math.min((totalThreadLength / 5000) * 100, 100)} showPercentage={false} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gold-600/20">
                  <div className="text-center">
                    <div className="text-2xl font-serif font-bold text-lacquer-400">{totalLayers}</div>
                    <div className="text-xs text-ink-400">层数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-serif font-bold text-gold-300">{currentMixture.recommendedDiameter.toFixed(2)}</div>
                    <div className="text-xs text-ink-400">线径(mm)</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="干燥校检" subtitle="干燥状态与环境监测">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge color={dryingInfo.color} pulsing={dryingInfo.pulsing} dot>
                      {dryingInfo.text}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-serif font-bold text-gold-300">{dryingTime}</div>
                    <div className="text-xs text-ink-400">预估干燥时间(小时)</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-ink-400 mb-1">
                    <span>干燥进度</span>
                    <span>{Math.round(dryingProgress)}%</span>
                  </div>
                  <div className="relative w-full h-3 rounded-full bg-ink-700 overflow-hidden border border-ink-600/50">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${dryingProgress}%`,
                        background: dryingStatus === 'dry' 
                          ? 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)'
                          : 'linear-gradient(90deg, #B88A3A 0%, #D4A853 50%, #E5B52E 100%)',
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-ink-800/50 rounded-lg p-3 border border-gold-600/20 text-center">
                    <div className="text-lg font-mono text-gold-300">{currentTemp}°C</div>
                    <div className="text-xs text-ink-400">环境温度</div>
                  </div>
                  <div className="bg-ink-800/50 rounded-lg p-3 border border-gold-600/20 text-center">
                    <div className="text-lg font-mono text-gold-300">{currentHumidity}%</div>
                    <div className="text-xs text-ink-400">相对湿度</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gold-600/20">
                  <div className="text-sm font-medium text-gold-300">干燥对成型影响</div>
                  <p className="text-xs text-ink-400 leading-relaxed">
                    漆线干燥过程中会产生约5-8%的收缩率。未完全干燥的漆线在堆叠时容易变形，影响最终造型精度。建议每层干燥后再进行下一层堆叠。
                  </p>
                </div>

                <div className="bg-lacquer-900/30 border border-lacquer-600/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lacquer-400 text-lg">⚠</span>
                    <div>
                      <div className="text-sm font-medium text-lacquer-300 mb-1">风险提示</div>
                      <ul className="text-xs text-ink-400 space-y-1">
                        <li>• 湿度过高会延长干燥时间</li>
                        <li>• 温度骤变可能导致漆线开裂</li>
                        <li>• 未干透时堆叠可能造成变形</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="primary" className="flex-1" onClick={() => {
                    if (dryingStatus === 'not-dry') {
                      setDryingStatus('drying')
                      setDryingProgress(0)
                    }
                  }}>
                    开始干燥
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={() => {
                    setDryingStatus('not-dry')
                    setDryingProgress(0)
                  }}>
                    重置
                  </Button>
                </div>
              </div>
            </Card>

            <Card title="工序规划" subtitle="工艺流程与工时统计">
              <div className="space-y-5">
                <div className="relative">
                  <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-600/50 via-gold-500/50 to-gold-600/50" />
                  
                  <div className="relative flex justify-between">
                    {processSteps.map((step, index) => (
                      <div key={step.id} className="flex flex-col items-center">
                        <div 
                          className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl
                            bg-gradient-to-br from-lacquer-700 to-lacquer-800 border-2 border-gold-500/60
                            shadow-lg"
                          style={{
                            boxShadow: '0 0 15px rgba(212, 168, 83, 0.3)'
                          }}
                        >
                          {step.icon}
                        </div>
                        <div className="mt-2 text-center">
                          <div className="text-sm font-medium text-gold-300">{step.name}</div>
                          <div className="text-xs text-ink-400">{step.duration} 小时</div>
                        </div>
                        {index < processSteps.length - 1 && (
                          <div className="absolute top-5 text-gold-500/60" style={{ left: `${(index + 0.5) * (100 / processSteps.length)}%` }}>
                            →
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {processSteps.map((step, index) => (
                    <div 
                      key={step.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-ink-800/30 border border-gold-600/10 hover:border-gold-600/30 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-xs font-bold text-ink-900">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gold-300">{step.name}</div>
                        <div className="text-xs text-ink-400">{step.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-gold-400">{step.duration}h</div>
                        <div className="text-xs text-ink-500">
                          {index === 0 ? '起始工序' : '依赖上一步'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gold-600/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-ink-400">总工时</span>
                    <div className="text-right">
                      <span className="text-2xl font-serif font-bold text-gold-gradient">{totalTime}</span>
                      <span className="text-sm text-ink-400 ml-1">小时</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-ink-400">含干燥时间</span>
                    <span className="text-sm font-mono text-lacquer-400">{totalTime + dryingTime} 小时</span>
                  </div>
                </div>

                <Button variant="primary" className="w-full">
                  生成工艺单
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoilingModelPage
