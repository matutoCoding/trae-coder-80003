import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Upload,
  Star,
  Layers,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Ruler,
  Grid3X3,
  Zap,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Save,
  Check,
  AlertCircle,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import { useAppStore } from '@/store/useAppStore';
import { mockTemplates } from '@/data/mockData';

type ParseStatus = 'idle' | 'loading' | 'success' | 'error' | 'image';

export default function PatternAnalysis() {
  const { currentPattern, parsePatternFromSVG, saveAsTemplate } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [parseStatus, setParseStatus] = useState<ParseStatus>('idle');
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({});
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pattern = currentPattern || mockTemplates[0].pattern;

  const layers = useMemo(() => pattern?.layers || [], [pattern]);

  const calculatePathLength = useCallback((d: string): number => {
    let length = 0;
    const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g) || [];
    let prevX = 0;
    let prevY = 0;

    for (const cmd of commands) {
      const type = cmd[0].toUpperCase();
      const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));

      if (type === 'M' || type === 'L') {
        for (let i = 0; i < nums.length; i += 2) {
          const x = nums[i];
          const y = nums[i + 1];
          if (i > 0 || type === 'L') {
            const dx = x - prevX;
            const dy = y - prevY;
            length += Math.sqrt(dx * dx + dy * dy);
          }
          prevX = x;
          prevY = y;
        }
      } else if (type === 'Q') {
        for (let i = 0; i < nums.length; i += 4) {
          const x = nums[i + 2];
          const y = nums[i + 3];
          const dx = x - prevX;
          const dy = y - prevY;
          length += Math.sqrt(dx * dx + dy * dy) * 1.2;
          prevX = x;
          prevY = y;
        }
      } else if (type === 'C') {
        for (let i = 0; i < nums.length; i += 6) {
          const x = nums[i + 4];
          const y = nums[i + 5];
          const dx = x - prevX;
          const dy = y - prevY;
          length += Math.sqrt(dx * dx + dy * dy) * 1.3;
          prevX = x;
          prevY = y;
        }
      } else if (type === 'Z') {
      }
    }

    return length || d.length * 0.5;
  }, []);

  const analysisStats = useMemo(() => {
    const totalPaths = layers.reduce((sum, layer) => sum + layer.paths.length, 0);
    
    let totalPathLength = 0;
    layers.forEach((layer) => {
      layer.paths.forEach((path) => {
        totalPathLength += calculatePathLength(path);
      });
    });

    const estimatedLength = Math.round(totalPathLength * 0.8);
    const regionCount = Math.floor(totalPaths / 2) + layers.length * 3;
    const suggestedLayers = Math.min(5, Math.max(2, Math.ceil(totalPaths / 5)));
    
    return { totalPaths, estimatedLength, regionCount, suggestedLayers };
  }, [layers, calculatePathLength]);

  const { totalPaths, estimatedLength, regionCount, suggestedLayers } = analysisStats;

  useEffect(() => {
    if (layers.length > 0 && Object.keys(visibleLayers).length === 0) {
      const visible: Record<string, boolean> = {};
      const expanded: Record<string, boolean> = {};
      layers.forEach((layer) => {
        visible[layer.id] = true;
        expanded[layer.id] = true;
      });
      setVisibleLayers(visible);
      setExpandedLayers(expanded);
    }
  }, [layers, visibleLayers]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setErrorMessage('');
    setSuccessMessage('');
    setUploadedFileName(file.name);

    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      handleSVGFile(file);
    } else if (file.type.startsWith('image/')) {
      handleImageFile(file);
    } else {
      setParseStatus('error');
      setErrorMessage('不支持的文件格式，请上传 SVG 或图片文件');
    }
  };

  const handleSVGFile = (file: File) => {
    setParseStatus('loading');
    setUploadProgress(0);
    setImagePreview('');

    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 50);
        setUploadProgress(progress);
      }
    };

    reader.onload = (e) => {
      try {
        setUploadProgress(60);
        const svgContent = e.target?.result as string;
        
        setTimeout(() => {
          setUploadProgress(80);
        }, 100);

        setTimeout(() => {
          try {
            parsePatternFromSVG(svgContent, file.name);
            setUploadProgress(100);
            setParseStatus('success');
            setSuccessMessage(`成功解析 SVG 文件，共 ${pattern.layers.reduce((sum, l) => sum + l.paths.length, 0)} 条路径`);
            resetVisibleLayers();
            
            setTimeout(() => {
              setParseStatus('idle');
              setSuccessMessage('');
            }, 3000);
          } catch (error) {
            setParseStatus('error');
            setErrorMessage('SVG 解析失败，请检查文件格式');
            console.error('Parse error:', error);
          }
        }, 300);
      } catch (error) {
        setParseStatus('error');
        setErrorMessage('文件读取失败');
        console.error('File read error:', error);
      }
    };

    reader.onerror = () => {
      setParseStatus('error');
      setErrorMessage('文件读取出错');
    };

    reader.readAsText(file);
  };

  const handleImageFile = (file: File) => {
    setParseStatus('image');
    setUploadProgress(100);

    const reader = new FileReader();

    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };

    reader.readAsDataURL(file);
  };

  const resetVisibleLayers = () => {
    setTimeout(() => {
      const visible: Record<string, boolean> = {};
      const expanded: Record<string, boolean> = {};
      layers.forEach((layer) => {
        visible[layer.id] = true;
        expanded[layer.id] = true;
      });
      setVisibleLayers(visible);
      setExpandedLayers(expanded);
    }, 100);
  };

  const toggleLayerVisibility = (layerId: string) => {
    setVisibleLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const toggleLayerExpanded = (layerId: string) => {
    setExpandedLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const handleSaveAsTemplate = () => {
    setTemplateName(pattern.name);
    setTemplateDescription(pattern.description);
    setShowSaveDialog(true);
  };

  const confirmSaveTemplate = () => {
    if (!templateName.trim()) {
      return;
    }
    saveAsTemplate(templateName.trim(), templateDescription.trim());
    setShowSaveDialog(false);
    setSuccessMessage('模板保存成功！');
    setTimeout(() => {
      setSuccessMessage('');
    }, 2000);
  };

  const renderStars = (count: number, max: number = 5) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < count
                ? 'text-gold-400 fill-gold-400'
                : 'text-ink-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const generatePatternSVG = () => {
    const paths: string[] = [];
    
    layers.forEach((layer) => {
      if (visibleLayers[layer.id]) {
        layer.paths.forEach((path) => {
          paths.push(path);
        });
      }
    });

    return (
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {layers.map((layer) =>
          visibleLayers[layer.id]
            ? layer.paths.map((path, pathIndex) => (
                <path
                  key={`${layer.id}-${pathIndex}`}
                  d={path}
                  fill="none"
                  stroke={layer.color}
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                  className="transition-all duration-300"
                />
              ))
            : null
        )}

        {layers.map((layer) =>
          visibleLayers[layer.id]
            ? layer.paths.map((path, pathIndex) => (
                <path
                  key={`anim-${layer.id}-${pathIndex}`}
                  d={path}
                  fill="none"
                  stroke={layer.color}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="3 6"
                  opacity="0.6"
                  className="animate-pulse"
                />
              ))
            : null
        )}
      </svg>
    );
  };

  return (
    <div className="min-h-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-gold-gradient mb-2">
          纹样解析
        </h1>
        <p className="text-ink-400 text-sm">
          导入纹样图案，规划漆线盘绕走向与层次
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <Card title="纹样导入" subtitle="拖拽或点击上传纹样图案">
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? 'border-gold-400 bg-gold-500/10'
                  : 'border-gold-600/40 hover:border-gold-500/60 hover:bg-gold-500/5'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleFileClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.svg"
                className="hidden"
                onChange={handleFileChange}
              />
              
              {parseStatus === 'loading' ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto mb-3 relative">
                    <div className="absolute inset-0 border-3 border-gold-500/30 rounded-full" />
                    <div
                      className="absolute inset-0 border-3 border-gold-400 rounded-full border-t-transparent animate-spin"
                    />
                  </div>
                  <p className="text-sm text-gold-300 font-medium">解析中...</p>
                  <div className="w-full bg-ink-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-gold-500 to-gold-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-ink-400">
                    {Math.min(Math.round(uploadProgress), 100)}%
                  </p>
                </div>
              ) : parseStatus === 'success' ? (
                <div className="space-y-2">
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="w-7 h-7 text-green-400" />
                  </div>
                  <p className="text-sm text-green-400 font-medium">解析成功</p>
                  <p className="text-xs text-ink-400">{successMessage}</p>
                </div>
              ) : parseStatus === 'error' ? (
                <div className="space-y-2">
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-red-400" />
                  </div>
                  <p className="text-sm text-red-400 font-medium">解析失败</p>
                  <p className="text-xs text-ink-400">{errorMessage}</p>
                </div>
              ) : parseStatus === 'image' ? (
                <div className="space-y-2">
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <ImageIcon className="w-7 h-7 text-blue-400" />
                  </div>
                  <p className="text-sm text-blue-400 font-medium">图片已上传</p>
                  <p className="text-xs text-ink-400">
                    图片纹样请手动描边或使用SVG格式
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold-500/10 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-gold-400" />
                  </div>
                  <p className="text-sm text-gold-300 font-medium mb-1">
                    拖拽纹样图片到此处
                  </p>
                  <p className="text-xs text-ink-400">
                    或点击选择文件
                  </p>
                  <p className="text-xs text-ink-500 mt-2">
                    支持 SVG、PNG、JPG 格式
                  </p>
                </>
              )}
            </div>

            {uploadedFileName && (
              <div className="mt-3 flex items-center gap-2 text-xs text-ink-400">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate">{uploadedFileName}</span>
              </div>
            )}

            {successMessage && parseStatus !== 'success' && (
              <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-xs text-green-400">{successMessage}</span>
              </div>
            )}

            {parseStatus === 'image' && imagePreview && (
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-blue-400 font-medium mb-1">提示</p>
                    <p className="text-xs text-ink-400">
                      图片纹样请手动描边或使用SVG格式以获得更好的解析效果
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card title="纹样预览">
            <div className="aspect-square bg-ink-900/50 rounded-lg border border-gold-600/20 p-4 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#D4A853" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>
              {imagePreview && parseStatus === 'image' ? (
                <img
                  src={imagePreview}
                  alt="预览"
                  className="relative w-full h-full object-contain"
                />
              ) : (
                <div className="relative w-full h-full">
                  {generatePatternSVG()}
                </div>
              )}
            </div>
          </Card>

          <Card title="基本信息">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-400">名称</span>
                <span className="text-sm text-gold-300 font-medium">
                  {pattern.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-400">类别</span>
                <Badge color="gold">
                  {pattern.category}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-400">复杂度</span>
                {renderStars(pattern.complexity)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-400">标签</span>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {pattern.tags.map((tag) => (
                    <Badge key={tag} color="gray">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title="保存模板">
            <p className="text-xs text-ink-400 mb-3">
              将当前纹样和配比保存为模板，方便后续直接使用
            </p>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleSaveAsTemplate}
            >
              <Save className="w-4 h-4 mr-2" />
              另存为模板
            </Button>
          </Card>
        </div>

        <div className="xl:col-span-6">
          <Card
            title="路径预览"
            subtitle="可切换图层显示，查看漆线盘绕走向"
            className="h-full"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="secondary" className="!px-3 !py-1.5 !text-xs">
                    <ZoomOut className="w-4 h-4 mr-1" />
                    缩小
                  </Button>
                  <Button variant="secondary" className="!px-3 !py-1.5 !text-xs">
                    <ZoomIn className="w-4 h-4 mr-1" />
                    放大
                  </Button>
                  <Button variant="secondary" className="!px-3 !py-1.5 !text-xs">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    重置
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="!px-3 !py-1.5 !text-xs">
                    <Move className="w-4 h-4 mr-1" />
                    平移
                  </Button>
                </div>
              </div>

              <div className="relative aspect-[4/3] bg-ink-900/70 rounded-lg border border-gold-600/20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <pattern id="previewGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                        <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#D4A853" strokeWidth="0.3" />
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#previewGrid)" />
                  </svg>
                </div>

                <div className="absolute inset-8">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <filter id="glowLarge" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <filter id="shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    {layers.map((layer) =>
                      visibleLayers[layer.id]
                        ? layer.paths.map((path, pathIndex) => (
                            <path
                              key={`shadow-${layer.id}-${pathIndex}`}
                              d={path}
                              fill="none"
                              stroke="#000"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity="0.3"
                              transform="translate(0.5, 1)"
                            />
                          ))
                        : null
                    )}

                    {layers.map((layer) =>
                      visibleLayers[layer.id]
                        ? layer.paths.map((path, pathIndex) => (
                            <path
                              key={`main-${layer.id}-${pathIndex}`}
                              d={path}
                              fill="none"
                              stroke={layer.color}
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              filter="url(#glowLarge)"
                              className="transition-all duration-500"
                            />
                          ))
                        : null
                    )}

                    {layers.map((layer) =>
                      visibleLayers[layer.id]
                        ? layer.paths.map((path, pathIndex) => (
                            <path
                              key={`dash-${layer.id}-${pathIndex}`}
                              d={path}
                              fill="none"
                              stroke={layer.color}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="4 8"
                              opacity="0.5"
                              className="animate-[dash_2s_linear_infinite]"
                            />
                          ))
                        : null
                    )}
                  </svg>
                </div>

                <div className="absolute bottom-3 left-3 flex gap-3">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-opacity duration-300 ${
                        visibleLayers[layer.id] ? 'opacity-100' : 'opacity-40'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="text-ink-300">{layer.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-ink-500">
                <span>提示：可在右侧层面板中控制各层显示</span>
                <span>比例 1:1</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-3 space-y-6">
          <Card title="纹样分析" subtitle="AI智能分析结果">
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 bg-gold-500/5 rounded-lg border border-gold-600/20">
                <div className="w-10 h-10 rounded-full bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-gold-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-ink-400 mb-1">复杂度评估</p>
                  <div className="flex items-center gap-2">
                    {renderStars(pattern.complexity)}
                    <span className="text-sm text-gold-300 font-medium">
                      {pattern.complexity}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-ink-800/50 rounded-lg border border-ink-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Grid3X3 className="w-4 h-4 text-gold-500" />
                    <span className="text-xs text-ink-400">分区统计</span>
                  </div>
                  <p className="text-xl font-serif font-bold text-gold-300">
                    {regionCount}
                    <span className="text-xs text-ink-500 font-normal ml-1">个</span>
                  </p>
                </div>

                <div className="p-3 bg-ink-800/50 rounded-lg border border-ink-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-gold-500" />
                    <span className="text-xs text-ink-400">层次数</span>
                  </div>
                  <p className="text-xl font-serif font-bold text-gold-300">
                    {layers.length}
                    <span className="text-xs text-ink-500 font-normal ml-1">层</span>
                  </p>
                </div>

                <div className="p-3 bg-ink-800/50 rounded-lg border border-ink-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="w-4 h-4 text-gold-500" />
                    <span className="text-xs text-ink-400">线长估算</span>
                  </div>
                  <p className="text-xl font-serif font-bold text-gold-300">
                    {estimatedLength}
                    <span className="text-xs text-ink-500 font-normal ml-1">cm</span>
                  </p>
                </div>

                <div className="p-3 bg-ink-800/50 rounded-lg border border-ink-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-gold-500" />
                    <span className="text-xs text-ink-400">路径数</span>
                  </div>
                  <p className="text-xl font-serif font-bold text-gold-300">
                    {totalPaths}
                    <span className="text-xs text-ink-500 font-normal ml-1">条</span>
                  </p>
                </div>
              </div>

              <div className="p-3 bg-lacquer-900/30 rounded-lg border border-lacquer-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge color="red">建议</Badge>
                </div>
                <p className="text-sm text-ink-300">
                  建议分为 <span className="text-lacquer-400 font-bold">{suggestedLayers}</span> 个层次进行盘绕，
                  从底层到顶层逐步叠加，以增强立体感
                </p>
              </div>
            </div>
          </Card>

          <Card title="走向规划" subtitle="漆线盘绕层次列表" className="flex-1">
            <div className="space-y-2">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                    visibleLayers[layer.id]
                      ? 'border-gold-600/30 bg-gold-500/5'
                      : 'border-ink-700/50 bg-ink-800/30 opacity-70'
                  }`}
                >
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gold-500/5 transition-colors"
                    onClick={() => toggleLayerExpanded(layer.id)}
                  >
                    <button
                      className="text-ink-400 hover:text-gold-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerExpanded(layer.id);
                      }}
                    >
                      {expandedLayers[layer.id] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div
                      className="w-4 h-4 rounded-sm flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: layer.color }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gold-300 truncate">
                          {layer.name}
                        </span>
                        <span className="text-xs text-ink-500">
                          第{layer.order}层
                        </span>
                      </div>
                      <p className="text-xs text-ink-500">
                        {layer.paths.length} 条路径
                      </p>
                    </div>

                    <button
                      className={`p-1.5 rounded transition-colors ${
                        visibleLayers[layer.id]
                          ? 'text-gold-400 hover:bg-gold-500/20'
                          : 'text-ink-500 hover:bg-ink-700/50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisibility(layer.id);
                      }}
                    >
                      {visibleLayers[layer.id] ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {expandedLayers[layer.id] && (
                    <div className="px-3 pb-3 pt-0">
                      <div className="ml-7 space-y-1.5 border-l border-gold-600/20 pl-3">
                        {layer.paths.map((path, pathIndex) => {
                          const pathLength = Math.round(calculatePathLength(path) * 0.8);
                          return (
                            <div
                              key={pathIndex}
                              className="flex items-center gap-2 text-xs text-ink-400 py-1"
                            >
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: layer.color, opacity: 0.6 + pathIndex * 0.15 }}
                              />
                              <span>路径 {pathIndex + 1}</span>
                              <span className="text-ink-600">
                                ~{pathLength}cm
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gold-600/20">
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-400">总计</span>
                <span className="text-gold-300 font-medium">
                  {layers.length} 层 · {totalPaths} 条路径
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-ink-900 border border-gold-600/30 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-serif font-bold text-gold-300 mb-4">
              保存为模板
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-ink-400 mb-1.5">
                  模板名称
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full bg-ink-800 border border-gold-600/30 rounded-lg px-3 py-2 text-sm text-gold-200 focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="请输入模板名称"
                />
              </div>
              
              <div>
                <label className="block text-sm text-ink-400 mb-1.5">
                  模板描述
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="w-full bg-ink-800 border border-gold-600/30 rounded-lg px-3 py-2 text-sm text-gold-200 focus:outline-none focus:border-gold-500 transition-colors resize-none"
                  rows={3}
                  placeholder="请输入模板描述（可选）"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowSaveDialog(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={confirmSaveTemplate}
                disabled={!templateName.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
