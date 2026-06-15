import { useMemo } from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import RangeSlider from '@/components/UI/RangeSlider';
import Gauge from '@/components/UI/Gauge';
import Badge from '@/components/UI/Badge';
import { useAppStore } from '@/store/useAppStore';
import { calculateDryTime } from '@/utils/calculator';
import type { WarningItem } from '@/types';

const presets = [
  { name: '精细盘绕型', lacquer: 70, powder: 20, oil: 10 },
  { name: '标准型', lacquer: 60, powder: 30, oil: 10 },
  { name: '堆叠造型型', lacquer: 50, powder: 40, oil: 10 },
];

function getDifficultyLevel(hardnessIndex: number): { level: string; color: 'green' | 'gold' | 'red' } {
  if (hardnessIndex >= 40 && hardnessIndex <= 60) {
    return { level: '简单', color: 'green' };
  }
  if (hardnessIndex >= 30 && hardnessIndex <= 70) {
    return { level: '中等', color: 'gold' };
  }
  return { level: '困难', color: 'red' };
}

function getWarningIcon(type: string): string {
  const icons: Record<string, string> = {
    soft: '🟡',
    hard: '🟡',
    thin: '🔴',
    thick: 'ℹ️',
    dry: '🟡',
  };
  return icons[type] || '⚠️';
}

function getWarningTitle(type: string, level: string): string {
  const titles: Record<string, string> = {
    soft: '配比偏软',
    hard: '配比偏硬',
    thin: '线径过细',
    thick: '线径较粗',
    dry: '干燥问题',
  };
  return titles[type] || (level === 'danger' ? '危险警告' : '注意事项');
}

function getAdjustmentSuggestion(warning: WarningItem): string {
  const suggestions: Record<string, string> = {
    soft: '建议：增加漆料比例 5-10%，或减少油类比例',
    hard: '建议：增加油类比例 3-5%，或减少漆料比例',
    thin: '建议：增加粉料比例，提高线径至 0.5mm 以上',
    thick: '建议：适当减少粉料比例，或更换为精细盘绕型配方',
    dry: '建议：增加漆料比例至 25% 以上，确保附着力',
  };
  return suggestions[warning.type] || '建议：调整配比参数至合理范围';
}

export default function ThreadMaking() {
  const { currentMixture, updateMixtureRatio } = useAppStore();

  const totalRatio = useMemo(() => {
    return currentMixture.lacquer + currentMixture.powder + currentMixture.oil;
  }, [currentMixture]);

  const isTotalValid = totalRatio === 100;

  const difficulty = useMemo(() => {
    return getDifficultyLevel(currentMixture.hardnessIndex);
  }, [currentMixture.hardnessIndex]);

  const estimatedTime = useMemo(() => {
    return calculateDryTime(currentMixture.recommendedDiameter, 1, 22, 60);
  }, [currentMixture.recommendedDiameter]);

  const suggestedTemp = 20 + (currentMixture.hardnessIndex > 50 ? 5 : 0);
  const suggestedHumidity = 55 + (currentMixture.hardnessIndex > 50 ? 10 : -5);

  const handlePresetClick = (preset: typeof presets[0]) => {
    updateMixtureRatio(preset.lacquer, preset.powder, preset.oil);
  };

  const handleLacquerChange = (value: number) => {
    const remaining = 100 - value;
    const powderRatio = currentMixture.powder / (currentMixture.powder + currentMixture.oil);
    const newPowder = Math.round(remaining * powderRatio);
    const newOil = remaining - newPowder;
    updateMixtureRatio(value, newPowder, newOil);
  };

  const handlePowderChange = (value: number) => {
    const remaining = 100 - value;
    const lacquerRatio = currentMixture.lacquer / (currentMixture.lacquer + currentMixture.oil);
    const newLacquer = Math.round(remaining * lacquerRatio);
    const newOil = remaining - newLacquer;
    updateMixtureRatio(newLacquer, value, newOil);
  };

  const handleOilChange = (value: number) => {
    const remaining = 100 - value;
    const lacquerRatio = currentMixture.lacquer / (currentMixture.lacquer + currentMixture.powder);
    const newLacquer = Math.round(remaining * lacquerRatio);
    const newPowder = remaining - newLacquer;
    updateMixtureRatio(newLacquer, newPowder, value);
  };

  const handleSaveRecipe = () => {
    console.log('保存配方:', currentMixture);
  };

  return (
    <div className="min-h-screen bg-ink-gradient p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-serif font-bold text-gold-gradient mb-2">
            线料搓制
          </h1>
          <p className="text-ink-400 text-lg">
            精准配比计算，确保漆线软硬适中
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="配比调节" subtitle="调整漆料、粉料、油类比例" className="lg:col-span-1">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎨</span>
                  <span className="text-gold-300 font-medium">漆料比例</span>
                </div>
                <RangeSlider
                  value={currentMixture.lacquer}
                  onChange={handleLacquerChange}
                  min={10}
                  max={80}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">✨</span>
                  <span className="text-gold-300 font-medium">粉料比例</span>
                </div>
                <RangeSlider
                  value={currentMixture.powder}
                  onChange={handlePowderChange}
                  min={10}
                  max={70}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🛢️</span>
                  <span className="text-gold-300 font-medium">油类比例</span>
                </div>
                <RangeSlider
                  value={currentMixture.oil}
                  onChange={handleOilChange}
                  min={5}
                  max={50}
                />
              </div>

              <div className="pt-4 border-t border-gold-600/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-ink-400">总比例</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-lg ${isTotalValid ? 'text-green-400' : 'text-lacquer-400'}`}>
                      {totalRatio}%
                    </span>
                    {isTotalValid ? (
                      <Badge color="green" dot>正常</Badge>
                    ) : (
                      <Badge color="red" pulsing>异常</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-ink-800/50 rounded-lg border border-gold-600/20">
                <div className="flex justify-between items-center">
                  <span className="text-ink-300">软硬指数</span>
                  <span className={`text-2xl font-serif font-bold ${
                    currentMixture.hardnessIndex >= 35 && currentMixture.hardnessIndex <= 65
                      ? 'text-green-400'
                      : 'text-lacquer-400'
                  }`}>
                    {currentMixture.hardnessIndex.toFixed(1)}
                  </span>
                </div>
                <div className="mt-2 h-2 bg-ink-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(Math.max(currentMixture.hardnessIndex, 0), 100)}%`,
                      background: currentMixture.hardnessIndex >= 35 && currentMixture.hardnessIndex <= 65
                        ? 'linear-gradient(90deg, #4CAF50, #8BC34A)'
                        : 'linear-gradient(90deg, #C93838, #D95252)',
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-ink-400">预设配比</p>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="secondary"
                      className="text-xs py-2 px-2"
                      onClick={() => handlePresetClick(preset)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title="评估仪表盘" subtitle="实时计算搓制参数" className="lg:col-span-1">
            <div className="space-y-6">
              <div className="flex justify-center">
                <Gauge
                  value={currentMixture.hardnessIndex}
                  min={0}
                  max={100}
                  label="软硬指数"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-ink-500">
                <div className="text-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-lacquer-500 mr-1" />
                  过软
                </div>
                <div className="text-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1" />
                  合理
                </div>
                <div className="text-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-lacquer-500 mr-1" />
                  过硬
                </div>
              </div>

              <div className="p-4 bg-ink-800/50 rounded-lg border border-gold-600/20 text-center">
                <p className="text-ink-400 text-sm mb-1">推荐线径</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-serif font-bold text-gold-gradient">
                    {currentMixture.recommendedDiameter.toFixed(2)}
                  </span>
                  <span className="text-ink-400">mm</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-ink-800/30 rounded-lg text-center">
                  <p className="text-xs text-ink-500 mb-1">最小线径</p>
                  <p className="text-lg font-mono text-gold-300">
                    {currentMixture.tolerance.min.toFixed(2)}
                    <span className="text-xs text-ink-500 ml-1">mm</span>
                  </p>
                </div>
                <div className="p-3 bg-ink-800/30 rounded-lg text-center">
                  <p className="text-xs text-ink-500 mb-1">最大线径</p>
                  <p className="text-lg font-mono text-gold-300">
                    {currentMixture.tolerance.max.toFixed(2)}
                    <span className="text-xs text-ink-500 ml-1">mm</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-ink-800/30 rounded-lg">
                <span className="text-ink-300">搓制难度</span>
                <Badge color={difficulty.color}>{difficulty.level}</Badge>
              </div>

              <div className={`p-4 rounded-lg border ${
                currentMixture.suitableForCoiling
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-lacquer-500/10 border-lacquer-500/30'
              }`}>
                <div className="flex items-center gap-3">
                  {currentMixture.suitableForCoiling ? (
                    <Badge color="green" pulsing dot>适合搓制</Badge>
                  ) : (
                    <Badge color="red" pulsing dot>需要调整</Badge>
                  )}
                  <span className={`text-sm ${
                    currentMixture.suitableForCoiling ? 'text-green-400' : 'text-lacquer-400'
                  }`}>
                    {currentMixture.suitableForCoiling
                      ? '当前配比适合搓制漆线'
                      : currentMixture.warning || '请调整配比参数'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card title="偏差预警" subtitle="实时监测配比偏差">
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {currentMixture.warnings.length === 0 ? (
                  <div className="text-center py-8 text-ink-500">
                    <span className="text-3xl mb-2 block">✅</span>
                    <p>配比正常，无警告</p>
                  </div>
                ) : (
                  currentMixture.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        warning.level === 'danger'
                          ? 'bg-lacquer-500/15 border-lacquer-500/40 danger-pulse'
                          : warning.level === 'warning'
                          ? 'bg-gold-500/10 border-gold-500/30'
                          : 'bg-ink-700/30 border-ink-600/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getWarningIcon(warning.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium text-sm ${
                              warning.level === 'danger'
                                ? 'text-lacquer-300'
                                : warning.level === 'warning'
                                ? 'text-gold-300'
                                : 'text-ink-300'
                            }`}>
                              {getWarningTitle(warning.type, warning.level)}
                            </span>
                            <Badge
                              color={warning.level === 'danger' ? 'red' : warning.level === 'warning' ? 'gold' : 'gray'}
                              pulsing={warning.level === 'danger'}
                            >
                              {warning.level === 'danger' ? '危险' : warning.level === 'warning' ? '警告' : '提示'}
                            </Badge>
                          </div>
                          <p className="text-xs text-ink-400 mb-2">{warning.message}</p>
                          <p className={`text-xs ${
                            warning.level === 'danger' ? 'text-lacquer-400' : 'text-gold-400'
                          }`}>
                            {getAdjustmentSuggestion(warning)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card title="搓制参数" subtitle="建议工艺参数">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gold-600/10">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⏱️</span>
                    <span className="text-ink-300">预计搓制时间</span>
                  </div>
                  <span className="text-gold-300 font-mono">
                    {estimatedTime.toFixed(1)} 小时
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gold-600/10">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌡️</span>
                    <span className="text-ink-300">建议搓制温度</span>
                  </div>
                  <span className="text-gold-300 font-mono">
                    {suggestedTemp} - {suggestedTemp + 5}°C
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gold-600/10">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💧</span>
                    <span className="text-ink-300">建议环境湿度</span>
                  </div>
                  <span className="text-gold-300 font-mono">
                    {suggestedHumidity} - {suggestedHumidity + 10}%
                  </span>
                </div>

                <Button
                  variant="primary"
                  className="w-full mt-2"
                  onClick={handleSaveRecipe}
                >
                  保存配方
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
