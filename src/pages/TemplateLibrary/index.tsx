import { useState, useMemo } from 'react';
import {
  Search,
  Grid,
  List,
  Star,
  Heart,
  Share2,
  Play,
  X,
  ChevronDown,
  Sparkles,
  Layers,
  Ruler,
  Droplets,
  Zap,
  Target,
  Award,
  Users,
  Calendar,
} from 'lucide-react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import { mockTemplates } from '@/data/mockData';
import type { Template } from '@/types';

type CategoryType = 'all' | '瑞兽纹样' | '花卉纹样' | '云纹水纹' | '几何纹样' | '山水纹样' | '自定义';
type SortType = 'hot' | 'new' | 'rating';
type ViewType = 'grid' | 'list';

const categories: { value: CategoryType; label: string }[] = [
  { value: 'all', label: '全部分类' },
  { value: '瑞兽纹样', label: '瑞兽纹样' },
  { value: '花卉纹样', label: '花卉纹样' },
  { value: '云纹水纹', label: '云纹水纹' },
  { value: '几何纹样', label: '几何纹样' },
  { value: '山水纹样', label: '山水纹样' },
  { value: '自定义', label: '自定义模板' },
];

const sortOptions: { value: SortType; label: string }[] = [
  { value: 'hot', label: '最热' },
  { value: 'new', label: '最新' },
  { value: 'rating', label: '评分最高' },
];

const difficultyLabels: Record<number, string> = {
  1: '入门',
  2: '简单',
  3: '中等',
  4: '困难',
  5: '大师',
};

const difficultyColors: Record<number, 'green' | 'gold' | 'red' | 'gray'> = {
  1: 'green',
  2: 'green',
  3: 'gold',
  4: 'red',
  5: 'red',
};

export default function TemplateLibrary() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>('hot');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredTemplates = useMemo(() => {
    let result = [...mockTemplates];

    if (selectedCategory !== 'all') {
      if (selectedCategory === '云纹水纹') {
        result = result.filter(
          (t) => t.category === '云纹' || t.category === '水纹' || t.category === '云纹水纹'
        );
      } else if (selectedCategory === '自定义') {
        result = result.filter((t) => t.id.startsWith('custom-'));
      } else {
        result = result.filter((t) => t.category === selectedCategory);
      }
    }

    if (searchQuery) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result.sort((a, b) => {
      if (sortType === 'hot') {
        return b.usageCount - a.usageCount;
      } else if (sortType === 'new') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        const ratingA = a.pattern.complexity * 10 + (a.usageCount % 5);
        const ratingB = b.pattern.complexity * 10 + (b.usageCount % 5);
        return ratingB - ratingA;
      }
    });

    return result;
  }, [selectedCategory, searchQuery, sortType]);

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedTemplate(null), 300);
  };

  const toggleFavorite = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  };

  const renderPatternSVG = (template: Template, size: 'sm' | 'lg' = 'sm') => {
    const pattern = template.pattern;
    const viewBox = size === 'sm' ? '0 0 100 100' : '0 0 400 300';
    const strokeWidth = size === 'sm' ? 1.5 : 2.5;

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

  const renderStars = (count: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= count ? 'text-gold-400 fill-gold-400' : 'text-ink-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const isCustomTemplate = (template: Template) => template.id.startsWith('custom-');

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gold-gradient mb-2">模板库</h1>
          <p className="text-ink-400">经典纹样漆线方案，一键复用快速创作</p>
        </div>

        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-lacquer-600 to-lacquer-700 text-gold-300 border border-gold-500/50 shadow-gold/20'
                    : 'bg-ink-800/50 text-ink-300 border border-gold-600/20 hover:border-gold-500/40 hover:text-gold-400'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <Card className="mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500" />
              <input
                type="text"
                placeholder="按模板名称搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-ink-800/50 border border-gold-600/30 rounded-md text-ink-100 placeholder-ink-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-colors"
              />
            </div>

            <div className="relative">
              <Button
                variant="secondary"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="min-w-[120px]"
              >
                {sortOptions.find((s) => s.value === sortType)?.label}
                <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
              {sortDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-36 bg-ink-800 border border-gold-600/30 rounded-md shadow-lg z-10">
                  {sortOptions.map((sort) => (
                    <button
                      key={sort.value}
                      onClick={() => {
                        setSortType(sort.value);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gold-500/10 transition-colors first:rounded-t-md last:rounded-b-md ${
                        sortType === sort.value
                          ? 'text-gold-400 bg-gold-500/10'
                          : 'text-ink-300'
                      }`}
                    >
                      {sort.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 p-1 bg-ink-800/50 rounded-md border border-gold-600/20">
              <button
                onClick={() => setViewType('grid')}
                className={`p-2 rounded transition-colors ${
                  viewType === 'grid'
                    ? 'bg-gold-500/20 text-gold-400'
                    : 'text-ink-400 hover:text-gold-400'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-2 rounded transition-colors ${
                  viewType === 'list'
                    ? 'bg-gold-500/20 text-gold-400'
                    : 'text-ink-400 hover:text-gold-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {viewType === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className="group cursor-pointer transition-all duration-300 ease-out"
              >
                <Card className="h-full overflow-hidden hover:shadow-gold/30 hover:border-gold-500/50 group-hover:scale-[1.02] transition-all duration-300">
                  <div className="relative aspect-square bg-ink-900/50 rounded-md mb-4 overflow-hidden border border-gold-600/20 group-hover:border-gold-500/40 transition-colors">
                    <div className="absolute inset-0 p-4">{renderPatternSVG(template)}</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <Button
                        variant="primary"
                        className="flex-1 py-1.5 text-xs px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Play className="w-3.5 h-3.5 mr-1" />
                        应用
                      </Button>
                      <button
                        onClick={(e) => toggleFavorite(template.id, e)}
                        className="p-2 rounded-md bg-ink-800/80 border border-gold-600/30 hover:bg-gold-500/20 hover:border-gold-500/50 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.has(template.id)
                              ? 'text-lacquer-400 fill-lacquer-400'
                              : 'text-gold-400'
                          }`}
                        />
                      </button>
                    </div>
                    {isCustomTemplate(template) ? (
                      <Badge color="gray" className="absolute top-2 left-2">
                        自定义
                      </Badge>
                    ) : (
                      <Badge color="gold" pulsing className="absolute top-2 left-2">
                        <Sparkles className="w-3 h-3 mr-1" />
                        官方
                      </Badge>
                    )}
                    <Badge
                      color={difficultyColors[template.pattern.complexity] || 'gray'}
                      className="absolute top-2 right-2"
                    >
                      {difficultyLabels[template.pattern.complexity] || '未知'}
                    </Badge>
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-serif font-semibold text-gold-300 text-base line-clamp-1">
                      {template.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge color="gold" className="text-xs">
                      {template.category}
                    </Badge>
                    <div className="flex items-center text-xs text-ink-500">
                      <Users className="w-3 h-3 mr-1" />
                      {template.usageCount}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {renderStars(template.pattern.complexity)}
                    <span className="text-xs text-ink-500">
                      {template.pattern.layers.length} 层
                    </span>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className="group cursor-pointer transition-all duration-300"
              >
                <Card className="hover:shadow-gold/30 hover:border-gold-500/50 transition-all duration-300">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0 bg-ink-900/50 rounded-md overflow-hidden border border-gold-600/20 group-hover:border-gold-500/40 transition-colors">
                      <div className="absolute inset-0 p-2">{renderPatternSVG(template)}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-serif font-semibold text-gold-300 text-lg">
                            {template.name}
                          </h3>
                          <p className="text-sm text-ink-400 mt-1 line-clamp-1">
                            {template.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {isCustomTemplate(template) ? (
                            <Badge color="gray">自定义</Badge>
                          ) : (
                            <Badge color="gold" pulsing>
                              <Sparkles className="w-3 h-3 mr-1" />
                              官方
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge color="gold">{template.category}</Badge>
                        <Badge color={difficultyColors[template.pattern.complexity] || 'gray'}>
                          难度：{difficultyLabels[template.pattern.complexity] || '未知'}
                        </Badge>
                        <div className="flex items-center text-ink-500">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{template.usageCount} 次使用</span>
                        </div>
                        <div className="flex items-center text-ink-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{template.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        {renderStars(template.pattern.complexity)}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="primary"
                            onClick={(e) => e.stopPropagation()}
                            className="py-1.5 px-4 text-sm"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            应用模板
                          </Button>
                          <button
                            onClick={(e) => toggleFavorite(template.id, e)}
                            className="p-2 rounded-md border border-gold-600/30 hover:bg-gold-500/10 transition-colors"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                favorites.has(template.id)
                                  ? 'text-lacquer-400 fill-lacquer-400'
                                  : 'text-gold-400'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <Card>
            <div className="text-center py-16 text-ink-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无匹配的模板</p>
            </div>
          </Card>
        )}
      </div>

      <div
        className={`fixed inset-0 bg-ink-950/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleCloseDrawer}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[480px] bg-ink-900 z-50 transform transition-transform duration-300 ease-out shadow-2xl border-l border-gold-600/30 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedTemplate && (
          <div className="h-full flex flex-col overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-ink-900/95 backdrop-blur border-b border-gold-600/20">
              <h2 className="text-xl font-serif font-bold text-gold-gradient">模板详情</h2>
              <button
                onClick={handleCloseDrawer}
                className="p-2 rounded-md text-ink-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-6">
              <div className="aspect-[4/3] bg-ink-950/50 rounded-lg overflow-hidden border border-gold-600/30">
                <div className="w-full h-full p-6">{renderPatternSVG(selectedTemplate, 'lg')}</div>
              </div>

              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-serif font-bold text-gold-gradient">
                    {selectedTemplate.name}
                  </h3>
                  {isCustomTemplate(selectedTemplate) ? (
                    <Badge color="gray">自定义</Badge>
                  ) : (
                    <Badge color="gold" pulsing>
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      官方模板
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <Badge color="gold">{selectedTemplate.category}</Badge>
                  <Badge
                    color={difficultyColors[selectedTemplate.pattern.complexity] || 'gray'}
                  >
                    {difficultyLabels[selectedTemplate.pattern.complexity] || '未知'}难度
                  </Badge>
                </div>
                <p className="text-ink-300 leading-relaxed">{selectedTemplate.description}</p>
              </div>

              <div className="flex items-center justify-around py-4 bg-ink-800/30 rounded-lg border border-gold-600/20">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    {renderStars(selectedTemplate.pattern.complexity)}
                  </div>
                  <span className="text-xs text-ink-500">评分</span>
                </div>
                <div className="w-px h-10 bg-gold-600/20" />
                <div className="text-center">
                  <div className="text-lg font-bold text-gold-400">
                    {selectedTemplate.usageCount}
                  </div>
                  <span className="text-xs text-ink-500">使用次数</span>
                </div>
                <div className="w-px h-10 bg-gold-600/20" />
                <div className="text-center">
                  <div className="text-lg font-bold text-gold-400">
                    {selectedTemplate.pattern.layers.length}
                  </div>
                  <span className="text-xs text-ink-500">图层数</span>
                </div>
              </div>

              <Card title="工艺参数">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                    <span className="text-ink-400 text-sm flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-gold-500/70" />
                      线料配比
                    </span>
                    <span className="text-gold-300 font-medium text-sm">
                      漆 {selectedTemplate.threadMixture.lacquerRatio.toFixed(1)}% / 粉{' '}
                      {selectedTemplate.threadMixture.powderRatio.toFixed(1)}% / 油{' '}
                      {selectedTemplate.threadMixture.oilRatio.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                    <span className="text-ink-400 text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gold-500/70" />
                      软硬指数
                    </span>
                    <span className="text-gold-300 font-medium text-sm">
                      {selectedTemplate.threadMixture.hardnessIndex.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                    <span className="text-ink-400 text-sm flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-gold-500/70" />
                      推荐线径
                    </span>
                    <span className="text-gold-300 font-medium text-sm">
                      {selectedTemplate.threadMixture.recommendedDiameter.toFixed(2)} mm
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gold-600/10">
                    <span className="text-ink-400 text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gold-500/70" />
                      层数
                    </span>
                    <span className="text-gold-300 font-medium text-sm">
                      {selectedTemplate.coilingModel.totalLayers} 层
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-ink-400 text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-gold-500/70" />
                      堆叠高度
                    </span>
                    <span className="text-gold-300 font-medium text-sm">
                      {selectedTemplate.coilingModel.totalHeight} mm
                    </span>
                  </div>
                </div>
              </Card>

              <Card title="适用场景">
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.pattern.tags.map((tag) => (
                    <Badge key={tag} color="gold">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card title="评分与统计">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-ink-400 text-sm">综合评分</span>
                      <span className="text-gold-400 font-bold">
                        {selectedTemplate.pattern.complexity}.0
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(selectedTemplate.pattern.complexity)}
                      <span className="text-xs text-ink-500">
                        基于 {selectedTemplate.usageCount} 位匠师评价
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gold-600/10">
                    <div className="text-center">
                      <Award className="w-6 h-6 text-gold-500 mx-auto mb-1" />
                      <div className="text-sm text-gold-300 font-medium">
                        {Math.round(selectedTemplate.usageCount * 0.85)}
                      </div>
                      <div className="text-xs text-ink-500">好评率</div>
                    </div>
                    <div className="text-center">
                      <Users className="w-6 h-6 text-gold-500 mx-auto mb-1" />
                      <div className="text-sm text-gold-300 font-medium">
                        {selectedTemplate.usageCount}
                      </div>
                      <div className="text-xs text-ink-500">使用次数</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="sticky bottom-0 p-6 bg-ink-900/95 backdrop-blur border-t border-gold-600/20">
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  应用模板
                </Button>
                <button
                  onClick={(e) => toggleFavorite(selectedTemplate.id, e)}
                  className={`p-3 rounded-md border transition-colors ${
                    favorites.has(selectedTemplate.id)
                      ? 'bg-lacquer-500/20 border-lacquer-500/50 text-lacquer-400'
                      : 'border-gold-600/50 text-gold-400 hover:bg-gold-500/10'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      favorites.has(selectedTemplate.id) ? 'fill-lacquer-400' : ''
                    }`}
                  />
                </button>
                <button className="p-3 rounded-md border border-gold-600/50 text-gold-400 hover:bg-gold-500/10 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
