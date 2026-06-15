import type { Pattern, ThreadMixture, CoilingModel, Template, CraftRecord } from '../types';

const longfengPattern: Pattern = {
  id: 'pattern-longfeng',
  name: '龙凤呈祥',
  description: '传统龙凤纹样，象征吉祥如意，常用于婚庆与庆典器物',
  category: '瑞兽纹样',
  imageUrl: '/patterns/longfeng.svg',
  complexity: 5,
  layers: [
    {
      id: 'layer-1',
      name: '龙身主体',
      paths: ['M10,50 Q30,20 50,50 T90,50'],
      order: 1,
      color: '#D4A853'
    },
    {
      id: 'layer-2',
      name: '凤翼',
      paths: ['M60,30 Q80,10 100,30'],
      order: 2,
      color: '#E8C872'
    },
    {
      id: 'layer-3',
      name: '祥云底纹',
      paths: ['M0,80 Q25,70 50,80 T100,80'],
      order: 3,
      color: '#C9A961'
    }
  ],
  tags: ['经典', '婚庆', '高难度']
};

const chanzhiPattern: Pattern = {
  id: 'pattern-chanzhi',
  name: '缠枝莲花',
  description: '缠枝莲纹，连绵不绝，寓意纯洁与永恒',
  category: '花卉纹样',
  imageUrl: '/patterns/chanzhi.svg',
  complexity: 4,
  layers: [
    {
      id: 'layer-1',
      name: '主枝',
      paths: ['M10,10 Q30,30 20,50 T40,90'],
      order: 1,
      color: '#D4A853'
    },
    {
      id: 'layer-2',
      name: '莲花瓣',
      paths: ['M40,30 Q55,20 60,35 Q55,50 40,45'],
      order: 2,
      color: '#E8C872'
    },
    {
      id: 'layer-3',
      name: '次枝缠绕',
      paths: ['M30,40 Q45,50 35,70'],
      order: 3,
      color: '#C9A961'
    }
  ],
  tags: ['花卉', '吉祥', '中难度']
};

const yunwenPattern: Pattern = {
  id: 'pattern-yunwen',
  name: '云纹如意',
  description: '如意云纹，流畅婉转，象征如意吉祥',
  category: '云纹',
  imageUrl: '/patterns/yunwen.svg',
  complexity: 3,
  layers: [
    {
      id: 'layer-1',
      name: '主云纹',
      paths: ['M20,50 Q35,30 50,50 Q65,70 80,50'],
      order: 1,
      color: '#D4A853'
    },
    {
      id: 'layer-2',
      name: '如意头',
      paths: ['M50,50 Q45,35 55,30 Q65,35 60,50'],
      order: 2,
      color: '#E8C872'
    }
  ],
  tags: ['云纹', '如意', '基础']
};

const haishuiPattern: Pattern = {
  id: 'pattern-haishui',
  name: '海水江崖',
  description: '海水江崖纹，寓意江山永固，常用于官服与礼器',
  category: '山水纹样',
  imageUrl: '/patterns/haishui.svg',
  complexity: 5,
  layers: [
    {
      id: 'layer-1',
      name: '山崖',
      paths: ['M40,20 L50,5 L60,20 Z'],
      order: 1,
      color: '#D4A853'
    },
    {
      id: 'layer-2',
      name: '海水波纹',
      paths: ['M5,60 Q25,50 45,60 T85,60 T100,60'],
      order: 2,
      color: '#E8C872'
    },
    {
      id: 'layer-3',
      name: '立水纹',
      paths: ['M10,70 L15,90 M20,70 L25,90 M30,70 L35,90'],
      order: 3,
      color: '#C9A961'
    },
    {
      id: 'layer-4',
      name: '八宝装饰',
      paths: ['M50,75 Q55,70 60,75 Q55,80 50,75'],
      order: 4,
      color: '#F0D68A'
    }
  ],
  tags: ['山水', '礼器', '高难度']
};

const huiwenPattern: Pattern = {
  id: 'pattern-huiwen',
  name: '回纹万字',
  description: '回纹与万字纹组合，连绵不断，寓意万福万寿',
  category: '几何纹样',
  imageUrl: '/patterns/huiwen.svg',
  complexity: 3,
  layers: [
    {
      id: 'layer-1',
      name: '回纹边框',
      paths: ['M10,10 L90,10 L90,90 L10,90 Z'],
      order: 1,
      color: '#D4A853'
    },
    {
      id: 'layer-2',
      name: '万字纹',
      paths: ['M40,40 L60,40 L60,60 L40,60 Z'],
      order: 2,
      color: '#E8C872'
    }
  ],
  tags: ['几何', '边框', '基础']
};

function createMixture(lacquer: number, powder: number, oil: number): ThreadMixture {
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

  const warnings = [];
  let warning: string | null = null;

  if (hardnessIndex < 35) {
    warnings.push({
      type: 'soft',
      level: 'warning' as const,
      message: '配比偏软，漆线易变形，建议增加漆料或粉料比例'
    });
    warning = '配比偏软，漆线易变形';
  } else if (hardnessIndex > 65) {
    warnings.push({
      type: 'hard',
      level: 'warning' as const,
      message: '配比偏硬，漆线易断裂，建议增加油类比例'
    });
    warning = '配比偏硬，漆线易断裂';
  }

  if (recommendedDiameter < 0.4) {
    warnings.push({
      type: 'thin',
      level: 'danger' as const,
      message: '线径过细，工艺难度高，容易断裂'
    });
  } else if (recommendedDiameter > 1.2) {
    warnings.push({
      type: 'thick',
      level: 'info' as const,
      message: '线径较粗，适合大面积盘绕，精细图案可能不适用'
    });
  }

  if (lacquerRatio < 20) {
    warnings.push({
      type: 'dry',
      level: 'warning' as const,
      message: '漆料比例过低，附着力不足，干燥后易脱落'
    });
  }

  if (oilRatio > 40) {
    warnings.push({
      type: 'dry',
      level: 'danger' as const,
      message: '油类比例过高，干燥时间会显著延长'
    });
  }

  const suitableForCoiling = hardnessIndex >= 30 && hardnessIndex <= 75 && warnings.filter(w => w.level === 'danger').length === 0;

  return {
    lacquer,
    powder,
    oil,
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

const standardMixture: ThreadMixture = createMixture(60, 30, 10);
const softMixture: ThreadMixture = createMixture(50, 25, 25);
const hardMixture: ThreadMixture = createMixture(70, 25, 5);
const fineMixture: ThreadMixture = createMixture(65, 25, 10);
const thickMixture: ThreadMixture = createMixture(55, 35, 10);

const standardCoiling: CoilingModel = {
  id: 'coiling-standard',
  name: '标准盘绕',
  totalLayers: 3,
  totalHeight: 2.4,
  baseDensity: 8,
  steps: [
    { id: 'step-1', name: '底层铺线', description: '铺设基础层线料', duration: 30, density: 6, layerHeight: 0.8 },
    { id: 'step-2', name: '中层填充', description: '填充主体层次', duration: 45, density: 8, layerHeight: 0.8 },
    { id: 'step-3', name: '顶层塑形', description: '塑造表面纹理', duration: 60, density: 10, layerHeight: 0.8 }
  ],
  estimatedTime: 135,
  wireLength: 250
};

const delicateCoiling: CoilingModel = {
  id: 'coiling-delicate',
  name: '精细盘绕',
  totalLayers: 5,
  totalHeight: 2.0,
  baseDensity: 12,
  steps: [
    { id: 'step-1', name: '打底', description: '细线打底', duration: 20, density: 8, layerHeight: 0.4 },
    { id: 'step-2', name: '一层', description: '第一堆叠层', duration: 25, density: 10, layerHeight: 0.4 },
    { id: 'step-3', name: '二层', description: '第二堆叠层', duration: 30, density: 12, layerHeight: 0.4 },
    { id: 'step-4', name: '三层', description: '第三堆叠层', duration: 35, density: 14, layerHeight: 0.4 },
    { id: 'step-5', name: '收光', description: '表面收光处理', duration: 40, density: 16, layerHeight: 0.4 }
  ],
  estimatedTime: 150,
  wireLength: 400
};

const reliefCoiling: CoilingModel = {
  id: 'coiling-relief',
  name: '浮雕盘绕',
  totalLayers: 4,
  totalHeight: 4.0,
  baseDensity: 10,
  steps: [
    { id: 'step-1', name: '粗线打底', description: '粗线料铺设底层', duration: 25, density: 5, layerHeight: 1.2 },
    { id: 'step-2', name: '中层堆叠', description: '中层堆叠加固', duration: 40, density: 7, layerHeight: 1.0 },
    { id: 'step-3', name: '造型层', description: '塑造浮雕造型', duration: 55, density: 9, layerHeight: 1.0 },
    { id: 'step-4', name: '精修层', description: '表面精修贴金准备', duration: 50, density: 12, layerHeight: 0.8 }
  ],
  estimatedTime: 170,
  wireLength: 350
};

export const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: '龙凤呈祥',
    description: '经典龙凤呈祥纹样，适合大型器物装饰，工艺难度较高',
    category: '瑞兽纹样',
    pattern: longfengPattern,
    threadMixture: fineMixture,
    coilingModel: delicateCoiling,
    usageCount: 128,
    createdAt: '2025-03-15'
  },
  {
    id: 'template-2',
    name: '缠枝莲花',
    description: '缠枝莲纹，连绵不绝，适合瓶罐类器物装饰',
    category: '花卉纹样',
    pattern: chanzhiPattern,
    threadMixture: standardMixture,
    coilingModel: standardCoiling,
    usageCount: 95,
    createdAt: '2025-04-20'
  },
  {
    id: 'template-3',
    name: '云纹如意',
    description: '如意云纹，基础纹样，适合初学者练习',
    category: '云纹',
    pattern: yunwenPattern,
    threadMixture: softMixture,
    coilingModel: standardCoiling,
    usageCount: 156,
    createdAt: '2025-02-10'
  },
  {
    id: 'template-4',
    name: '海水江崖',
    description: '海水江崖纹，礼器专用纹样，工艺精湛',
    category: '山水纹样',
    pattern: haishuiPattern,
    threadMixture: hardMixture,
    coilingModel: reliefCoiling,
    usageCount: 67,
    createdAt: '2025-05-08'
  },
  {
    id: 'template-5',
    name: '回纹万字',
    description: '回纹万字边框，适合器物边缘装饰',
    category: '几何纹样',
    pattern: huiwenPattern,
    threadMixture: thickMixture,
    coilingModel: standardCoiling,
    usageCount: 203,
    createdAt: '2025-01-25'
  }
];

function generateRiskAlerts(mixture: ThreadMixture) {
  const alerts = [...mixture.warnings];

  if (mixture.oilRatio > 30) {
    alerts.push({
      type: 'drying-time',
      level: mixture.oilRatio > 40 ? 'danger' as const : 'warning' as const,
      message: mixture.oilRatio > 40 ? '干燥时间预计超过72小时，需延长固化周期' : '干燥时间较长，建议预留充足固化时间'
    });
  }

  if (mixture.hardnessIndex < 40) {
    alerts.push({
      type: 'shape-retention',
      level: 'warning' as const,
      message: '漆线硬度偏低，盘绕时需注意支撑，防止变形坍塌'
    });
  }

  return alerts;
}

function createInitialVersion(
  versionId: string,
  mixture: ThreadMixture,
  coilingModel: CoilingModel,
  notes: string,
  riskLevel: 'low' | 'medium' | 'high',
  riskAlerts: typeof mixture.warnings
) {
  return {
    id: versionId,
    version: 1,
    timestamp: '2025-06-10T08:00:00.000Z',
    description: '初始版本',
    mixture: { ...mixture },
    coilingModel: { ...coilingModel },
    riskLevel,
    riskAlerts: [...riskAlerts],
    notes,
    wireLength: coilingModel.wireLength,
    totalHeight: coilingModel.totalHeight,
    recommendedDiameter: mixture.recommendedDiameter,
    hardnessIndex: mixture.hardnessIndex,
    changeType: 'all' as const
  };
}

const record1Alerts = generateRiskAlerts(fineMixture);
const record2Alerts = generateRiskAlerts(standardMixture);
const record3Alerts = generateRiskAlerts(hardMixture);

export const mockCraftRecords: CraftRecord[] = [
  {
    id: 'record-1',
    name: '青花龙凤瓶',
    date: '2025-06-10',
    creationDate: '2025-06-10',
    patternId: 'pattern-longfeng',
    patternName: '龙凤呈祥',
    patternSnapshot: { ...longfengPattern, imagePreview: '' },
    mixture: fineMixture,
    coilingModel: delicateCoiling,
    notes: '龙凤主体采用金线盘绕，祥云用稍粗线料打底，整体效果良好',
    status: 'completed',
    riskLevel: 'low',
    riskAlerts: record1Alerts,
    versions: [
      createInitialVersion('v1-record1', fineMixture, delicateCoiling, '龙凤主体采用金线盘绕，祥云用稍粗线料打底，整体效果良好', 'low', record1Alerts)
    ],
    currentVersion: 1,
    sourceType: 'template',
    imagePreview: ''
  },
  {
    id: 'record-2',
    name: '缠枝莲纹盒',
    date: '2025-06-12',
    creationDate: '2025-06-12',
    patternId: 'pattern-chanzhi',
    patternName: '缠枝莲花',
    patternSnapshot: { ...chanzhiPattern, imagePreview: '' },
    mixture: standardMixture,
    coilingModel: standardCoiling,
    notes: '莲花瓣处需注意堆叠高度，避免线条坍塌',
    status: 'in-progress',
    riskLevel: 'medium',
    riskAlerts: record2Alerts,
    versions: [
      createInitialVersion('v1-record2', standardMixture, standardCoiling, '莲花瓣处需注意堆叠高度，避免线条坍塌', 'medium', record2Alerts)
    ],
    currentVersion: 1,
    sourceType: 'template',
    imagePreview: ''
  },
  {
    id: 'record-3',
    name: '海水江崖鼎',
    date: '2025-06-15',
    creationDate: '2025-06-15',
    patternId: 'pattern-haishui',
    patternName: '海水江崖',
    patternSnapshot: { ...haishuiPattern, imagePreview: '' },
    mixture: hardMixture,
    coilingModel: reliefCoiling,
    notes: '山崖部分浮雕效果明显，海水波纹需分层次处理，注意干燥时间',
    status: 'planned',
    riskLevel: 'high',
    riskAlerts: record3Alerts,
    versions: [
      createInitialVersion('v1-record3', hardMixture, reliefCoiling, '山崖部分浮雕效果明显，海水波纹需分层次处理，注意干燥时间', 'high', record3Alerts)
    ],
    currentVersion: 1,
    sourceType: 'template',
    imagePreview: ''
  }
];
