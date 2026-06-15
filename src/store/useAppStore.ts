import { create } from 'zustand';
import type { Pattern, ThreadMixture, CoilingModel, Template, CraftRecord, TabType, WarningItem } from '../types';
import { mockTemplates, mockCraftRecords } from '../data/mockData';

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
    lacquerRatio,
    powderRatio,
    oilRatio,
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
}

export const useAppStore = create<AppState>((set) => ({
  currentPattern: mockTemplates[0]?.pattern || null,
  currentMixture: {
    lacquer: 60,
    powder: 30,
    oil: 10,
    ...calculateMixtureParams(60, 30, 10)
  },
  currentCoilingModel: mockTemplates[0]?.coilingModel || null,
  templates: mockTemplates,
  craftRecords: mockCraftRecords,
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
    set((state) => ({
      craftRecords: [record, ...state.craftRecords]
    })),

  updateCraftRecord: (id, updates) =>
    set((state) => ({
      craftRecords: state.craftRecords.map((record) =>
        record.id === id ? { ...record, ...updates } : record
      )
    })),

  addTemplate: (template) =>
    set((state) => ({
      templates: [...state.templates, template]
    })),

  deleteTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((template) => template.id !== id)
    })),

  setActiveTab: (tab) => set({ activeTab: tab })
}));
