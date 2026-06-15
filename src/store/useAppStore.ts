import { create } from 'zustand';
import type { Pattern, ThreadMixture, CoilingModel, Template, CraftRecord, TabType, WarningItem, RecordVersion } from '../types';
import { mockTemplates, mockCraftRecords } from '../data/mockData';
import { generatePatternFromSVG } from '../utils/svgParser';

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

type WorkspaceSourceType = 'template' | 'custom' | 'upload' | 'record';

interface WorkspaceSource {
  type: WorkspaceSourceType;
  name: string;
  id?: string;
  patternSourceId?: string;
  mixtureSourceId?: string;
  coilingSourceId?: string;
}

interface AppState {
  currentPattern: Pattern | null;
  currentMixture: ThreadMixture;
  currentCoilingModel: CoilingModel | null;
  templates: Template[];
  craftRecords: CraftRecord[];
  activeTab: TabType;
  workspaceSource: WorkspaceSource;
  hasUnsavedChanges: boolean;

  setCurrentPattern: (pattern: Pattern) => void;
  updateMixtureRatio: (lacquer: number, powder: number, oil: number) => void;
  setCurrentCoilingModel: (model: CoilingModel) => void;
  addCraftRecord: (record: CraftRecord) => void;
  updateCraftRecord: (id: string, updates: Partial<CraftRecord>) => void;
  addTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  setActiveTab: (tab: TabType) => void;
  setHasUnsavedChanges: (value: boolean) => void;

  applyTemplate: (templateId: string) => void;
  saveAsTemplate: (name: string, description: string) => void;
  createCraftRecord: (title: string, notes: string) => string;
  updateCraftNotes: (id: string, notes: string) => void;
  parsePatternFromSVG: (svgContent: string, fileName: string) => Pattern;
  saveRecordVersion: (recordId: string, description: string, changeType: 'mixture' | 'coiling' | 'notes' | 'all') => void;
  loadRecordToWorkspace: (recordId: string) => void;
}

const initialTemplates = loadFromStorage<Template[]>(TEMPLATES_KEY, mockTemplates);
const initialRecords = loadFromStorage<CraftRecord[]>(RECORDS_KEY, mockCraftRecords);

const defaultTemplate = initialTemplates[0];

export const useAppStore = create<AppState>((set, get) => ({
  currentPattern: defaultTemplate?.pattern || null,
  currentMixture: {
    lacquer: 60,
    powder: 30,
    oil: 10,
    ...calculateMixtureParams(60, 30, 10)
  },
  currentCoilingModel: defaultTemplate?.coilingModel || null,
  templates: initialTemplates,
  craftRecords: initialRecords,
  activeTab: 'pattern',
  workspaceSource: defaultTemplate
    ? {
        type: 'template',
        name: defaultTemplate.name,
        id: defaultTemplate.id,
        patternSourceId: defaultTemplate.pattern.id,
        mixtureSourceId: defaultTemplate.id,
        coilingSourceId: defaultTemplate.coilingModel.id
      }
    : {
        type: 'custom',
        name: '自定义方案'
      },
  hasUnsavedChanges: false,

  setCurrentPattern: (pattern) =>
    set((state) => ({
      currentPattern: pattern,
      hasUnsavedChanges: true,
      workspaceSource: {
        ...state.workspaceSource,
        patternSourceId: undefined
      }
    })),

  updateMixtureRatio: (lacquer, powder, oil) =>
    set((state) => ({
      currentMixture: {
        lacquer,
        powder,
        oil,
        ...calculateMixtureParams(lacquer, powder, oil)
      },
      hasUnsavedChanges: true,
      workspaceSource: {
        ...state.workspaceSource,
        mixtureSourceId: undefined
      }
    })),

  setCurrentCoilingModel: (model) =>
    set((state) => ({
      currentCoilingModel: model,
      hasUnsavedChanges: true,
      workspaceSource: {
        ...state.workspaceSource,
        coilingSourceId: undefined
      }
    })),

  setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),

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

    const commonSource = {
      type: 'template' as const,
      name: template.name,
      id: template.id,
      patternSourceId: template.pattern.id,
      mixtureSourceId: template.id,
      coilingSourceId: template.coilingModel.id
    };

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
        ),
        workspaceSource: commonSource,
        hasUnsavedChanges: false
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
        ),
        workspaceSource: commonSource,
        hasUnsavedChanges: false
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
      return {
        templates: newTemplates,
        hasUnsavedChanges: false,
        workspaceSource: {
          type: 'template',
          name,
          id: newTemplate.id,
          patternSourceId: currentPattern.id,
          mixtureSourceId: newTemplate.id,
          coilingSourceId: currentCoilingModel.id
        }
      };
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

    let sourceType: 'upload' | 'template' | 'custom' = 'custom';
    const category = currentPattern.category;
    if (category.includes('导入') || category.includes('上传')) {
      sourceType = 'upload';
    } else if (category.includes('模板') || category.includes('传统') || category.includes('经典')) {
      sourceType = 'template';
    }

    const patternSnapshot: Pattern = {
      ...currentPattern,
      imagePreview: currentPattern.imagePreview || ''
    };

    const initialVersion: RecordVersion = {
      id: `v1-${timestamp}`,
      version: 1,
      timestamp: new Date().toISOString(),
      description: '初始版本',
      mixture: { ...currentMixture },
      coilingModel: { ...currentCoilingModel },
      riskLevel,
      riskAlerts: [...riskAlerts],
      notes,
      wireLength: currentCoilingModel.wireLength,
      totalHeight: currentCoilingModel.totalHeight,
      recommendedDiameter: currentMixture.recommendedDiameter,
      hardnessIndex: currentMixture.hardnessIndex,
      changeType: 'all'
    };

    const newRecord: CraftRecord = {
      id: `record-${timestamp}`,
      name: title,
      date: today,
      creationDate: today,
      patternId: currentPattern.id,
      patternName: currentPattern.name,
      patternSnapshot,
      mixture: { ...currentMixture },
      coilingModel: { ...currentCoilingModel },
      notes,
      status: 'in-progress',
      riskLevel,
      riskAlerts,
      versions: [initialVersion],
      currentVersion: 1,
      sourceType,
      svgContent: currentPattern.svgContent,
      imagePreview: currentPattern.imagePreview || ''
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
    const pattern = generatePatternFromSVG(svgContent, fileName);
    pattern.imagePreview = '';

    set((state) => ({
      currentPattern: pattern,
      hasUnsavedChanges: true,
      workspaceSource: {
        type: 'upload',
        name: fileName,
        patternSourceId: pattern.id
      }
    }));
    return pattern;
  },

  saveRecordVersion: (recordId, description, changeType) => {
    const { currentMixture, currentCoilingModel, craftRecords } = get();
    if (!currentCoilingModel) return;

    const record = craftRecords.find((r) => r.id === recordId);
    if (!record) return;

    const riskAlerts = generateRiskAlerts(currentMixture);
    const riskLevel = calculateRiskLevel(riskAlerts);
    const newVersionNum = record.currentVersion + 1;
    const timestamp = Date.now();

    const newVersion: RecordVersion = {
      id: `v${newVersionNum}-${timestamp}`,
      version: newVersionNum,
      timestamp: new Date().toISOString(),
      description,
      mixture: { ...currentMixture },
      coilingModel: { ...currentCoilingModel },
      riskLevel,
      riskAlerts: [...riskAlerts],
      notes: record.notes,
      wireLength: currentCoilingModel.wireLength,
      totalHeight: currentCoilingModel.totalHeight,
      recommendedDiameter: currentMixture.recommendedDiameter,
      hardnessIndex: currentMixture.hardnessIndex,
      changeType
    };

    set((state) => {
      const newRecords = state.craftRecords.map((r) => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          mixture: { ...currentMixture },
          coilingModel: { ...currentCoilingModel },
          riskLevel,
          riskAlerts,
          versions: [...r.versions, newVersion],
          currentVersion: newVersionNum
        };
      });
      saveToStorage(RECORDS_KEY, newRecords);
      return { craftRecords: newRecords };
    });
  },

  loadRecordToWorkspace: (recordId) => {
    const { craftRecords } = get();
    const record = craftRecords.find((r) => r.id === recordId);
    if (!record) return;

    set({
      currentPattern: record.patternSnapshot,
      currentMixture: { ...record.mixture },
      currentCoilingModel: { ...record.coilingModel },
      hasUnsavedChanges: false,
      workspaceSource: {
        type: 'record',
        name: record.name,
        id: record.id,
        patternSourceId: record.patternSnapshot.id,
        mixtureSourceId: record.mixture.id || record.id,
        coilingSourceId: record.coilingModel.id
      }
    });
  }
}));
