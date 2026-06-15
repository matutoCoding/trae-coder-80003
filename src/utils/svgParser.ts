import type { Point, Pattern, PatternLayer } from '../types';

interface PathCommand {
  type: string;
  params: number[];
}

function circleToPath(cx: number, cy: number, r: number): string {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
}

function ellipseToPath(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
}

function rectToPath(x: number, y: number, width: number, height: number, rx: number = 0, ry: number = 0): string {
  if (rx === 0 && ry === 0) {
    return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
  }
  rx = Math.min(rx, width / 2);
  ry = Math.min(ry, height / 2);
  return `M ${x + rx} ${y}
          L ${x + width - rx} ${y}
          A ${rx} ${ry} 0 0 1 ${x + width} ${y + ry}
          L ${x + width} ${y + height - ry}
          A ${rx} ${ry} 0 0 1 ${x + width - rx} ${y + height}
          L ${x + rx} ${y + height}
          A ${rx} ${ry} 0 0 1 ${x} ${y + height - ry}
          L ${x} ${y + ry}
          A ${rx} ${ry} 0 0 1 ${x + rx} ${y} Z`;
}

function polygonToPath(points: string): string {
  const pts = points.trim().split(/[\s,]+/).map(Number);
  if (pts.length < 4) return '';
  let d = `M ${pts[0]} ${pts[1]}`;
  for (let i = 2; i < pts.length; i += 2) {
    d += ` L ${pts[i]} ${pts[i + 1]}`;
  }
  d += ' Z';
  return d;
}

function polylineToPath(points: string): string {
  const pts = points.trim().split(/[\s,]+/).map(Number);
  if (pts.length < 4) return '';
  let d = `M ${pts[0]} ${pts[1]}`;
  for (let i = 2; i < pts.length; i += 2) {
    d += ` L ${pts[i]} ${pts[i + 1]}`;
  }
  return d;
}

function lineToPath(x1: number, y1: number, x2: number, y2: number): string {
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

function getElementTransform(element: SVGElement): { translateX: number; translateY: number; scaleX: number; scaleY: number } {
  const transform = element.getAttribute('transform');
  let translateX = 0, translateY = 0, scaleX = 1, scaleY = 1;
  
  if (transform) {
    const translateMatch = transform.match(/translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/);
    if (translateMatch) {
      translateX = parseFloat(translateMatch[1]);
      translateY = parseFloat(translateMatch[2]);
    }
    const scaleMatch = transform.match(/scale\(\s*([-\d.]+)[,\s]*([-\d.]*)\s*\)/);
    if (scaleMatch) {
      scaleX = parseFloat(scaleMatch[1]);
      scaleY = scaleMatch[2] ? parseFloat(scaleMatch[2]) : scaleX;
    }
  }
  
  return { translateX, translateY, scaleX, scaleY };
}

function applyTransformToPath(d: string, tx: number, ty: number, sx: number, sy: number): string {
  if (tx === 0 && ty === 0 && sx === 1 && sy === 1) return d;
  
  const points = pathsToPoints(d, 50);
  if (points.length === 0) return d;
  
  const transformed = points.map(p => ({
    x: p.x * sx + tx,
    y: p.y * sy + ty
  }));
  
  let newD = `M ${transformed[0].x} ${transformed[0].y}`;
  for (let i = 1; i < transformed.length; i++) {
    newD += ` L ${transformed[i].x} ${transformed[i].y}`;
  }
  
  return newD;
}

function extractPathsFromElement(element: SVGElement, parentTransform = { tx: 0, ty: 0, sx: 1, sy: 1 }): string[] {
  const paths: string[] = [];
  const transform = getElementTransform(element);
  const combinedTx = parentTransform.tx + transform.translateX * parentTransform.sx;
  const combinedTy = parentTransform.ty + transform.translateY * parentTransform.sy;
  const combinedSx = parentTransform.sx * transform.scaleX;
  const combinedSy = parentTransform.sy * transform.scaleY;
  
  const tagName = element.tagName.toLowerCase();
  
  let d = '';
  
  switch (tagName) {
    case 'path':
      d = element.getAttribute('d') || '';
      break;
    case 'circle': {
      const cx = parseFloat(element.getAttribute('cx') || '0');
      const cy = parseFloat(element.getAttribute('cy') || '0');
      const r = parseFloat(element.getAttribute('r') || '0');
      d = circleToPath(cx, cy, r);
      break;
    }
    case 'ellipse': {
      const cx = parseFloat(element.getAttribute('cx') || '0');
      const cy = parseFloat(element.getAttribute('cy') || '0');
      const rx = parseFloat(element.getAttribute('rx') || '0');
      const ry = parseFloat(element.getAttribute('ry') || '0');
      d = ellipseToPath(cx, cy, rx, ry);
      break;
    }
    case 'rect': {
      const x = parseFloat(element.getAttribute('x') || '0');
      const y = parseFloat(element.getAttribute('y') || '0');
      const width = parseFloat(element.getAttribute('width') || '0');
      const height = parseFloat(element.getAttribute('height') || '0');
      const rx = parseFloat(element.getAttribute('rx') || '0');
      const ry = parseFloat(element.getAttribute('ry') || '0');
      d = rectToPath(x, y, width, height, rx, ry);
      break;
    }
    case 'polygon': {
      const points = element.getAttribute('points') || '';
      d = polygonToPath(points);
      break;
    }
    case 'polyline': {
      const points = element.getAttribute('points') || '';
      d = polylineToPath(points);
      break;
    }
    case 'line': {
      const x1 = parseFloat(element.getAttribute('x1') || '0');
      const y1 = parseFloat(element.getAttribute('y1') || '0');
      const x2 = parseFloat(element.getAttribute('x2') || '0');
      const y2 = parseFloat(element.getAttribute('y2') || '0');
      d = lineToPath(x1, y1, x2, y2);
      break;
    }
    case 'g':
    case 'svg':
    case 'defs':
    case 'symbol': {
      const children = Array.from(element.children) as SVGElement[];
      for (const child of children) {
        paths.push(...extractPathsFromElement(child, { tx: combinedTx, ty: combinedTy, sx: combinedSx, sy: combinedSy }));
      }
      return paths;
    }
    default:
      return paths;
  }
  
  if (d) {
    const transformedD = applyTransformToPath(d, combinedTx, combinedTy, combinedSx, combinedSy);
    if (transformedD) {
      paths.push(transformedD);
    }
  }
  
  return paths;
}

export function parseSVGPaths(svgString: string): string[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = doc.documentElement;
    
    if (svgElement.tagName.toLowerCase() !== 'svg') {
      return [];
    }
    
    const paths = extractPathsFromElement(svgElement as unknown as SVGElement);
    return paths.filter(p => p && p.trim().length > 0);
  } catch (error) {
    console.error('Failed to parse SVG paths:', error);
    return [];
  }
}

/**
 * 解析 SVG 路径命令
 * @param d - SVG path d 属性
 * @returns 路径命令数组
 */
function parsePathCommands(d: string): PathCommand[] {
  const commands: PathCommand[] = [];
  const regex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let match;

  while ((match = regex.exec(d)) !== null) {
    const type = match[1];
    const paramsStr = match[2].trim();
    const params = paramsStr
      ? paramsStr.split(/[\s,]+/).map((n) => parseFloat(n))
      : [];
    commands.push({ type, params });
  }

  return commands;
}

/**
 * 估算 SVG 路径的长度（使用分段求和方法）
 * @param d - SVG path d 属性
 * @returns 像素长度
 */
export function calculatePathLength(d: string): number {
  try {
    const points = pathsToPoints(d, 100);
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
  } catch (error) {
    console.error('Failed to calculate path length:', error);
    return 0;
  }
}

/**
 * 计算贝塞尔曲线上的点（三阶贝塞尔）
 * @param t - 0到1之间的参数
 * @param p0 - 起点
 * @param p1 - 控制点1
 * @param p2 - 控制点2
 * @param p3 - 终点
 * @returns 曲线上的点
 */
function cubicBezier(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const nt = 1 - t;
  const nt2 = nt * nt;
  const nt3 = nt2 * nt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: nt3 * p0.x + 3 * nt2 * t * p1.x + 3 * nt * t2 * p2.x + t3 * p3.x,
    y: nt3 * p0.y + 3 * nt2 * t * p1.y + 3 * nt * t2 * p2.y + t3 * p3.y,
  };
}

/**
 * 计算贝塞尔曲线上的点（二阶贝塞尔）
 * @param t - 0到1之间的参数
 * @param p0 - 起点
 * @param p1 - 控制点
 * @param p2 - 终点
 * @returns 曲线上的点
 */
function quadraticBezier(t: number, p0: Point, p1: Point, p2: Point): Point {
  const nt = 1 - t;
  const nt2 = nt * nt;
  const t2 = t * t;

  return {
    x: nt2 * p0.x + 2 * nt * t * p1.x + t2 * p2.x,
    y: nt2 * p0.y + 2 * nt * t * p1.y + t2 * p2.y,
  };
}

/**
 * 将 SVG path d 属性转换为采样点数组
 * @param d - SVG path d 属性
 * @param sampleCount - 采样数量，默认 20
 * @returns 点数组
 */
export function pathsToPoints(d: string, sampleCount: number = 20): Point[] {
  try {
    const commands = parsePathCommands(d);
    if (commands.length === 0) {
      return [];
    }

    const points: Point[] = [];
    let currentPoint: Point = { x: 0, y: 0 };
    let startPoint: Point = { x: 0, y: 0 };
    let lastControlPoint: Point | null = null;

    for (const cmd of commands) {
      const { type, params } = cmd;
      const isRelative = type === type.toLowerCase();

      switch (type.toUpperCase()) {
        case 'M': {
          for (let i = 0; i < params.length; i += 2) {
            if (isRelative) {
              currentPoint = {
                x: currentPoint.x + params[i],
                y: currentPoint.y + params[i + 1],
              };
            } else {
              currentPoint = { x: params[i], y: params[i + 1] };
            }
            if (i === 0) {
              startPoint = { ...currentPoint };
            }
            points.push({ ...currentPoint });
          }
          lastControlPoint = null;
          break;
        }

        case 'L': {
          for (let i = 0; i < params.length; i += 2) {
            if (isRelative) {
              currentPoint = {
                x: currentPoint.x + params[i],
                y: currentPoint.y + params[i + 1],
              };
            } else {
              currentPoint = { x: params[i], y: params[i + 1] };
            }
            points.push({ ...currentPoint });
          }
          lastControlPoint = null;
          break;
        }

        case 'H': {
          for (let i = 0; i < params.length; i++) {
            if (isRelative) {
              currentPoint = { ...currentPoint, x: currentPoint.x + params[i] };
            } else {
              currentPoint = { ...currentPoint, x: params[i] };
            }
            points.push({ ...currentPoint });
          }
          lastControlPoint = null;
          break;
        }

        case 'V': {
          for (let i = 0; i < params.length; i++) {
            if (isRelative) {
              currentPoint = { ...currentPoint, y: currentPoint.y + params[i] };
            } else {
              currentPoint = { ...currentPoint, y: params[i] };
            }
            points.push({ ...currentPoint });
          }
          lastControlPoint = null;
          break;
        }

        case 'C': {
          for (let i = 0; i < params.length; i += 6) {
            const cp1 = isRelative
              ? { x: currentPoint.x + params[i], y: currentPoint.y + params[i + 1] }
              : { x: params[i], y: params[i + 1] };
            const cp2 = isRelative
              ? { x: currentPoint.x + params[i + 2], y: currentPoint.y + params[i + 3] }
              : { x: params[i + 2], y: params[i + 3] };
            const end = isRelative
              ? { x: currentPoint.x + params[i + 4], y: currentPoint.y + params[i + 5] }
              : { x: params[i + 4], y: params[i + 5] };

            for (let j = 1; j <= sampleCount; j++) {
              const t = j / sampleCount;
              const point = cubicBezier(t, currentPoint, cp1, cp2, end);
              points.push(point);
            }

            lastControlPoint = cp2;
            currentPoint = end;
          }
          break;
        }

        case 'S': {
          for (let i = 0; i < params.length; i += 4) {
            const cp1 = lastControlPoint
              ? {
                  x: currentPoint.x * 2 - lastControlPoint.x,
                  y: currentPoint.y * 2 - lastControlPoint.y,
                }
              : { ...currentPoint };
            const cp2 = isRelative
              ? { x: currentPoint.x + params[i], y: currentPoint.y + params[i + 1] }
              : { x: params[i], y: params[i + 1] };
            const end = isRelative
              ? { x: currentPoint.x + params[i + 2], y: currentPoint.y + params[i + 3] }
              : { x: params[i + 2], y: params[i + 3] };

            for (let j = 1; j <= sampleCount; j++) {
              const t = j / sampleCount;
              const point = cubicBezier(t, currentPoint, cp1, cp2, end);
              points.push(point);
            }

            lastControlPoint = cp2;
            currentPoint = end;
          }
          break;
        }

        case 'Q': {
          for (let i = 0; i < params.length; i += 4) {
            const cp = isRelative
              ? { x: currentPoint.x + params[i], y: currentPoint.y + params[i + 1] }
              : { x: params[i], y: params[i + 1] };
            const end = isRelative
              ? { x: currentPoint.x + params[i + 2], y: currentPoint.y + params[i + 3] }
              : { x: params[i + 2], y: params[i + 3] };

            for (let j = 1; j <= sampleCount; j++) {
              const t = j / sampleCount;
              const point = quadraticBezier(t, currentPoint, cp, end);
              points.push(point);
            }

            lastControlPoint = cp;
            currentPoint = end;
          }
          break;
        }

        case 'T': {
          for (let i = 0; i < params.length; i += 2) {
            const cp = lastControlPoint
              ? {
                  x: currentPoint.x * 2 - lastControlPoint.x,
                  y: currentPoint.y * 2 - lastControlPoint.y,
                }
              : { ...currentPoint };
            const end = isRelative
              ? { x: currentPoint.x + params[i], y: currentPoint.y + params[i + 1] }
              : { x: params[i], y: params[i + 1] };

            for (let j = 1; j <= sampleCount; j++) {
              const t = j / sampleCount;
              const point = quadraticBezier(t, currentPoint, cp, end);
              points.push(point);
            }

            lastControlPoint = cp;
            currentPoint = end;
          }
          break;
        }

        case 'A': {
          for (let i = 0; i < params.length; i += 7) {
            const rx = params[i];
            const ry = params[i + 1];
            const rotation = params[i + 2];
            const largeArc = params[i + 3];
            const sweep = params[i + 4];
            const end = isRelative
              ? { x: currentPoint.x + params[i + 5], y: currentPoint.y + params[i + 6] }
              : { x: params[i + 5], y: params[i + 6] };

            const arcPoints = approximateArc(currentPoint, end, rx, ry, rotation, largeArc, sweep, sampleCount);
            points.push(...arcPoints.slice(1));
            currentPoint = end;
            lastControlPoint = null;
          }
          break;
        }

        case 'Z': {
          currentPoint = { ...startPoint };
          points.push({ ...currentPoint });
          lastControlPoint = null;
          break;
        }

        default:
          break;
      }
    }

    return points;
  } catch (error) {
    console.error('Failed to convert path to points:', error);
    return [];
  }
}

/**
 * 近似椭圆弧为多点折线
 * @param start - 起点
 * @param end - 终点
 * @param rx - x轴半径
 * @param ry - y轴半径
 * @param rotation - 旋转角度
 * @param largeArc - 大弧标志
 * @param sweep - 扫描方向
 * @param sampleCount - 采样数量
 * @returns 点数组
 */
function approximateArc(
  start: Point,
  end: Point,
  rx: number,
  ry: number,
  rotation: number,
  largeArc: number,
  sweep: number,
  sampleCount: number
): Point[] {
  const points: Point[] = [];
  const rot = (rotation * Math.PI) / 180;

  const x1 = start.x;
  const y1 = start.y;
  const x2 = end.x;
  const y2 = end.y;

  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;

  const x1p = dx * Math.cos(rot) + dy * Math.sin(rot);
  const y1p = -dx * Math.sin(rot) + dy * Math.cos(rot);

  const rx2 = rx * rx;
  const ry2 = ry * ry;

  let radiiCheck = (x1p * x1p) / rx2 + (y1p * y1p) / ry2;
  if (radiiCheck > 1) {
    rx = Math.sqrt(radiiCheck) * rx;
    ry = Math.sqrt(radiiCheck) * ry;
  }

  const sign = largeArc === sweep ? -1 : 1;
  const sq =
    (rx2 * ry2 - rx2 * y1p * y1p - ry2 * x1p * x1p) /
    (rx2 * y1p * y1p + ry2 * x1p * x1p);
  const s = sign * Math.sqrt(Math.max(0, sq));

  const cxp = (s * rx * y1p) / ry;
  const cyp = (-s * ry * x1p) / rx;

  const cx = (x1 + x2) / 2 + cxp * Math.cos(rot) - cyp * Math.sin(rot);
  const cy = (y1 + y2) / 2 + cxp * Math.sin(rot) + cyp * Math.cos(rot);

  const angle1 = Math.atan2((y1p - cyp) / ry, (x1p - cxp) / rx);
  let angle2 = Math.atan2((y1p - cyp) / ry, (x1p - cxp) / rx) -
    Math.atan2(-y1p - cyp / ry, -x1p - cxp / rx);

  if (sweep === 0 && angle2 > 0) {
    angle2 -= 2 * Math.PI;
  } else if (sweep === 1 && angle2 < 0) {
    angle2 += 2 * Math.PI;
  }

  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    const angle = angle1 + angle2 * t;

    const x = rx * Math.cos(angle);
    const y = ry * Math.sin(angle);

    const xr = x * Math.cos(rot) - y * Math.sin(rot);
    const yr = x * Math.sin(rot) + y * Math.cos(rot);

    points.push({ x: xr + cx, y: yr + cy });
  }

  return points;
}

/**
 * 根据路径数量、总长度、复杂度估算复杂度（1-5）
 * @param paths - 路径 d 属性数组
 * @returns 1-5 的整数
 */
export function estimateComplexity(paths: string[]): number {
  try {
    if (paths.length === 0) {
      return 1;
    }

    const pathCount = paths.length;
    let totalLength = 0;
    let totalCommands = 0;

    for (const d of paths) {
      totalLength += calculatePathLength(d);
      const commands = parsePathCommands(d);
      totalCommands += commands.length;
    }

    const avgCommandsPerPath = totalCommands / pathCount;

    let complexityScore = 0;

    if (pathCount <= 2) complexityScore += 1;
    else if (pathCount <= 5) complexityScore += 2;
    else if (pathCount <= 10) complexityScore += 3;
    else if (pathCount <= 20) complexityScore += 4;
    else complexityScore += 5;

    if (totalLength <= 500) complexityScore += 1;
    else if (totalLength <= 2000) complexityScore += 2;
    else if (totalLength <= 5000) complexityScore += 3;
    else if (totalLength <= 10000) complexityScore += 4;
    else complexityScore += 5;

    if (avgCommandsPerPath <= 5) complexityScore += 1;
    else if (avgCommandsPerPath <= 15) complexityScore += 2;
    else if (avgCommandsPerPath <= 30) complexityScore += 3;
    else if (avgCommandsPerPath <= 50) complexityScore += 4;
    else complexityScore += 5;

    const avgComplexity = complexityScore / 3;

    return Math.max(1, Math.min(5, Math.round(avgComplexity)));
  } catch (error) {
    console.error('Failed to estimate complexity:', error);
    return 1;
  }
}

/**
 * 将 SVG 解析为 Pattern 对象
 * @param svgString - SVG 字符串
 * @param fileName - 文件名
 * @returns Pattern 对象
 */
export function generatePatternFromSVG(svgString: string, fileName: string): Pattern {
  try {
    const paths = parseSVGPaths(svgString);

    const pathData = paths.map((d) => ({
      d,
      length: calculatePathLength(d),
    }));

    pathData.sort((a, b) => b.length - a.length);

    const total = pathData.length;
    const layer1Count = Math.ceil(total * 0.4);
    const layer2Count = Math.ceil(total * 0.35);

    const layer1Paths = pathData.slice(0, layer1Count).map((p) => p.d);
    const layer2Paths = pathData.slice(layer1Count, layer1Count + layer2Count).map((p) => p.d);
    const layer3Paths = pathData.slice(layer1Count + layer2Count).map((p) => p.d);

    const layers: PatternLayer[] = [];

    if (layer1Paths.length > 0) {
      layers.push({
        id: 'layer-bottom',
        name: '底层',
        paths: layer1Paths,
        order: 1,
        color: '#8B2323',
      });
    }

    if (layer2Paths.length > 0) {
      layers.push({
        id: 'layer-middle',
        name: '中层',
        paths: layer2Paths,
        order: 2,
        color: '#D4A853',
      });
    }

    if (layer3Paths.length > 0) {
      layers.push({
        id: 'layer-top',
        name: '顶层',
        paths: layer3Paths,
        order: 3,
        color: '#E5B52E',
      });
    }

    const complexity = estimateComplexity(paths);
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const totalPathLength = paths.reduce((sum, d) => sum + calculatePathLength(d), 0);

    const tags = ['自定义'];
    if (complexity >= 4) tags.push('复杂');
    if (complexity <= 2) tags.push('简单');
    if (paths.length >= 10) tags.push('多路径');
    if (paths.length <= 3) tags.push('少路径');

    const description = `从 ${fileName} 导入的纹样，共 ${paths.length} 条路径，复杂度 ${complexity} 级。`;

    return {
      id: `pattern-${Date.now()}`,
      name: baseName,
      description,
      category: '自定义纹样',
      imageUrl: '',
      complexity,
      layers,
      tags,
      svgContent: svgString,
      totalPathLength,
      pathCount: paths.length,
    };
  } catch (error) {
    console.error('Failed to generate pattern from SVG:', error);
    return {
      id: `pattern-${Date.now()}`,
      name: fileName.replace(/\.[^/.]+$/, ''),
      description: '导入失败的纹样',
      category: '自定义纹样',
      imageUrl: '',
      complexity: 1,
      layers: [],
      tags: ['导入失败'],
      svgContent: svgString,
      totalPathLength: 0,
      pathCount: 0,
    };
  }
}
