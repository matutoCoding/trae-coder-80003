import { create } from 'zustand';
import type { Pattern, ThreadMixture, CoilingModel, Template, CraftRecord, TabType, WarningItem, PatternLayer } from '../types';
import { mockTemplates, mockCraftRecords } from '../data/mockData';

const TEMPLATES_KEY = 'lacquer-templates';
const RECORDS_KEY = 'lacquer-records';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error('Failed to save to localStorage');
  }
}

function calculateMixtureParams(lacquer: number, powder: number, oil: number): Omit<ThreadMixture, 'lacquer' | 'powder' | 'oil'> {
  const total = lacquer + powder + oil;
  const lacquerRatio = (lacquer / total) * 100;
  const powderRatio = (powder / total) * 100;
  const oilRatio = (oil / total) * 100;

  const hardnessIndex = lacquerRatio * 0.6 + powderRatio * 0.3 - oilRatio * 0.5;

  const minDiameter = 0.3;
  const maxDiameter = 1.5;
  const minHardness = 0;
  const maxHardness = 100;
  const clampedIndex = Math.max(minHardness, Math.min(maxHardness, hardnessIndex));
  const normalizedIndex = (clampedIndex - minHardness) / (maxHardness - minHardness);
  const recommendedDiameter = minDiameter + normalizedIndex * (maxDiameter - minDiameter);

  const toleranceMin = recommendedDiameter * 0.85;
  const toleranceMax = recommendedDiameter * 1.15;
  const diameterTolerance = recommendedDiameter * 0.15;

  const warnings: WarningItem[] = [];
  let warning: string | null = null;

  if (hardnessIndex < 35) {
    warnings.push({
      type: 'soft',
      level: 'warning',
      message: '配比偏软，漆线易变形，建议增加漆料或粉料比例'
    });
    warning = '配比偏软，漆线易变形';
  } else if (hardnessIndex > 65) {
    warnings.push({
      type: 'hard',
      level: 'warning',
      message: '配比偏硬，漆线易断裂，建议增加油类比例'
    });
    warning = '配比偏硬，漆线易断裂';
  }

  if (recommendedDiameter < 0.4) {
    warnings.push({
      type: 'thin',
      level: 'danger',
      message: '线径过细，工艺难度高，容易断裂'
    });
  } else if (recommendedDiameter > 1.2) {
    warnings.push({
      type: 'thick',
      level: 'info',
      message: '线径较粗，适合大面积盘绕，精细图案可能不适用'
    });
  }

  if (lacquerRatio < 20) {
    warnings.push({
      type: 'dry',
      level: 'warning',
      message: '漆料比例过低，附着力不足，干燥后易脱落'
    });
  }

  if (oilRatio > 40) {
    warnings.push({
      type: 'dry',
      level: 'danger',
      message: '油类比例过高，干燥时间会显著延长'
    });
  }

  const suitableForCoiling = hardnessIndex >= 30 && hardnessIndex <= 75 && warnings.filter(w => w.level === 'danger').length === 0;

  return {
    lacquerRatio: Math.round(lacquerRatio * 10) / 10,
    powderRatio: Math.round(powderRatio * 10) / 10,
    oilRatio: Math.round(oilRatio * 10) / 10,
    hardnessIndex: Math.round(hardnessIndex * 100) / 100,
    recommendedDiameter: Math.round(recommendedDiameter * 100) / 100,
    diameterTolerance: Math.round(diameterTolerance * 100) / 100,
    tolerance: {
      min: Math.round(toleranceMin * 100) / 100,
      max: Math.round(toleranceMax * 100) / 100
    },
    suitableForCoiling,
    warning,
    warnings
  };
}

function calculateRiskLevel(warnings: WarningItem[]): 'low' | 'medium' | 'high' {
  const dangerCount = warnings.filter(w => w.level === 'danger').length;
  const warningCount = warnings.filter(w => w.level === 'warning').length;

  if (dangerCount > 0) return 'high';
  if (warningCount >= 2) return 'high';
  if (warningCount === 1) return 'medium';
  return 'low';
}

function generateRiskAlerts(mixture: ThreadMixture): WarningItem[] {
  const alerts: WarningItem[] = [...mixture.warnings];

  if (mixture.oilRatio > 30) {
    alerts.push({
      type: 'drying-time',
      level: mixture.oilRatio > 40 ? 'danger' : 'warning',
      message: mixture.oilRatio > 40 ? '干燥时间预计超过72小时，需延长固化周期' : '干燥时间较长，建议预留充足固化时间'
    });
  }

  if (mixture.hardnessIndex < 40) {
    alerts.push({
      type: 'shape-retention',
      level: 'warning',
      message: '漆线硬度偏低，盘绕时需注意支撑，防止变形坍塌'
    });
  }

  return alerts;
}

function parsePathsFromSVG(svgContent: string): string[] {
  const paths: string[] = [];
  const pathRegex = /<path[^>]*d="([^"]*)"[^>]*>/gi;
  let match;

  while ((match = pathRegex.exec(svgContent)) !== null) {
    if (match[1] && match[1].trim().length > 0) {
      paths.push(match[1].trim());
    }
  }

  return paths;
}

function calculatePathLength(d: string): number {
  let length = 0;
  const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g) || [];

  for (const cmd of commands) {
    const type = cmd[0].toUpperCase();
    const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));

    if (type === 'M' || type === 'L') {
      for (let i = 2; i < nums.length; i += 2) {
        const dx = nums[i] - nums[i - 2];
        const dy = nums[i + 1] - nums[i - 1];
        length += Math.sqrt(dx * dx + dy * dy);
      }
    } else if (type === 'Q') {
      for (let i = 4; i < nums.length; i += 4) {
        const dx = nums[i] - nums[i - 4];
        const dy = nums[i + 1] - nums[i - 3];
        length += Math.sqrt(dx * dx + dy * dy);
      }
    } else if (type === 'Z') {
    }
  }

  return length || d.length;
}

function createLayersFromPaths(paths: string[]): PatternLayer[] {
  if (paths.length === 0) return [];

  const pathsWithLength = paths.map((d, index) => ({
    d,
    index,
    length: calculatePathLength(d)
  }));

  const sorted = [...pathsWithLength].sort((a, b) => b.length - a.length);

  const layerCount = Math.min(3, sorted.length);
  const perLayer = Math.ceil(sorted.length / layerCount);

  const colors = ['#D4A853', '#E8C872', '#C9A961'];
  const layerNames = ['主线层', '次线层', '细节层'];

  const layers: PatternLayer[] = [];

  for (let i = 0; i < layerCount; i++) {
    const start = i * perLayer;
    const end = Math.min(start + perLayer, sorted.length);
    const layerPaths = sorted.slice(start, end).map(p => p.d);

    layers.push({
      id: `layer-${i + 1}`,
      name: layerNames[i] || `第${i + 1}层`,
      paths: layerPaths,
      order: i + 1,
      color: colors[i] || '#D4A853'
    });
  }

  return layers;
}

interface AppState {
  currentPattern: Pattern | null;
  currentMixture: ThreadMixture;
  currentCoilingModel: CoilingModel | null;
  templates: Template[];
  craftRecords: CraftRecord[];
  activeTab: TabType;

  setCurrentPattern: (pattern: Pattern) => void;
  updateMixtureRatio: (lacquer: number, powder: number, oil: number) => void;
  setCurrentCoilingModel: (model: CoilingModel) => void;
  addCraftRecord: (record: CraftRecord) => void;
  updateCraftRecord: (id: string, updates: Partial<CraftRecord>) => void;
  addTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  setActiveTab: (tab: TabType) => void;

  applyTemplate: (templateId: string) => void;
  saveAsTemplate: (name: string, description: string) => void;
  createCraftRecord: (title: string, notes: string) => string;
  updateCraftNotes: (id: string, notes: string) => void;
  parsePatternFromSVG: (svgContent: string, fileName: string) => Pattern;
}

const initialTemplates = loadFromStorage<Template[]>(TEMPLATES_KEY, mockTemplates);
const initialRecords = loadFromStorage<CraftRecord[]>(RECORDS_KEY, mockCraftRecords);

export const useAppStore = create<AppState>((set, get) => ({
  currentPattern: initialTemplates[0]?.pattern || null,
  currentMixture: {
    lacquer: 60,
    powder: 30,
    oil: 10,
    ...calculateMixtureParams(60, 30, 10)
  },
  currentCoilingModel: initialTemplates[0]?.coilingModel || null,
  templates: initialTemplates,
  craftRecords: initialRecords,
  activeTab: 'pattern',

  setCurrentPattern: (pattern) => set({ currentPattern: pattern }),

  updateMixtureRatio: (lacquer, powder, oil) =>
    set({
      currentMixture: {
        lacquer,
        powder,
        oil,
        ...calculateMixtureParams(lacquer, powder, oil)
      }
    }),

  setCurrentCoilingModel: (model) => set({ currentCoilingModel: model }),

  addCraftRecord: (record) =>
    set((state) => {
      const newRecords = [record, ...state.craftRecords];
      saveToStorage(RECORDS_KEY, newRecords);
      return { craftRecords: newRecords };
    }),

  updateCraftRecord: (id, updates) =>
    set((state) => {
      const newRecords = state.craftRecords.map((record) =>
        record.id === id ? { ...record, ...updates } : record
      );
      saveToStorage(RECORDS_KEY, newRecords);
      return { craftRecords: newRecords };
    }),

  addTemplate: (template) =>
    set((state) => {
      const newTemplates = [...state.templates, template];
      saveToStorage(TEMPLATES_KEY, newTemplates);
      return { templates: newTemplates };
    }),

  deleteTemplate: (id) =>
    set((state) => {
      const newTemplates = state.templates.filter((template) => template.id !== id);
      saveToStorage(TEMPLATES_KEY, newTemplates);
      return { templates: newTemplates };
    }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  applyTemplate: (templateId) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return;

    const { threadMixture } = template;
    const lacquer = Math.round(threadMixture.lacquerRatio);
    const powder = Math.round(threadMixture.powderRatio);
    let oil = 100 - lacquer - powder;
    if (oil < 0) {
      oil = 0;
      const adjust = 100 - lacquer - oil;
      const newPowder = Math.max(0, powder + adjust);
      const newLacquer = 100 - newPowder - oil;
      set((state) => ({
        currentPattern: template.pattern,
        currentMixture: {
          lacquer: newLacquer,
          powder: newPowder,
          oil,
          ...calculateMixtureParams(newLacquer, newPowder, oil)
        },
        currentCoilingModel: template.coilingModel,
        templates: state.templates.map((t) =>
          t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
        )
      }));
    } else {
      set((state) => ({
        currentPattern: template.pattern,
        currentMixture: {
          lacquer,
          powder,
          oil,
          ...calculateMixtureParams(lacquer, powder, oil)
        },
        currentCoilingModel: template.coilingModel,
        templates: state.templates.map((t) =>
          t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
        )
      }));
    }

    saveToStorage(TEMPLATES_KEY, get().templates);
  },

  saveAsTemplate: (name, description) => {
    const { currentPattern, currentMixture, currentCoilingModel } = get();
    if (!currentPattern || !currentCoilingModel) return;

    const timestamp = Date.now();
    const newTemplate: Template = {
      id: `custom-${timestamp}`,
      name,
      description,
      category: '自定义',
      pattern: currentPattern,
      threadMixture: currentMixture,
      coilingModel: currentCoilingModel,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isCustom: true
    };

    set((state) => {
      const newTemplates = [...state.templates, newTemplate];
      saveToStorage(TEMPLATES_KEY, newTemplates);
      return { templates: newTemplates };
    });
  },

  createCraftRecord: (title, notes) => {
    const { currentPattern, currentMixture, currentCoilingModel } = get();
    if (!currentPattern || !currentCoilingModel) {
      throw new Error('Pattern and CoilingModel are required');
    }

    const timestamp = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const riskAlerts = generateRiskAlerts(currentMixture);
    const riskLevel = calculateRiskLevel(riskAlerts);

    const newRecord: CraftRecord = {
      id: `record-${timestamp}`,
      name: title,
      date: today,
      creationDate: today,
      patternId: currentPattern.id,
      patternName: currentPattern.name,
      mixture: { ...currentMixture },
      coilingModel: { ...currentCoilingModel },
      notes,
      status: 'in-progress',
      riskLevel,
      riskAlerts
    };

    set((state) => {
      const newRecords = [newRecord, ...state.craftRecords];
      saveToStorage(RECORDS_KEY, newRecords);
      return { craftRecords: newRecords };
    });

    return newRecord.id;
  },

  updateCraftNotes: (id, notes) => {
    set((state) => {
      const newRecords = state.craftRecords.map((record) =>
        record.id === id ? { ...record, notes } : record
      );
      saveToStorage(RECORDS_KEY, newRecords);
      return { craftRecords: newRecords };
    });
  },

  parsePatternFromSVG: (svgContent, fileName) => {
    const paths = parsePathsFromSVG(svgContent);
    const layers = createLayersFromPaths(paths);

    const complexity = Math.min(5, Math.ceil(paths.length / 3));

    const pattern: Pattern = {
      id: `pattern-${Date.now()}`,
      name: fileName.replace(/\.svg$/i, ''),
      description: `从 ${fileName} 导入的纹样`,
      category: '自定义',
      imageUrl: '',
      complexity,
      layers,
      tags: ['导入', 'SVG']
    };

    set({ currentPattern: pattern });
    return pattern;
  }
}));
