import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Sparkles, Layers, Coins, CircleDot, ArrowRight, FileText, Save, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import Badge from '@/components/UI/Badge'
import Button from '@/components/UI/Button'

interface WorkspaceSummaryProps {
  onOpenProcessOrder?: () => void
  onSaveAsRecord?: () => void
  onSaveAsTemplate?: () => void
  className?: string
}

export default function WorkspaceSummary({
  onOpenProcessOrder,
  onSaveAsRecord,
  onSaveAsTemplate,
  className
}: WorkspaceSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const {
    currentPattern,
    currentMixture,
    currentCoilingModel,
    workspaceSource,
    hasUnsavedChanges
  } = useAppStore()

  const isSynced = useMemo(() => {
    const { patternSourceId, mixtureSourceId, coilingSourceId, id } = workspaceSource
    if (workspaceSource.type === 'template' && id) {
      return patternSourceId !== undefined &&
        mixtureSourceId !== undefined &&
        coilingSourceId !== undefined
    }
    if (workspaceSource.type === 'record' && id) {
      return patternSourceId !== undefined &&
        mixtureSourceId !== undefined &&
        coilingSourceId !== undefined
    }
    return false
  }, [workspaceSource])

  const getSourceLabel = () => {
    switch (workspaceSource.type) {
      case 'template':
        return `模板：${workspaceSource.name}`
      case 'record':
        return `档案：${workspaceSource.name}`
      case 'upload':
        return `上传：${workspaceSource.name}`
      case 'custom':
      default:
        return '自定义方案'
    }
  }

  const complexityStars = currentPattern?.complexity || 0

  const patternLayers = currentPattern?.layers?.length || 0
  const totalLayers = currentCoilingModel?.totalLayers || 0
  const totalHeight = currentCoilingModel?.totalHeight || 0
  const estimatedTime = currentCoilingModel?.estimatedTime || 0

  return (
    <div className={cn(
      'relative rounded-lg overflow-hidden',
      'bg-gradient-to-br from-lacquer-800/20 via-ink-900/90 to-ink-950',
      'border border-gold-600/40',
      'shadow-lg',
      'transition-all duration-300 ease-out',
      className
    )}>
      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gold-500 rounded-tl-sm pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-gold-500 rounded-tr-sm pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-gold-500 rounded-bl-sm pointer-events-none z-10" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-gold-500 rounded-br-sm pointer-events-none z-10" />

      <div className="flex items-center justify-between px-6 py-4 border-b border-gold-600/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-400" />
            <h2 className="text-lg font-serif font-bold text-gold-gradient">
              工作区摘要
            </h2>
          </div>
          <Badge color="gray" className="text-xs">
            {getSourceLabel()}
          </Badge>
          {isSynced && (
            <Badge color="green" dot pulsing>
              方案已同步
            </Badge>
          )}
          {hasUnsavedChanges && (
            <Badge color="gold" pulsing>
              有未保存变更
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="secondary"
              className="text-xs py-1.5 px-3"
              onClick={onOpenProcessOrder}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              生成工艺单
            </Button>
            <Button
              variant="secondary"
              className="text-xs py-1.5 px-3"
              onClick={onSaveAsRecord}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              保存为档案
            </Button>
            <Button
              variant="primary"
              className="text-xs py-1.5 px-3"
              onClick={onSaveAsTemplate}
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              另存为模板
            </Button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md text-ink-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className={cn(
        'overflow-hidden transition-all duration-300 ease-out',
        isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch">
            <div className={cn(
              'relative p-5 rounded-lg',
              'bg-gradient-to-br from-ink-800/60 to-ink-900/80',
              'border border-gold-600/30',
              'hover:border-gold-500/50 transition-colors'
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-lacquer-600/30 to-lacquer-700/30 border border-lacquer-500/40 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-lacquer-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gold-300">纹样解析</h3>
                  <p className="text-xs text-ink-500">Pattern Analysis</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-400">纹样名称</span>
                  <span className="text-sm font-medium text-ink-200 truncate ml-2 max-w-[120px]">
                    {currentPattern?.name || '未命名'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-400">复杂度</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-1.5 h-3 rounded-sm',
                          i < complexityStars ? 'bg-gold-500' : 'bg-ink-700'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-400">路径层数</span>
                  <span className="text-sm font-mono text-gold-400">
                    {patternLayers} 层
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <div className="relative">
                <ArrowRight className="w-8 h-8 text-gold-600/50" />
              </div>
            </div>

            <div className={cn(
              'relative p-5 rounded-lg',
              'bg-gradient-to-br from-ink-800/60 to-ink-900/80',
              'border border-gold-600/30',
              'hover:border-gold-500/50 transition-colors'
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-600/30 to-gold-700/30 border border-gold-500/40 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gold-300">线料搓制</h3>
                  <p className="text-xs text-ink-500">Thread Making</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-400">漆/粉/油比例</span>
                  <span className="text-sm font-mono text-ink-200">
                    {currentMixture.lacquerRatio.toFixed(0)}/{currentMixture.powderRatio.toFixed(0)}/{currentMixture.oilRatio.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-400">软硬指数</span>
                  <span className="text-sm font-mono text-gold-400">
                    {currentMixture.hardnessIndex.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-400">推荐线径</span>
                  <span className="text-sm font-mono text-lacquer-400">
                    {currentMixture.recommendedDiameter.toFixed(2)} mm
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <div className="relative">
                <ArrowRight className="w-8 h-8 text-gold-600/50" />
              </div>
            </div>

            <div className={cn(
              'relative p-5 rounded-lg',
              'bg-gradient-to-br from-ink-800/60 to-ink-900/80',
              'border border-gold-600/30',
              'hover:border-gold-500/50 transition-colors'
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600/30 to-emerald-700/30 border border-emerald-500/40 flex items-center justify-center">
                  <CircleDot className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gold-300">盘绕造型</h3>
                  <p className="text-xs text-ink-500">Coiling Model</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-400">总层数</span>
                  <span className="text-sm font-mono text-gold-400">
                    {totalLayers} 层
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-400">总高度</span>
                  <span className="text-sm font-mono text-lacquer-400">
                    {totalHeight.toFixed(2)} mm
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-400">预计工时</span>
                  <span className="text-sm font-mono text-ink-200">
                    {estimatedTime.toFixed(1)} 小时
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:hidden mt-4 flex justify-center">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-600/40" />
              <ArrowRight className="w-5 h-5 text-gold-600/50 rotate-90" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-600/40" />
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-gold-600/20 p-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            className="text-xs py-2"
            onClick={onOpenProcessOrder}
          >
            <FileText className="w-3.5 h-3.5 mr-1" />
            工艺单
          </Button>
          <Button
            variant="secondary"
            className="text-xs py-2"
            onClick={onSaveAsRecord}
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            存档案
          </Button>
          <Button
            variant="primary"
            className="text-xs py-2"
            onClick={onSaveAsTemplate}
          >
            <Copy className="w-3.5 h-3.5 mr-1" />
            存模板
          </Button>
        </div>
      </div>
    </div>
  )
}
