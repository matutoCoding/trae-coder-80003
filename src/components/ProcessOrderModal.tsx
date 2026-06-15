import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Card from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import Badge from '@/components/UI/Badge'
import type { Pattern, ThreadMixture, CoilingModel } from '@/types'

interface ProcessOrderModalProps {
  isOpen: boolean
  onClose: () => void
  pattern: Pattern
  mixture: ThreadMixture
  coilingModel: CoilingModel
  onSaveAsRecord: () => void
}

interface ProcessStep {
  id: string
  name: string
  duration: string
  tools: string[]
  keyPoints: string[]
  extraInfo?: Record<string, string>
}

export default function ProcessOrderModal({
  isOpen,
  onClose,
  pattern,
  mixture,
  coilingModel,
  onSaveAsRecord,
}: ProcessOrderModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isContentVisible, setIsContentVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsContentVisible(true), 50)
      document.body.style.overflow = 'hidden'
    } else {
      setIsContentVisible(false)
      const timer = setTimeout(() => setIsVisible(false), 300)
      document.body.style.overflow = ''
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const processSteps: ProcessStep[] = [
    {
      id: 'twisting',
      name: '搓线',
      duration: '2-3 小时',
      tools: ['搓线板', '线轴', '卡尺', '恒温箱'],
      keyPoints: [
        '保持搓线力度均匀，避免线径粗细不均',
        '每搓10cm检查一次线径，确保在公差范围内',
        '搓好的线需静置30分钟定型后方可使用',
        '环境温度控制在20-25℃，湿度50%-60%'
      ]
    },
    {
      id: 'coiling',
      name: '盘绕',
      duration: `${coilingModel.estimatedTime} 小时`,
      tools: ['盘绕针', '镊子', '放大镜', '定位尺'],
      keyPoints: [
        '按照纹样轮廓线进行盘绕，保持线条流畅',
        '转角处需缓慢操作，避免线条断裂',
        '每完成一段需用重物轻压定型',
        '注意线条间距均匀，保持视觉平衡'
      ],
      extraInfo: {
        '密度要求': `${coilingModel.baseDensity} 根/cm`,
        '总层数': `${coilingModel.totalLayers} 层`
      }
    },
    {
      id: 'stacking',
      name: '堆叠',
      duration: '4-6 小时',
      tools: ['堆叠针', '高度尺', '水平仪', '压重块'],
      keyPoints: [
        '逐层堆叠，每层高度需保持一致',
        '堆叠过程中需不断检查垂直度',
        '每完成3层需静置1小时使其稳定',
        '注意层与层之间的粘接强度'
      ],
      extraInfo: {
        '总层数': `${coilingModel.totalLayers} 层`,
        '总高度': `${coilingModel.totalHeight} mm`,
        '单层高度': `${coilingModel.steps[0]?.layerHeight || 0.5} mm`
      }
    },
    {
      id: 'gilding',
      name: '贴金',
      duration: '1-2 小时',
      tools: ['金箔', '贴金笔', '金胶', '软毛刷'],
      keyPoints: [
        '贴金前需确保漆层完全干燥',
        '金胶涂刷要薄而均匀，不可堆积',
        '贴金时动作要轻，避免金箔褶皱',
        '多余金箔需用软毛刷轻轻扫去'
      ]
    },
    {
      id: 'drying',
      name: '干燥检查',
      duration: '24-48 小时',
      tools: ['温湿度计', '干燥箱', '硬度计', '放大镜'],
      keyPoints: [
        '自然干燥需在阴凉通风处进行，避免阳光直射',
        '每6小时检查一次温湿度并记录',
        '干燥24小时后进行第一次硬度检测',
        '完全干燥后方可进行下一道工序'
      ],
      extraInfo: {
        '环境温度': '20-25℃',
        '环境湿度': '50%-60%',
        '检查节点': '6h / 12h / 24h / 36h / 48h'
      }
    }
  ]

  const handlePrint = () => {
    window.print()
  }

  const handleSaveAsRecord = () => {
    onSaveAsRecord()
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-opacity duration-300 ease-out',
        isContentVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={cn(
          'relative w-full max-w-4xl max-h-[90vh]',
          'bg-gradient-to-br from-ink-900 via-ink-900/95 to-ink-950',
          'border border-gold-600/40 rounded-lg',
          'shadow-2xl shadow-gold-500/10',
          'transition-all duration-300 ease-out transform',
          'flex flex-col',
          isContentVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 60px rgba(212, 168, 83, 0.1)'
        }}
      >
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold-500 rounded-tl-sm pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-500 rounded-tr-sm pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold-500 rounded-bl-sm pointer-events-none z-10" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold-500 rounded-br-sm pointer-events-none z-10" />

        <div className="flex items-center justify-between px-8 py-5 border-b border-gold-600/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full" />
            <h2 className="text-2xl font-serif font-bold text-gold-gradient tracking-wider">
              工 艺 单
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-ink-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 print:overflow-visible print:p-0">
          <Card title="基本信息" subtitle="作品基础资料">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-sm text-ink-400">作品名称</span>
                <p className="text-lg font-medium text-gold-300">{pattern.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-ink-400">纹样类型</span>
                <div className="flex items-center gap-2">
                  <Badge color="gold">{pattern.category}</Badge>
                  <span className="text-ink-300">复杂度</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-4 rounded-sm',
                          i < pattern.complexity ? 'bg-gold-500' : 'bg-ink-700'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-ink-400">创建日期</span>
                <p className="text-ink-200">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-ink-400">工艺师</span>
                <p className="text-ink-200">传统漆艺工坊</p>
              </div>
            </div>
          </Card>

          <Card title="材料配比" subtitle="漆料配方参数">
            <div className="space-y-5">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none" className="text-ink-700" />
                      <circle
                        cx="40" cy="40" r="35"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-lacquer-500"
                        strokeDasharray={`${mixture.lacquerRatio * 2.2} 220`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-lacquer-400">
                      {mixture.lacquerRatio}%
                    </span>
                  </div>
                  <span className="text-sm text-ink-400">漆料</span>
                </div>
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none" className="text-ink-700" />
                      <circle
                        cx="40" cy="40" r="35"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-gold-500"
                        strokeDasharray={`${mixture.powderRatio * 2.2} 220`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gold-400">
                      {mixture.powderRatio}%
                    </span>
                  </div>
                  <span className="text-sm text-ink-400">粉料</span>
                </div>
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none" className="text-ink-700" />
                      <circle
                        cx="40" cy="40" r="35"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-amber-600"
                        strokeDasharray={`${mixture.oilRatio * 2.2} 220`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-amber-500">
                      {mixture.oilRatio}%
                    </span>
                  </div>
                  <span className="text-sm text-ink-400">油类</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gold-600/20">
                <div className="text-center p-3 rounded-lg bg-ink-800/50">
                  <span className="text-sm text-ink-400">软硬指数</span>
                  <p className="text-xl font-bold text-gold-400 mt-1">{mixture.hardnessIndex}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-ink-800/50">
                  <span className="text-sm text-ink-400">推荐线径</span>
                  <p className="text-xl font-bold text-gold-400 mt-1">{mixture.recommendedDiameter} mm</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-ink-800/50">
                  <span className="text-sm text-ink-400">公差范围</span>
                  <p className="text-xl font-bold text-gold-400 mt-1">
                    ±{mixture.diameterTolerance} mm
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="工序清单" subtitle="制作工艺流程">
            <div className="space-y-4">
              {processSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="relative pl-8 pb-6 last:pb-0"
                >
                  {index < processSteps.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-px bg-gradient-to-b from-gold-500/60 to-gold-500/10" />
                  )}

                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-ink-900 font-bold text-sm shadow-lg shadow-gold-500/30">
                    {index + 1}
                  </div>

                  <div className="bg-ink-800/40 rounded-lg p-4 border border-gold-600/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-serif font-semibold text-gold-300">
                        {step.name}
                      </h4>
                      <Badge color="gold" pulsing>
                        {step.duration}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <span className="text-xs text-ink-500 uppercase tracking-wider">所需工具</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {step.tools.map((tool) => (
                          <span
                            key={tool}
                            className="px-2 py-1 text-xs rounded bg-ink-700/50 text-ink-300 border border-ink-600/50"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-ink-500 uppercase tracking-wider">操作要点</span>
                      <ul className="mt-2 space-y-1.5">
                        {step.keyPoints.map((point, i) => (
                          <li key={i} className="flex items-start text-sm text-ink-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 mr-2 shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {step.extraInfo && (
                      <div className="mt-3 pt-3 border-t border-gold-600/10">
                        <div className="grid grid-cols-3 gap-3">
                          {Object.entries(step.extraInfo).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <span className="text-xs text-ink-500">{key}</span>
                              <p className="text-sm font-medium text-gold-400 mt-0.5">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="风险提示" subtitle="注意事项与应对措施">
            <div className="space-y-3">
              {mixture.warnings && mixture.warnings.length > 0 ? (
                mixture.warnings.map((warning, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border',
                      warning.level === 'danger' && 'bg-lacquer-500/10 border-lacquer-500/40',
                      warning.level === 'warning' && 'bg-amber-500/10 border-amber-500/40',
                      warning.level === 'info' && 'bg-blue-500/10 border-blue-500/40'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                        warning.level === 'danger' && 'bg-lacquer-500',
                        warning.level === 'warning' && 'bg-amber-500',
                        warning.level === 'info' && 'bg-blue-500'
                      )}
                    >
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <Badge
                        color={warning.level === 'danger' ? 'red' : warning.level === 'warning' ? 'gold' : 'gray'}
                        className="mb-1"
                      >
                        {warning.type}
                      </Badge>
                      <p className="text-sm text-ink-300">{warning.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-400 font-medium">配比合理，无特殊风险提示</p>
                </div>
              )}

              <div className="pt-3 mt-3 border-t border-gold-600/20">
                <h5 className="text-sm font-medium text-gold-400 mb-2">通用应对措施</h5>
                <ul className="space-y-1.5 text-sm text-ink-300">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 mr-2 shrink-0" />
                    操作前请确保工作环境清洁，避免灰尘影响漆艺质量
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 mr-2 shrink-0" />
                    佩戴防护手套和口罩，避免直接接触漆料
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 mr-2 shrink-0" />
                    如出现皮肤过敏，请立即停止操作并就医
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-between px-8 py-5 border-t border-gold-600/20 shrink-0">
          <div className="text-sm text-ink-500">
            工艺单编号: {pattern.id}-{Date.now().toString(36).toUpperCase()}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handlePrint}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              打印工艺单
            </Button>
            <Button variant="primary" onClick={handleSaveAsRecord}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              保存为档案
            </Button>
            <Button variant="ghost" onClick={onClose}>
              关闭
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
