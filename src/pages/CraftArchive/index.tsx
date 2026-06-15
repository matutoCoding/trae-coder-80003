import { useState, useMemo, useEffect } from 'react';
import { Search, SortAsc, Calendar, Layers, FileText, AlertTriangle, Droplets, Zap, Shield, ChevronDown, Plus, Check, X, Edit2, GitBranch, Save, Download, ArrowUpDown, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import { useAppStore } from '@/store/useAppStore';
import type { CraftRecord, RecordVersion } from '@/types';

type StatusFilter = 'all' | 'planned' | 'in-progress' | 'completed' | 'failed';
type SortType = 'date' | 'name';
type RecordStatus = 'planned' | 'in-progress' | 'completed' | 'failed';

const statusMap: Record<RecordStatus, { label: string; color: 'gold' | 'green' | 'gray' | 'red' }> = {
  'planned': { label: '计划中', color: 'gray' },
  'in-progress': { label: '进行中', color: 'gold' },
  'completed': { label: '已完成', color: 'green' },
  'failed': { label: '失败', color: 'red' },
};

const riskLevelMap: Record<string, { label: string; color: 'green' | 'gold' | 'red' }> = {
  'low': { label: '低风险', color: 'green' },
  'medium': { label: '中风险', color: 'gold' },
  'high': { label: '高风险', color: 'red' },
};

const riskTypeMap: Record<string, { label: string; icon: typeof Droplets }> = {
  'dry': { label: '失水变脆', icon: Droplets },
  'hard': { label: '盘绕断裂', icon: Zap },
  'soft': { label: '坍塌变形', icon: Shield },
  'thin': { label: '线径过细', icon: Layers },
  'thick': { label: '线径过粗', icon: Layers },
  'drying-time': { label: '干燥时间', icon: Calendar },
  'shape-retention': { label: '形状保持', icon: Shield },
};

const changeTypeMap: Record<string, { label: string; color: 'gold' | 'green' | 'gray' | 'red' }> = {
  'mixture': { label: '配比调整', color: 'gold' },
  'coiling': { label: '盘绕调整', color: 'green' },
  'notes': { label: '笔记更新', color: 'gray' },
  'all': { label: '全部更新', color: 'red' },
};

export default function CraftArchive() {
  const {
    craftRecords,
    templates,
    createCraftRecord,
    updateCraftRecord,
    updateCraftNotes,
    saveRecordVersion,
    loadRecordToWorkspace,
  } = useAppStore();

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(craftRecords[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortType, setSortType] = useState<SortType>('date');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [statusChangeDropdownOpen, setStatusChangeDropdownOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRecordName, setNewRecordName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionDescription, setVersionDescription] = useState('');
  const [versionChangeType, setVersionChangeType] = useState<'mixture' | 'coiling' | 'notes' | 'all'>('all');
  const [versionSaveSuccess, setVersionSaveSuccess] = useState(false);
  const [loadSuccess, setLoadSuccess] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareVersion1, setCompareVersion1] = useState<string | null>(null);
  const [compareVersion2, setCompareVersion2] = useState<string | null>(null);

  const selectedRecord = useMemo(() => {
    return craftRecords.find(r => r.id === selectedRecordId) || null;
  }, [craftRecords, selectedRecordId]);

  useEffect(() => {
    if (selectedRecord) {
      setNotes(selectedRecord.notes);
    }
  }, [selectedRecord?.id]);

  const filteredRecords = useMemo(() => {
    let result = [...craftRecords];

    if (searchQuery) {
      result = result.filter(record =>
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.patternName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(record => record.status === statusFilter);
    }

    result.sort((a, b) => {
      if (sortType === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [craftRecords, searchQuery, statusFilter, sortType]);

  const selectedPattern = useMemo(() => {
    if (!selectedRecord) return null;
    if (selectedRecord.patternSnapshot) {
      return selectedRecord.patternSnapshot;
    }
    return templates.find(t => t.pattern.id === selectedRecord.patternId)?.pattern || null;
  }, [selectedRecord, templates]);

  const sortedVersions = useMemo(() => {
    if (!selectedRecord?.versions) return [];
    return [...selectedRecord.versions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [selectedRecord?.versions]);

  const totalPathCount = useMemo(() => {
    if (!selectedPattern?.layers) return 0;
    return selectedPattern.layers.reduce((sum, layer) => sum + layer.paths.length, 0);
  }, [selectedPattern]);

  const displayRiskAlerts = useMemo(() => {
    if (!selectedRecord) return [];
    return selectedRecord.riskAlerts || selectedRecord.mixture.warnings || [];
  }, [selectedRecord]);

  const handleSelectRecord = (record: CraftRecord) => {
    setSelectedRecordId(record.id);
    setNotes(record.notes);
  };

  const handleCreateRecord = () => {
    if (!newRecordName.trim()) return;
    
    try {
      const newId = createCraftRecord(newRecordName.trim(), '');
      setSelectedRecordId(newId);
      setNewRecordName('');
      setShowCreateModal(false);
      setCreateSuccess(true);
      setTimeout(() => setCreateSuccess(false), 2000);
    } catch (error) {
      console.error('创建档案失败:', error);
    }
  };

  const handleSaveNotes = () => {
    if (!selectedRecord) return;
    updateCraftNotes(selectedRecord.id, notes);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleStatusChange = (newStatus: RecordStatus) => {
    if (!selectedRecord) return;
    updateCraftRecord(selectedRecord.id, { status: newStatus });
    setStatusChangeDropdownOpen(false);
  };

  const getPatternFromRecord = (record: CraftRecord) => {
    if (record.patternSnapshot) {
      return record.patternSnapshot;
    }
    return templates.find(t => t.pattern.id === record.patternId)?.pattern || null;
  };

  const renderPatternSVG = (record: CraftRecord, size: 'sm' | 'lg' = 'sm') => {
    const pattern = getPatternFromRecord(record);
    if (!pattern) return null;

    if (record.imagePreview || pattern.imagePreview) {
      const imgSrc = record.imagePreview || pattern.imagePreview;
      return (
        <img 
          src={imgSrc} 
          alt={pattern.name}
          className="w-full h-full object-contain"
        />
      );
    }

    const viewBox = size === 'sm' ? '0 0 100 100' : '0 0 300 200';
    const strokeWidth = size === 'sm' ? 1.5 : 2;

    return (
      <svg viewBox={viewBox} className="w-full h-full" fill="none">
        {pattern.layers.map((layer, layerIndex) => (
          <g key={layer.id} style={{ opacity: 0.3 + (layerIndex / pattern.layers.length) * 0.7 }}>
            {layer.paths.map((path, pathIndex) => (
              <path
                key={pathIndex}
                d={path}
                stroke={layer.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
          </g>
        ))}
      </svg>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSaveVersion = () => {
    if (!selectedRecord || !versionDescription.trim()) return;
    
    try {
      saveRecordVersion(selectedRecord.id, versionDescription.trim(), versionChangeType);
      setVersionDescription('');
      setShowVersionModal(false);
      setVersionSaveSuccess(true);
      setTimeout(() => setVersionSaveSuccess(false), 2000);
    } catch (error) {
      console.error('保存版本失败:', error);
    }
  };

  const handleLoadToWorkspace = () => {
    if (!selectedRecord) return;
    
    try {
      loadRecordToWorkspace(selectedRecord.id);
      setLoadSuccess(true);
      setTimeout(() => setLoadSuccess(false), 3000);
    } catch (error) {
      console.error('加载到工作区失败:', error);
    }
  };

  const getCompareVersions = () => {
    if (!sortedVersions.length) return { v1: null, v2: null };
    const v1 = sortedVersions.find(v => v.id === compareVersion1) || null;
    const v2 = sortedVersions.find(v => v.id === compareVersion2) || null;
    return { v1, v2 };
  };

  const renderCompareArrow = (value: number, isBetter: boolean) => {
    if (value === 0) {
      return <Minus className="w-4 h-4 text-ink-400" />;
    }
    if (isBetter) {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const getRiskLevelOrder = (level: string) => {
    const order: Record<string, number> = { 'low': 1, 'medium': 2, 'high': 3 };
    return order[level] || 0;
  };

  const renderCoilingPaths = () => {
    if (!selectedRecord) return null;

    const paths = [];
    const layers = selectedRecord.coilingModel.totalLayers;
    const baseY = 180;
    const heightPerLayer = 25;

    for (let i = 0; i < layers; i++) {
      const y = baseY - i * heightPerLayer;
      const amplitude = 15 + i * 3;
      const frequency = 0.02 + i * 0.005;
      let pathD = `M 20 ${y}`;

      for (let x = 20; x <= 280; x += 5) {
        const offsetY = Math.sin(x * frequency + i) * amplitude;
        pathD += ` L ${x} ${y + offsetY}`;
      }
      paths.push({ d: pathD, color: `rgba(212, 168, 83, ${0.3 + (i / layers) * 0.7})` });
    }

    return (
      <svg viewBox="0 0 300 200" className="w-full h-48">
        {paths.map((path, index) => (
          <path
            key={index}
            d={path.d}
            stroke={path.color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gold-gradient mb-2">
              工艺档案
            </h1>
            <p className="text-ink-400">
              记录每件作品，沉淀工艺经验
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建档案
          </Button>
        </div>

        {createSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4" />
            档案创建成功
          </div>
        )}

        <div className="flex gap-6">
          <div className="flex-1">
            <Card className="mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500" />
                  <input
                    type="text"
                    placeholder="搜索作品名称..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-ink-800/50 border border-gold-600/30 rounded-md text-ink-100 placeholder-ink-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-colors"
                  />
                </div>

                <div className="relative">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setStatusDropdownOpen(!statusDropdownOpen);
                      setSortDropdownOpen(false);
                    }}
                    className="min-w-[120px]"
                  >
                    {statusFilter === 'all' ? '全部状态' : statusMap[statusFilter as RecordStatus]?.label || statusFilter}
                    <ChevronDown className="ml-2 w-4 h-4" />
                  </Button>
                  {statusDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-36 bg-ink-800 border border-gold-600/30 rounded-md shadow-lg z-10">
                      {(['all', 'planned', 'in-progress', 'completed', 'failed'] as StatusFilter[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setStatusDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gold-500/10 transition-colors first:rounded-t-md last:rounded-b-md ${
                            statusFilter === status ? 'text-gold-400 bg-gold-500/10' : 'text-ink-300'
                          }`}
                        >
                          {status === 'all' ? '全部' : statusMap[status as RecordStatus]?.label || status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSortDropdownOpen(!sortDropdownOpen);
                      setStatusDropdownOpen(false);
                    }}
                    className="min-w-[120px]"
                  >
                    <SortAsc className="mr-2 w-4 h-4" />
                    {sortType === 'date' ? '按时间' : '按名称'}
                    <ChevronDown className="ml-2 w-4 h-4" />
                  </Button>
                  {sortDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-36 bg-ink-800 border border-gold-600/30 rounded-md shadow-lg z-10">
                      {([
                        { value: 'date', label: '按时间' },
                        { value: 'name', label: '按名称' },
                      ] as { value: SortType; label: string }[]).map((sort) => (
                        <button
                          key={sort.value}
                          onClick={() => {
                            setSortType(sort.value);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gold-500/10 transition-colors first:rounded-t-md last:rounded-b-md ${
                            sortType === sort.value ? 'text-gold-400 bg-gold-500/10' : 'text-ink-300'
                          }`}
                        >
                          {sort.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleSelectRecord(record)}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold/30 ${
                    selectedRecord?.id === record.id ? 'ring-2 ring-gold-500 rounded-lg' : ''
                  }`}
                >
                  <Card>
                    <div className="aspect-video bg-ink-900/50 rounded-md mb-4 overflow-hidden border border-gold-600/20">
                      {renderPatternSVG(record)}
                    </div>

                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-serif font-semibold text-gold-300 text-lg line-clamp-1">
                        {record.name}
                      </h3>
                      {record.riskLevel === 'high' && (
                        <Badge color="red" pulsing dot />
                      )}
                    </div>

                    <p className="text-sm text-ink-400 mb-3 line-clamp-1">
                      纹样：{record.patternName}
                    </p>

                    <div className="flex items-center justify-between">
                      <Badge color={statusMap[record.status as RecordStatus]?.color || 'gray'}>
                        {statusMap[record.status as RecordStatus]?.label || record.status}
                      </Badge>

                      <div className="flex items-center text-xs text-ink-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {record.date}
                      </div>
                    </div>

                    {record.riskLevel !== 'low' && (
                      <div className="mt-3 pt-3 border-t border-gold-600/20">
                        <Badge
                          color={riskLevelMap[record.riskLevel]?.color || 'gray'}
                          pulsing={record.riskLevel === 'high'}
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {riskLevelMap[record.riskLevel]?.label || record.riskLevel}
                        </Badge>
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>

            {filteredRecords.length === 0 && (
              <Card>
                <div className="text-center py-12 text-ink-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无匹配的工艺档案</p>
                </div>
              </Card>
            )}
          </div>

          <div className="w-[420px] flex-shrink-0">
            {selectedRecord ? (
              <div className="space-y-6 sticky top-6">
                <Card title="作品详情">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-gold-gradient mb-1">
                        {selectedRecord.name}
                      </h2>
                      <p className="text-ink-400 text-sm">
                        纹样类型：{selectedRecord.patternName}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatusChangeDropdownOpen(!statusChangeDropdownOpen);
                          }}
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          <Badge color={statusMap[selectedRecord.status as RecordStatus]?.color || 'gray'}>
                            {statusMap[selectedRecord.status as RecordStatus]?.label || selectedRecord.status}
                          </Badge>
                          <Edit2 className="w-3 h-3 text-ink-500" />
                        </button>
                        {statusChangeDropdownOpen && (
                          <div className="absolute top-full left-0 mt-1 w-32 bg-ink-800 border border-gold-600/30 rounded-md shadow-lg z-20">
                            {(['planned', 'in-progress', 'completed', 'failed'] as RecordStatus[]).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-gold-500/10 transition-colors first:rounded-t-md last:rounded-b-md ${
                                  selectedRecord.status === status ? 'text-gold-400 bg-gold-500/10' : 'text-ink-300'
                                }`}
                              >
                                {statusMap[status]?.label || status}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-ink-500 text-sm flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {selectedRecord.date}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card title="纹样快照">
                  <div className="bg-ink-900/50 rounded-md border border-gold-600/20 mb-4 overflow-hidden">
                    <div className="aspect-video">
                      {renderPatternSVG(selectedRecord, 'lg')}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-ink-800/50 rounded-md p-3 border border-gold-600/10">
                      <div className="text-ink-400 text-xs mb-1">层数</div>
                      <div className="text-gold-300 font-medium flex items-center gap-1">
                        <Layers className="w-4 h-4" />
                        {selectedPattern?.layers?.length || 0} 层
                      </div>
                    </div>
                    <div className="bg-ink-800/50 rounded-md p-3 border border-gold-600/10">
                      <div className="text-ink-400 text-xs mb-1">路径数</div>
                      <div className="text-gold-300 font-medium flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {totalPathCount} 条
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="配比信息">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                      <span className="text-ink-400 text-sm">漆料比例</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.mixture.lacquerRatio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                      <span className="text-ink-400 text-sm">粉料比例</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.mixture.powderRatio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                      <span className="text-ink-400 text-sm">油类比例</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.mixture.oilRatio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                      <span className="text-ink-400 text-sm">软硬指数</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.mixture.hardnessIndex.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-ink-400 text-sm">推荐线径</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.mixture.recommendedDiameter.toFixed(2)} mm
                      </span>
                    </div>
                  </div>
                </Card>

                <Card title="盘绕模型">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                      <span className="text-ink-400 text-sm">总层数</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.coilingModel.totalLayers} 层
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                      <span className="text-ink-400 text-sm">总高度</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.coilingModel.totalHeight} mm
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                      <span className="text-ink-400 text-sm">基础密度</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.coilingModel.baseDensity.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                      <span className="text-ink-400 text-sm">总用线量</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.coilingModel.wireLength} cm
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-ink-400 text-sm">预估时间</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.coilingModel.estimatedTime} 分钟
                      </span>
                    </div>
                  </div>
                </Card>

                <Card title="操作">
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => setShowVersionModal(true)}
                    >
                      <Save className="w-4 h-4" />
                      保存新版本
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleLoadToWorkspace}
                    >
                      <Download className="w-4 h-4" />
                      加载到工作区
                    </Button>
                    {sortedVersions.length >= 2 && (
                      <Button
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => {
                          if (sortedVersions.length >= 2) {
                            setCompareVersion1(sortedVersions[0].id);
                            setCompareVersion2(sortedVersions[1].id);
                            setShowCompareModal(true);
                          }
                        }}
                      >
                        <ArrowUpDown className="w-4 h-4" />
                        版本对比
                      </Button>
                    )}
                  </div>
                </Card>

                <Card title="工艺笔记">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-32 bg-ink-800/50 border border-gold-600/30 rounded-md p-3 text-ink-200 text-sm resize-none focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-colors"
                    placeholder="记录工艺心得..."
                  />
                  <div className="mt-3 flex justify-between items-center">
                    {saveSuccess && (
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        保存成功
                      </span>
                    )}
                    <Button 
                      variant="primary" 
                      className="px-4 py-2 text-sm ml-auto"
                      onClick={handleSaveNotes}
                    >
                      保存笔记
                    </Button>
                  </div>
                </Card>

                <Card 
                  title={
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-gold-400" />
                      版本记录
                    </div>
                  }
                >
                  {sortedVersions.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {sortedVersions.map((version, index) => (
                        <div
                          key={version.id}
                          className={`p-3 rounded-md border transition-colors ${
                            index === 0
                              ? 'bg-gold-500/10 border-gold-500/30'
                              : 'bg-ink-800/50 border-ink-600/30 hover:border-gold-600/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gold-300">
                                v{version.version}
                              </span>
                              {index === 0 && (
                                <Badge color="gold" className="text-xs">
                                  当前版本
                                </Badge>
                              )}
                            </div>
                            <Badge 
                              color={changeTypeMap[version.changeType]?.color || 'gray'}
                              className="text-xs"
                            >
                              {changeTypeMap[version.changeType]?.label || version.changeType}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-ink-300 mb-2 line-clamp-2">
                            {version.description}
                          </p>
                          
                          <div className="flex items-center gap-2 text-xs text-ink-500 mb-2">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(version.timestamp)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-ink-500">风险:</span>
                              <Badge 
                                color={riskLevelMap[version.riskLevel]?.color || 'gray'}
                                className="text-xs py-0 px-1"
                              >
                                {riskLevelMap[version.riskLevel]?.label || version.riskLevel}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-ink-500">线径:</span>
                              <span className="text-ink-300">{version.recommendedDiameter.toFixed(2)}mm</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-ink-500">硬度:</span>
                              <span className="text-ink-300">{version.hardnessIndex.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-ink-500">用线:</span>
                              <span className="text-ink-300">{version.wireLength}cm</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-ink-500">
                      <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无版本记录</p>
                    </div>
                  )}
                </Card>

                <Card title="风险预警">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-ink-400 text-sm">当前风险等级</span>
                      <Badge
                        color={riskLevelMap[selectedRecord.riskLevel]?.color || 'gray'}
                        pulsing={selectedRecord.riskLevel === 'high'}
                      >
                        {riskLevelMap[selectedRecord.riskLevel]?.label || selectedRecord.riskLevel}
                      </Badge>
                    </div>

                    {displayRiskAlerts && displayRiskAlerts.length > 0 ? (
                      <div className="space-y-2">
                        {displayRiskAlerts.map((warning, index) => {
                          const riskInfo = riskTypeMap[warning.type];
                          const IconComponent = riskInfo?.icon || AlertTriangle;
                          const badgeColor = warning.level === 'danger' ? 'red' : warning.level === 'warning' ? 'gold' : 'gray';

                          return (
                            <div
                              key={index}
                              className={`p-3 rounded-md border ${
                                warning.level === 'danger'
                                  ? 'bg-lacquer-500/10 border-lacquer-500/30'
                                  : warning.level === 'warning'
                                  ? 'bg-gold-500/10 border-gold-500/30'
                                  : 'bg-ink-800/50 border-ink-600/30'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <IconComponent
                                  className={`w-4 h-4 ${
                                    warning.level === 'danger'
                                      ? 'text-lacquer-400'
                                      : warning.level === 'warning'
                                      ? 'text-gold-400'
                                      : 'text-ink-400'
                                  }`}
                                />
                                <span
                                  className={`text-sm font-medium ${
                                    warning.level === 'danger'
                                      ? 'text-lacquer-300'
                                      : warning.level === 'warning'
                                      ? 'text-gold-300'
                                      : 'text-ink-300'
                                  }`}
                                >
                                  {riskInfo?.label || warning.type}
                                </span>
                                <Badge color={badgeColor} className="ml-auto">
                                  {warning.level === 'danger' ? '高' : warning.level === 'warning' ? '中' : '低'}
                                </Badge>
                              </div>
                              <p className="text-xs text-ink-400 ml-6">
                                {warning.message}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-ink-500">
                        <Shield className="w-8 h-8 mx-auto mb-2 text-green-500/70" />
                        <p className="text-sm">暂无风险预警</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ) : (
              <Card>
                <div className="text-center py-16 text-ink-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">选择一件作品查看详情</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-ink-900 border border-gold-600/30 rounded-lg p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif font-bold text-gold-gradient">
                新建工艺档案
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewRecordName('');
                }}
                className="text-ink-400 hover:text-ink-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-ink-400 text-sm mb-4">
              基于当前配比和盘绕模型创建新的工艺档案
            </p>

            <div className="mb-6">
              <label className="block text-sm text-ink-300 mb-2">
                作品名称
              </label>
              <input
                type="text"
                value={newRecordName}
                onChange={(e) => setNewRecordName(e.target.value)}
                placeholder="请输入作品名称..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateRecord();
                  }
                }}
                className="w-full px-4 py-2 bg-ink-800/50 border border-gold-600/30 rounded-md text-ink-100 placeholder-ink-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-colors"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewRecordName('');
                }}
              >
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateRecord}
                disabled={!newRecordName.trim()}
              >
                创建档案
              </Button>
            </div>
          </div>
        </div>
      )}

      {showVersionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-ink-900 border border-gold-600/30 rounded-lg p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif font-bold text-gold-gradient">
                保存新版本
              </h3>
              <button
                onClick={() => {
                  setShowVersionModal(false);
                  setVersionDescription('');
                }}
                className="text-ink-400 hover:text-ink-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-ink-400 text-sm mb-4">
              将当前工作区的配比和盘绕模型保存为新版本
            </p>

            <div className="mb-4">
              <label className="block text-sm text-ink-300 mb-2">
                变更类型
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['mixture', 'coiling', 'notes', 'all'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setVersionChangeType(type)}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      versionChangeType === type
                        ? 'bg-gold-500/20 border-gold-500 text-gold-300'
                        : 'bg-ink-800/50 border-ink-600/30 text-ink-300 hover:border-gold-600/50'
                    }`}
                  >
                    {changeTypeMap[type]?.label || type}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-ink-300 mb-2">
                版本说明
              </label>
              <textarea
                value={versionDescription}
                onChange={(e) => setVersionDescription(e.target.value)}
                placeholder="请输入版本变更说明..."
                autoFocus
                className="w-full h-24 px-4 py-2 bg-ink-800/50 border border-gold-600/30 rounded-md text-ink-100 placeholder-ink-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-colors resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowVersionModal(false);
                  setVersionDescription('');
                }}
              >
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveVersion}
                disabled={!versionDescription.trim()}
              >
                保存版本
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCompareModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-ink-900 border border-gold-600/30 rounded-lg p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif font-bold text-gold-gradient flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                版本对比
              </h3>
              <button
                onClick={() => {
                  setShowCompareModal(false);
                }}
                className="text-ink-400 hover:text-ink-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-ink-300 mb-2">
                  版本 1
                </label>
                <select
                  value={compareVersion1 || ''}
                  onChange={(e) => setCompareVersion1(e.target.value)}
                  className="w-full px-3 py-2 bg-ink-800/50 border border-gold-600/30 rounded-md text-ink-100 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-colors"
                >
                  {sortedVersions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.version} - {v.description.slice(0, 15)}...
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-ink-300 mb-2">
                  版本 2
                </label>
                <select
                  value={compareVersion2 || ''}
                  onChange={(e) => setCompareVersion2(e.target.value)}
                  className="w-full px-3 py-2 bg-ink-800/50 border border-gold-600/30 rounded-md text-ink-100 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-colors"
                >
                  {sortedVersions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.version} - {v.description.slice(0, 15)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {compareVersion1 && compareVersion2 && (() => {
              const { v1, v2 } = getCompareVersions();
              if (!v1 || !v2) return null;

              const riskDiff = getRiskLevelOrder(v1.riskLevel) - getRiskLevelOrder(v2.riskLevel);
              const diameterDiff = v1.recommendedDiameter - v2.recommendedDiameter;
              const hardnessDiff = v1.hardnessIndex - v2.hardnessIndex;
              const wireDiff = v1.wireLength - v2.wireLength;
              const heightDiff = v1.totalHeight - v2.totalHeight;

              return (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                    <span className="text-ink-400 text-sm">风险等级</span>
                    <div className="flex items-center gap-2">
                      <Badge color={riskLevelMap[v1.riskLevel]?.color}>
                        {riskLevelMap[v1.riskLevel]?.label}
                      </Badge>
                      <span className="text-ink-500">→</span>
                      <Badge color={riskLevelMap[v2.riskLevel]?.color}>
                        {riskLevelMap[v2.riskLevel]?.label}
                      </Badge>
                      {renderCompareArrow(riskDiff, riskDiff < 0)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                    <span className="text-ink-400 text-sm">线径</span>
                    <div className="flex items-center gap-2">
                      <span className="text-ink-300">{v2.recommendedDiameter.toFixed(2)}mm</span>
                      <span className="text-ink-500">→</span>
                      <span className="text-gold-300 font-medium">{v1.recommendedDiameter.toFixed(2)}mm</span>
                      {renderCompareArrow(Math.abs(diameterDiff), diameterDiff < 0)}
                      <span className={`text-xs ${diameterDiff > 0 ? 'text-red-400' : diameterDiff < 0 ? 'text-green-400' : 'text-ink-500'}`}>
                        {diameterDiff > 0 ? '+' : ''}{diameterDiff.toFixed(2)}mm
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                    <span className="text-ink-400 text-sm">硬度指数</span>
                    <div className="flex items-center gap-2">
                      <span className="text-ink-300">{v2.hardnessIndex.toFixed(1)}</span>
                      <span className="text-ink-500">→</span>
                      <span className="text-gold-300 font-medium">{v1.hardnessIndex.toFixed(1)}</span>
                      {renderCompareArrow(Math.abs(hardnessDiff), hardnessDiff > 0)}
                      <span className={`text-xs ${hardnessDiff > 0 ? 'text-green-400' : hardnessDiff < 0 ? 'text-red-400' : 'text-ink-500'}`}>
                        {hardnessDiff > 0 ? '+' : ''}{hardnessDiff.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                    <span className="text-ink-400 text-sm">总用线量</span>
                    <div className="flex items-center gap-2">
                      <span className="text-ink-300">{v2.wireLength}cm</span>
                      <span className="text-ink-500">→</span>
                      <span className="text-gold-300 font-medium">{v1.wireLength}cm</span>
                      {renderCompareArrow(Math.abs(wireDiff), wireDiff < 0)}
                      <span className={`text-xs ${wireDiff > 0 ? 'text-red-400' : wireDiff < 0 ? 'text-green-400' : 'text-ink-500'}`}>
                        {wireDiff > 0 ? '+' : ''}{wireDiff}cm
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-ink-400 text-sm">总高度</span>
                    <div className="flex items-center gap-2">
                      <span className="text-ink-300">{v2.totalHeight}mm</span>
                      <span className="text-ink-500">→</span>
                      <span className="text-gold-300 font-medium">{v1.totalHeight}mm</span>
                      {renderCompareArrow(Math.abs(heightDiff), heightDiff > 0)}
                      <span className={`text-xs ${heightDiff > 0 ? 'text-green-400' : heightDiff < 0 ? 'text-red-400' : 'text-ink-500'}`}>
                        {heightDiff > 0 ? '+' : ''}{heightDiff}mm
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowCompareModal(false)}
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}

      {versionSaveSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          版本保存成功
        </div>
      )}

      {loadSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-2 animate-fade-in max-w-sm">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>已加载到工作区，可前往各页面编辑</span>
        </div>
      )}
    </div>
  );
}
