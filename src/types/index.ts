export interface Point {
  x: number;
  y: number;
}

export interface PathData {
  id: string;
  points: Point[];
  color?: string;
}

export interface CoilingLayer {
  id: string;
  name: string;
  paths: PathData[];
  density: number;
  height: number;
  order: number;
}

export interface WarningItem {
  type: string;
  level: 'info' | 'warning' | 'danger';
  message: string;
}

export interface DiameterTolerance {
  min: number;
  max: number;
}

export interface PatternLayer {
  id: string;
  name: string;
  paths: string[];
  order: number;
  color: string;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  complexity: number;
  layers: PatternLayer[];
  tags: string[];
}

export interface ThreadMixture {
  id?: string;
  name?: string;
  lacquer: number;
  powder: number;
  oil: number;
  lacquerRatio: number;
  powderRatio: number;
  oilRatio: number;
  hardnessIndex: number;
  recommendedDiameter: number;
  diameterTolerance: number;
  tolerance: DiameterTolerance;
  suitableForCoiling: boolean;
  warning: string | null;
  warnings: WarningItem[];
}

export interface CoilingStep {
  id: string;
  name: string;
  description: string;
  duration: number;
  density: number;
  layerHeight: number;
}

export interface CoilingModel {
  id: string;
  name: string;
  totalLayers: number;
  totalHeight: number;
  baseDensity: number;
  steps: CoilingStep[];
  estimatedTime: number;
  wireLength: number;
}

export interface CraftRecord {
  id: string;
  name: string;
  date: string;
  creationDate?: string;
  patternId: string;
  patternName: string;
  mixture: ThreadMixture;
  coilingModel: CoilingModel;
  notes: string;
  status: 'completed' | 'in-progress' | 'planned' | 'failed';
  riskLevel: 'low' | 'medium' | 'high';
  riskAlerts?: WarningItem[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  pattern: Pattern;
  threadMixture: ThreadMixture;
  coilingModel: CoilingModel;
  usageCount: number;
  createdAt: string;
  isCustom?: boolean;
}

export type TabType = 'pattern' | 'mixture' | 'coiling' | 'records' | 'templates';
