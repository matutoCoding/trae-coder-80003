import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import ProgressBar from '@/components/UI/ProgressBar'
import Badge from '@/components/UI/Badge'
import ProcessOrderModal from '@/components/ProcessOrderModal'
import { useAppStore } from '@/store/useAppStore'
import { calculateStackHeight, calculateTotalThreadLength, calculateCoilingDensity } from '@/utils/densityCalc'
import { generateSpiralPath, generateCirclePath } from '@/utils/pathGenerator'
import type { CoilingLayer, PathData, Pattern, CoilingModel } from '@/types'

const CoilingModelPage = () => {
  const { 
    currentCoilingModel, 
    currentMixture, 
    currentPattern,
    createCraftRecord,
    saveAsTemplate
  } = useAppStore()
  const navigate = useNavigate()
  
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

  const [isProcessOrderOpen, setIsProcessOrderOpen] = useState(false)
  const [isSaveRecordDialogOpen, setIsSaveRecordDialogOpen] = useState(false)
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false)
  const [recordName, setRecordName] = useState('')
  const [recordNotes, setRecordNotes] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const detailedProcessSteps = [
    { id: 'prep', name: '准备工作', duration: 1, description: '整理工具与材料', icon: '🧰', tools: ['工作台', '清洁布', '量具'], keyPoints: ['确保工作环境清洁无尘', '检查工具是否完好', '准备好所需漆料和辅料'], caution: '注意温度湿度控制' },
    { id: 'twisting', name: '搓线', duration: 2, description: '将漆料搓成均匀漆线', icon: '🧵', tools: ['搓线板', '线轴', '卡尺'], keyPoints: ['力度均匀，线径一致', '每10cm检查一次线径', '搓好后静置30分钟定型'], caution: '避免线径粗细不均' },
    { id: 'coiling', name: '盘绕', duration: 4, description: '按图案盘绕漆线', icon: '🔄', tools: ['盘绕针', '镊子', '放大镜'], keyPoints: ['按照纹样轮廓线盘绕', '转角处缓慢操作', '每完成一段轻压定型'], caution: '注意线条间距均匀' },
    { id: 'drying-check-1', name: '初次干燥检查', duration: 0.5, description: '检查第一层干燥状态', icon: '☀️', tools: ['温湿度计', '硬度计'], keyPoints: ['表面是否固化', '有无变形现象', '硬度是否达标'], caution: '未干透不可进行下一步', isCheckpoint: true },
    { id: 'stacking', name: '堆叠', duration: 3, description: '多层堆叠成型', icon: '📚', tools: ['堆叠针', '高度尺', '水平仪'], keyPoints: ['逐层堆叠，高度一致', '不断检查垂直度', '每3层静置1小时'], caution: '注意层间粘接强度' },
    { id: 'drying-check-2', name: '二次干燥检查', duration: 0.5, description: '检查整体干燥状态', icon: '🌡️', tools: ['温湿度计', '硬度计', '放大镜'], keyPoints: ['整体硬度是否均匀', '有无开裂变形', '收缩率是否正常'], caution: '完全干燥方可贴金', isCheckpoint: true },
    { id: 'gilding', name: '贴金', duration: 2, description: '贴金箔装饰', icon: '✨', tools: ['金箔', '贴金笔', '金胶'], keyPoints: ['确保漆层完全干燥', '金胶薄而均匀', '动作轻柔避免褶皱'], caution: '多余金箔用软毛刷扫去' },
    { id: 'finishing', name: '收尾整理', duration: 1, description: '检查与修整', icon: '🎨', tools: ['软毛刷', '放大镜', '清洁布'], keyPoints: ['检查整体效果', '修整瑕疵部位', '清洁表面灰尘'], caution: '避免碰伤漆面' },
  ]

  const totalProcessTime = detailedProcessSteps.reduce((sum, step) => sum + step.duration, 0)

  const effectivePattern = currentPattern || {
    id: 'default-pattern',
    name: '未命名纹样',
    description: '当前设计的纹样',
    category: '自定义',
    imageUrl: '',
    complexity: 3,
    layers: [],
    tags: []
  } as Pattern

  const effectiveCoilingModel: CoilingModel = useMemo(() => {
    if (currentCoilingModel) {
      return currentCoilingModel
    }
    return {
      id: 'temp-coiling',
      name: '临时盘绕模型',
      totalLayers: layers.length,
      totalHeight,
      baseDensity: coilingDensity,
      steps: layers.map((layer, i) => ({
        id: `step-${i}`,
        name: layer.name,
        description: `${layer.name}盘绕`,
        duration: 30,
        density: layer.density,
        layerHeight: layer.height
      })),
      estimatedTime: totalProcessTime,
      wireLength: totalThreadLength
    }
  }, [currentCoilingModel, layers, totalHeight, coilingDensity, totalProcessTime, totalThreadLength])

  const handleOpenProcessOrder = () => {
    setIsProcessOrderOpen(true)
  }

  const handleCloseProcessOrder = () => {
    setIsProcessOrderOpen(false)
  }

  const handleSaveAsRecord = () => {
    setIsProcessOrderOpen(false)
    setIsSaveRecordDialogOpen(true)
    setRecordName(currentPattern?.name || '')
  }

  const handleConfirmSaveRecord = () => {
    if (!recordName.trim()) {
      return
    }
    try {
      const recordId = createCraftRecord(recordName, recordNotes)
      setSaveSuccess(true)
      setIsSaveRecordDialogOpen(false)
      setRecordName('')
      setRecordNotes('')
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('保存档案失败:', error)
    }
  }

  const handleGoToRecords = () => {
    navigate('/records')
  }

  const handleSaveAsTemplate = () => {
    setIsSaveTemplateDialogOpen(true)
    setTemplateName(currentPattern?.name || '我的模板')
    setTemplateDescription('')
  }

  const handleConfirmSaveTemplate = () => {
    if (!templateName.trim()) {
      return
    }
    saveAsTemplate(templateName, templateDescription)
    setIsSaveTemplateDialogOpen(false)
    setTemplateName('')
    setTemplateDescription('')
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
    }, 3000)
  }

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

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gold-300">风险提示</div>
                  {currentMixture.warnings && currentMixture.warnings.length > 0 ? (
                    currentMixture.warnings.slice(0, 3).map((warning, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-2 p-2.5 rounded-lg border
                          ${warning.level === 'danger' ? 'bg-lacquer-500/10 border-lacquer-500/40' : ''}
                          ${warning.level === 'warning' ? 'bg-amber-500/10 border-amber-500/40' : ''}
                          ${warning.level === 'info' ? 'bg-blue-500/10 border-blue-500/40' : ''}
                        `}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5
                            ${warning.level === 'danger' ? 'bg-lacquer-500' : ''}
                            ${warning.level === 'warning' ? 'bg-amber-500' : ''}
                            ${warning.level === 'info' ? 'bg-blue-500' : ''}
                          `}
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <Badge
                            color={warning.level === 'danger' ? 'red' : warning.level === 'warning' ? 'gold' : 'gray'}
                            className="mb-1 text-[10px] px-1.5 py-0"
                          >
                            {warning.type}
                          </Badge>
                          <p className="text-xs text-ink-300">{warning.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-xs text-green-400 font-medium">配比合理，无特殊风险</p>
                    </div>
                  )}
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
                  
                  <div className="relative flex justify-between overflow-x-auto pb-2">
                    {detailedProcessSteps.slice(0, 5).map((step, index) => (
                      <div key={step.id} className="flex flex-col items-center min-w-[60px]">
                        <div 
                          className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center text-lg
                            border-2 shadow-lg transition-all
                            ${step.isCheckpoint 
                              ? 'bg-gradient-to-br from-lacquer-600 to-lacquer-700 border-lacquer-400/60' 
                              : 'bg-gradient-to-br from-lacquer-700 to-lacquer-800 border-gold-500/60'
                            }`}
                          style={{
                            boxShadow: step.isCheckpoint 
                              ? '0 0 12px rgba(205, 92, 92, 0.4)' 
                              : '0 0 12px rgba(212, 168, 83, 0.3)'
                          }}
                        >
                          {step.icon}
                        </div>
                        <div className="mt-2 text-center">
                          <div className="text-xs font-medium text-gold-300 whitespace-nowrap">{step.name}</div>
                          <div className="text-xs text-ink-500">{step.duration}h</div>
                        </div>
                      </div>
                    ))}
                    {detailedProcessSteps.length > 5 && (
                      <div className="flex flex-col items-center min-w-[60px]">
                        <div className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center text-sm
                          bg-ink-700 border-2 border-ink-600 text-ink-400">
                          +{detailedProcessSteps.length - 5}
                        </div>
                        <div className="mt-2 text-center">
                          <div className="text-xs text-ink-500">更多工序</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {detailedProcessSteps.map((step, index) => (
                    <div 
                      key={step.id}
                      className={`p-2.5 rounded-lg border transition-colors
                        ${step.isCheckpoint 
                          ? 'bg-lacquer-900/20 border-lacquer-600/30' 
                          : 'bg-ink-800/30 border-gold-600/10 hover:border-gold-600/30'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                          ${step.isCheckpoint 
                            ? 'bg-gradient-to-br from-lacquer-500 to-lacquer-600 text-white' 
                            : 'bg-gradient-to-br from-gold-500 to-gold-600 text-ink-900'
                          }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium
                              ${step.isCheckpoint ? 'text-lacquer-300' : 'text-gold-300'}`}>
                              {step.name}
                            </span>
                            {step.isCheckpoint && (
                              <Badge color="red" className="text-[10px] px-1.5 py-0">
                                检查点
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-ink-400 truncate">{step.description}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-mono text-gold-400">{step.duration}h</div>
                        </div>
                      </div>
                      <div className="mt-2 pl-9 flex flex-wrap gap-1.5">
                        {step.tools.slice(0, 3).map((tool: string) => (
                          <span key={tool} className="text-[10px] px-1.5 py-0.5 rounded bg-ink-700/50 text-ink-400">
                            {tool}
                          </span>
                        ))}
                        {step.tools.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-ink-700/50 text-ink-500">
                            +{step.tools.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gold-600/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-ink-400">工序工时</span>
                    <div className="text-right">
                      <span className="text-xl font-serif font-bold text-gold-gradient">{totalProcessTime.toFixed(1)}</span>
                      <span className="text-sm text-ink-400 ml-1">小时</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-sm text-ink-400">含干燥时间</span>
                    <span className="text-sm font-mono text-lacquer-400">{(totalProcessTime + dryingTime).toFixed(1)} 小时</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-sm text-ink-400">检查节点</span>
                    <span className="text-sm font-mono text-lacquer-400">
                      {detailedProcessSteps.filter(s => s.isCheckpoint).length} 个
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="primary" className="w-full" onClick={handleOpenProcessOrder}>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    生成工艺单
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" className="text-xs py-2" onClick={handleSaveAsTemplate}>
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      另存为模板
                    </Button>
                    <Button variant="secondary" className="text-xs py-2" onClick={() => setIsSaveRecordDialogOpen(true)}>
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      保存到档案
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ProcessOrderModal
        isOpen={isProcessOrderOpen}
        onClose={handleCloseProcessOrder}
        pattern={effectivePattern}
        mixture={currentMixture}
        coilingModel={effectiveCoilingModel}
        onSaveAsRecord={handleSaveAsRecord}
      />

      {isSaveRecordDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
            onClick={() => setIsSaveRecordDialogOpen(false)}
          />
          <div className="relative w-full max-w-md bg-gradient-to-br from-ink-900 via-ink-900/95 to-ink-950 border border-gold-600/40 rounded-lg shadow-2xl shadow-gold-500/10 p-6">
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gold-500 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-gold-500 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-gold-500 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-gold-500 rounded-br-sm pointer-events-none" />

            <h3 className="text-xl font-serif font-bold text-gold-gradient mb-4">存入工艺档案</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gold-300 mb-1.5">作品名称</label>
                <input
                  type="text"
                  value={recordName}
                  onChange={(e) => setRecordName(e.target.value)}
                  placeholder="请输入作品名称"
                  className="w-full px-3 py-2 bg-ink-800/50 border border-gold-600/30 rounded-md text-ink-200 placeholder-ink-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gold-300 mb-1.5">备注说明</label>
                <textarea
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  placeholder="可填写工艺要点、注意事项等"
                  rows={3}
                  className="w-full px-3 py-2 bg-ink-800/50 border border-gold-600/30 rounded-md text-ink-200 placeholder-ink-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsSaveRecordDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleConfirmSaveRecord}
                disabled={!recordName.trim()}
              >
                确认保存
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSaveTemplateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
            onClick={() => setIsSaveTemplateDialogOpen(false)}
          />
          <div className="relative w-full max-w-md bg-gradient-to-br from-ink-900 via-ink-900/95 to-ink-950 border border-gold-600/40 rounded-lg shadow-2xl shadow-gold-500/10 p-6">
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gold-500 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-gold-500 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-gold-500 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-gold-500 rounded-br-sm pointer-events-none" />

            <h3 className="text-xl font-serif font-bold text-gold-gradient mb-4">另存为模板</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gold-300 mb-1.5">模板名称</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="请输入模板名称"
                  className="w-full px-3 py-2 bg-ink-800/50 border border-gold-600/30 rounded-md text-ink-200 placeholder-ink-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gold-300 mb-1.5">模板描述</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="简要描述该模板的特点和适用场景"
                  rows={3}
                  className="w-full px-3 py-2 bg-ink-800/50 border border-gold-600/30 rounded-md text-ink-200 placeholder-ink-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsSaveTemplateDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleConfirmSaveTemplate}
                disabled={!templateName.trim()}
              >
                确认保存
              </Button>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60]">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/20 border border-green-500/40 rounded-lg shadow-lg animate-pulse-slow">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-300 font-medium">保存成功</span>
            <button
              onClick={handleGoToRecords}
              className="ml-2 text-sm text-gold-400 hover:text-gold-300 underline underline-offset-2"
            >
              查看档案
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoilingModelPage
