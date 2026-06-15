import { useState, useMemo, useEffect } from 'react';
import { Search, SortAsc, Calendar, Layers, FileText, AlertTriangle, Droplets, Zap, Shield, ChevronDown, Plus, Check, X, Edit2 } from 'lucide-react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import { useAppStore } from '@/store/useAppStore';
import type { CraftRecord } from '@/types';

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

export default function CraftArchive() {
  const {
    craftRecords,
    templates,
    createCraftRecord,
    updateCraftRecord,
    updateCraftNotes,
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
    return templates.find(t => t.pattern.id === selectedRecord.patternId)?.pattern || null;
  }, [selectedRecord, templates]);

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

  const renderPatternSVG = (record: CraftRecord, size: 'sm' | 'lg' = 'sm') => {
    const pattern = templates.find(t => t.pattern.id === record.patternId)?.pattern;
    if (!pattern) return null;

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

                <Card title="盘绕走向图">
                  <div className="bg-ink-900/50 rounded-md border border-gold-600/20 p-4">
                    {renderCoilingPaths()}
                  </div>
                </Card>

                <Card title="参数详情">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                      <span className="text-ink-400 text-sm">线料配比</span>
                      <span className="text-gold-300 font-medium text-sm">
                        漆 {selectedRecord.mixture.lacquerRatio.toFixed(1)}% / 粉 {selectedRecord.mixture.powderRatio.toFixed(1)}% / 油 {selectedRecord.mixture.oilRatio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                      <span className="text-ink-400 text-sm">软硬指数</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.mixture.hardnessIndex.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                      <span className="text-ink-400 text-sm">线径</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.mixture.recommendedDiameter.toFixed(2)} mm
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                      <span className="text-ink-400 text-sm">层数</span>
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
                      <span className="text-ink-400 text-sm">密度</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.coilingModel.baseDensity.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-ink-400 text-sm">总用线量</span>
                      <span className="text-gold-300 font-medium">
                        {selectedRecord.coilingModel.wireLength} cm
                      </span>
                    </div>
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
    </div>
  );
}
