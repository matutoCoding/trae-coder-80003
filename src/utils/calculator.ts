import type { ThreadMixture, WarningItem } from '../types';

/**
 * 计算软硬指数
 * @param lacquerRatio - 漆料比例
 * @param powderRatio - 粉料比例
 * @param oilRatio - 油类比例
 * @returns 软硬指数值
 */
export function calculateHardnessIndex(
  lacquerRatio: number,
  powderRatio: number,
  oilRatio: number
): number {
  return lacquerRatio * 0.6 + powderRatio * 0.3 - oilRatio * 0.5;
}

/**
 * 根据软硬指数计算推荐线径
 * @param hardnessIndex - 软硬指数
 * @returns 推荐线径（毫米）
 */
export function calculateRecommendedDiameter(hardnessIndex: number): number {
  const minDiameter = 0.3;
  const maxDiameter = 1.5;
  const minHardness = 0;
  const maxHardness = 100;

  const clampedIndex = Math.max(minHardness, Math.min(maxHardness, hardnessIndex));
  const normalizedIndex = (clampedIndex - minHardness) / (maxHardness - minHardness);

  return minDiameter + normalizedIndex * (maxDiameter - minDiameter);
}

/**
 * 生成警告列表
 * @param lacquerRatio - 漆料比例
 * @param powderRatio - 粉料比例
 * @param oilRatio - 油类比例
 * @param hardnessIndex - 软硬指数
 * @param diameter - 线径
 * @returns 警告项数组
 */
export function generateWarnings(
  lacquerRatio: number,
  powderRatio: number,
  oilRatio: number,
  hardnessIndex: number,
  diameter: number
): WarningItem[] {
  const warnings: WarningItem[] = [];

  if (hardnessIndex < 35) {
    warnings.push({
      type: 'soft',
      level: 'warning',
      message: '配比偏软，漆线易变形，建议增加漆料或粉料比例',
    });
  } else if (hardnessIndex > 65) {
    warnings.push({
      type: 'hard',
      level: 'warning',
      message: '配比偏硬，漆线易断裂，建议增加油类比例',
    });
  }

  if (diameter < 0.4) {
    warnings.push({
      type: 'thin',
      level: 'danger',
      message: '线径过细，工艺难度高，容易断裂',
    });
  } else if (diameter > 1.2) {
    warnings.push({
      type: 'thick',
      level: 'info',
      message: '线径较粗，适合大面积盘绕，精细图案可能不适用',
    });
  }

  if (lacquerRatio < 20) {
    warnings.push({
      type: 'dry',
      level: 'warning',
      message: '漆料比例过低，附着力不足，干燥后易脱落',
    });
  }

  if (oilRatio > 40) {
    warnings.push({
      type: 'dry',
      level: 'danger',
      message: '油类比例过高，干燥时间会显著延长',
    });
  }

  return warnings;
}

/**
 * 计算干燥时间
 * @param diameter - 线径
 * @param layers - 层数
 * @param temperature - 环境温度（摄氏度）
 * @param humidity - 环境湿度（百分比）
 * @returns 干燥时间（小时）
 */
export function calculateDryTime(
  diameter: number,
  layers: number,
  temperature: number,
  humidity: number
): number {
  const baseTime = 2;
  const diameterFactor = diameter / 0.5;
  const layerFactor = 1 + (layers - 1) * 0.3;
  const tempFactor = temperature > 25 ? 0.8 : temperature < 15 ? 1.5 : 1;
  const humidityFactor = humidity > 70 ? 1.4 : humidity < 40 ? 0.9 : 1;

  return baseTime * diameterFactor * layerFactor * tempFactor * humidityFactor;
}

/**
 * 评估混合料配比，返回完整的 ThreadMixture 评估结果
 * @param lacquerRatio - 漆料比例
 * @param powderRatio - 粉料比例
 * @param oilRatio - 油类比例
 * @returns 完整的 ThreadMixture 评估结果
 */
export function evaluateMixture(
  lacquerRatio: number,
  powderRatio: number,
  oilRatio: number
): Omit<ThreadMixture, 'id' | 'name'> {
  const hardnessIndex = calculateHardnessIndex(lacquerRatio, powderRatio, oilRatio);
  const recommendedDiameter = calculateRecommendedDiameter(hardnessIndex);
  const warnings = generateWarnings(
    lacquerRatio,
    powderRatio,
    oilRatio,
    hardnessIndex,
    recommendedDiameter
  );

  const toleranceMin = recommendedDiameter * 0.85;
  const toleranceMax = recommendedDiameter * 1.15;
  const diameterTolerance = recommendedDiameter * 0.15;
  const suitableForCoiling = hardnessIndex >= 30 && hardnessIndex <= 75 && warnings.filter(w => w.level === 'danger').length === 0;
  const warning = warnings.length > 0 ? warnings[0].message : null;

  return {
    lacquer: Math.round(lacquerRatio * 10) / 10,
    powder: Math.round(powderRatio * 10) / 10,
    oil: Math.round(oilRatio * 10) / 10,
    lacquerRatio: Math.round(lacquerRatio * 10) / 10,
    powderRatio: Math.round(powderRatio * 10) / 10,
    oilRatio: Math.round(oilRatio * 10) / 10,
    hardnessIndex: Math.round(hardnessIndex * 100) / 100,
    recommendedDiameter: Math.round(recommendedDiameter * 100) / 100,
    diameterTolerance: Math.round(diameterTolerance * 100) / 100,
    tolerance: {
      min: Math.round(toleranceMin * 100) / 100,
      max: Math.round(toleranceMax * 100) / 100,
    },
    suitableForCoiling,
    warning,
    warnings,
  };
}
