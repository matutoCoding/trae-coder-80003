import type { Point } from '../types';

/**
 * 生成圆形路径点
 * @param centerX - 圆心X坐标
 * @param centerY - 圆心Y坐标
 * @param radius - 圆的半径
 * @param segments - 分段数量，数值越大路径越平滑
 * @returns 圆形路径点数组
 */
export function generateCirclePath(
  centerX: number,
  centerY: number,
  radius: number,
  segments: number
): Point[] {
  const points: Point[] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }

  return points;
}

/**
 * 生成螺旋路径
 * @param centerX - 螺旋中心X坐标
 * @param centerY - 螺旋中心Y坐标
 * @param startRadius - 起始半径
 * @param endRadius - 结束半径
 * @param turns - 圈数
 * @param segments - 每圈分段数量
 * @returns 螺旋路径点数组
 */
export function generateSpiralPath(
  centerX: number,
  centerY: number,
  startRadius: number,
  endRadius: number,
  turns: number,
  segments: number
): Point[] {
  const points: Point[] = [];
  const totalSegments = turns * segments;
  const radiusStep = (endRadius - startRadius) / totalSegments;

  for (let i = 0; i <= totalSegments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const radius = startRadius + radiusStep * i;
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }

  return points;
}

/**
 * 生成波浪路径
 * @param startX - 起点X坐标
 * @param startY - 起点Y坐标
 * @param endX - 终点X坐标
 * @param amplitude - 波幅
 * @param frequency - 频率（完整波浪数）
 * @param segments - 分段数量
 * @returns 波浪路径点数组
 */
export function generateWavePath(
  startX: number,
  startY: number,
  endX: number,
  amplitude: number,
  frequency: number,
  segments: number
): Point[] {
  const points: Point[] = [];
  const dx = endX - startX;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = startX + dx * t;
    const y = startY + Math.sin(t * Math.PI * 2 * frequency) * amplitude;
    points.push({ x, y });
  }

  return points;
}

/**
 * 计算路径总长度
 * @param points - 路径点数组
 * @returns 路径总长度
 */
export function calculatePathLength(points: Point[]): number {
  if (points.length < 2) {
    return 0;
  }

  let totalLength = 0;

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  return totalLength;
}

/**
 * 计算盘绕密度
 * @param pathLength - 路径总长度
 * @param area - 区域面积
 * @returns 盘绕密度
 */
export function calculateDensity(pathLength: number, area: number): number {
  if (area <= 0) {
    return 0;
  }
  return pathLength / area;
}
