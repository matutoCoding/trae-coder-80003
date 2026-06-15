import type { PathData, CoilingLayer } from '../types';
import { calculatePathLength } from './pathGenerator';

/**
 * 计算区域盘绕密度
 * @param paths - 路径数据数组
 * @param area - 区域面积
 * @returns 平均盘绕密度
 */
export function calculateCoilingDensity(paths: PathData[], area: number): number {
  if (paths.length === 0 || area <= 0) {
    return 0;
  }

  let totalLength = 0;

  for (const path of paths) {
    totalLength += calculatePathLength(path.points);
  }

  return totalLength / area;
}

/**
 * 计算堆叠高度
 * @param diameter - 线径
 * @param layers - 层数
 * @param stackFactor - 堆叠系数，默认值为 0.9
 * @returns 堆叠高度
 */
export function calculateStackHeight(
  diameter: number,
  layers: number,
  stackFactor: number = 0.9
): number {
  return diameter * layers * stackFactor;
}

/**
 * 计算总用线长度
 * @param layers - 盘绕层数组
 * @returns 总用线长度
 */
export function calculateTotalThreadLength(layers: CoilingLayer[]): number {
  if (layers.length === 0) {
    return 0;
  }

  let totalLength = 0;

  for (const layer of layers) {
    for (const path of layer.paths) {
      totalLength += calculatePathLength(path.points);
    }
  }

  return totalLength;
}

/**
 * 估算材料用量
 * @param totalLength - 总用线长度
 * @param diameter - 线径
 * @returns 材料用量（体积）
 */
export function estimateMaterialUsage(totalLength: number, diameter: number): number {
  const radius = diameter / 2;
  const crossSectionArea = Math.PI * radius * radius;
  return crossSectionArea * totalLength;
}
