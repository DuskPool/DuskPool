import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, ChevronDown, Activity, Settings,
  BarChart2, ArrowUpRight, BookOpen, TrendingUp,
  Minus, ArrowRight, Type, Trash2,
  MousePointer, MoveHorizontal, GitBranch,
  Circle, Square, X
} from 'lucide-react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, CandlestickData, Time } from 'lightweight-charts';

// --- Mock Data Generator with realistic price movement ---
const generateCandleData = (count: number): CandlestickData<Time>[] => {
  let price = 98.00;
  const data: CandlestickData<Time>[] = [];
  const now = Math.floor(Date.now() / 1000);

  for (let i = 0; i < count; i++) {
    const volatility = 0.8 + Math.random() * 0.5; // More realistic volatility
    const trend = Math.sin(i / 10) * 0.3; // Add some trend
    const change = (Math.random() - 0.5) * volatility + trend;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;

    data.push({
      time: (now - (count - i) * 3600) as Time,
      open,
      high,
      low,
      close,
    });
    price = close;
  }
  return data;
};

interface OrderBookRowProps {
  price: string;
  size: string;
  total: string;
  type: 'bid' | 'ask';
}

type ChartType = 'candle' | 'bar' | 'area' | 'line';
type DrawingTool = 'cursor' | 'line' | 'hline' | 'trendline' | 'fib' | 'arrow' | 'text' | 'rect' | 'circle' | null;

const chartTypeConfig: { type: ChartType; label: string }[] = [
  { type: 'candle', label: 'Candles' },
  { type: 'bar', label: 'Bars' },
  { type: 'area', label: 'Area' },
  { type: 'line', label: 'Line' },
];

const drawingTools: { tool: DrawingTool; icon: React.ElementType; label: string }[] = [
  { tool: 'cursor', icon: MousePointer, label: 'Cursor' },
  { tool: 'line', icon: Minus, label: 'Line' },
  { tool: 'hline', icon: MoveHorizontal, label: 'Horizontal Line' },
  { tool: 'trendline', icon: TrendingUp, label: 'Trend Line' },
  { tool: 'fib', icon: GitBranch, label: 'Fibonacci' },
  { tool: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { tool: 'rect', icon: Square, label: 'Rectangle' },
  { tool: 'circle', icon: Circle, label: 'Circle' },
  { tool: 'text', icon: Type, label: 'Text' },
];

interface OrderBookRowPropsExtended extends OrderBookRowProps {
  depth: number; // 0-100 percentage for the background bar
}

const OrderBookRow: React.FC<OrderBookRowPropsExtended> = ({ price, size, total, type, depth }) => (
  <div className="relative grid grid-cols-3 text-[10px] py-0.5 hover:bg-white/10 cursor-pointer font-mono">
    {/* Depth bar background - green for both sides */}
    <div
      className={`absolute top-0 bottom-0 ${type === 'bid' ? 'left-0' : 'right-0'} bg-emerald-600/10`}
      style={{ width: `${depth}%` }}
    />
    <span className={`relative z-10 ${type === 'bid' ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>{price}</span>
    <span className="relative z-10 text-gray-400 text-right">{size}</span>
    <span className={`relative z-10 text-right ${type === 'bid' ? 'text-emerald-500/50' : 'text-rose-500/50'}`}>{total}</span>
  </div>
);

// Generate static order book data
const generateOrderBookData = () => {
  const asks: { price: number; size: number; total: number }[] = [];
  const bids: { price: number; size: number; total: number }[] = [];

  let askTotal = 0;
  let bidTotal = 0;

  for (let i = 0; i < 12; i++) {
    const askSize = Math.floor(Math.random() * 500 + 50);
    askTotal += askSize;
    asks.push({
      price: 98.50 + i * 0.01,
      size: askSize,
      total: askTotal,
    });

    const bidSize = Math.floor(Math.random() * 500 + 50);
    bidTotal += bidSize;
    bids.push({
      price: 98.45 - i * 0.01,
      size: bidSize,
      total: bidTotal,
    });
  }

  return { asks, bids, maxTotal: Math.max(askTotal, bidTotal) };
};

const orderBookData = generateOrderBookData();

type HistoryTab = 'open' | 'orderHistory' | 'tradeHistory';

// Mock data for open orders
const openOrdersData = [
  { id: '1', time: '14:02:22', pair: 'TBILLS/USDC', type: 'Limit (ZK)', side: 'buy' as const, price: '98.40', amount: '50,000', status: 'open' as const },
  { id: '2', time: '10:15:00', pair: 'PAXG/USDC', type: 'Limit (ZK)', side: 'sell' as const, price: '2,045.50', amount: '10.5', status: 'open' as const },
];

// Mock data for order history
const orderHistoryData = [
  { id: '3', time: '09:45:12', pair: 'TBILLS/USDC', type: 'Limit (ZK)', side: 'buy' as const, price: '98.35', amount: '25,000', status: 'filled' as const },
  { id: '4', time: '09:30:00', pair: 'TBILLS/USDC', type: 'Market', side: 'sell' as const, price: '98.42', amount: '15,000', status: 'filled' as const },
  { id: '5', time: 'Yesterday', pair: 'PAXG/USDC', type: 'Limit (ZK)', side: 'buy' as const, price: '2,038.00', amount: '5.2', status: 'cancelled' as const },
  { id: '6', time: 'Yesterday', pair: 'TBILLS/USDC', type: 'Limit (ZK)', side: 'buy' as const, price: '98.20', amount: '100,000', status: 'filled' as const },
];

// Mock data for trade history
const tradeHistoryData = [
  { id: 't1', time: '09:45:12', pair: 'TBILLS/USDC', side: 'buy' as const, price: '98.35', amount: '25,000', fee: '12.50' },
  { id: 't2', time: '09:30:00', pair: 'TBILLS/USDC', side: 'sell' as const, price: '98.42', amount: '15,000', fee: '7.50' },
  { id: 't3', time: 'Yesterday', pair: 'PAXG/USDC', side: 'buy' as const, price: '2,041.20', amount: '3.0', fee: '3.06' },
  { id: 't4', time: 'Yesterday', pair: 'TBILLS/USDC', side: 'buy' as const, price: '98.20', amount: '100,000', fee: '49.10' },
  { id: 't5', time: '2 days ago', pair: 'TBILLS/USDC', side: 'sell' as const, price: '98.55', amount: '50,000', fee: '24.64' },
];

const Trade: React.FC = () => {
  const [selectedAsset] = useState('TBILLS');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [timeframe, setTimeframe] = useState('1H');
  const [chartType, setChartType] = useState<ChartType>('candle');
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('cursor');
  const [drawings, setDrawings] = useState<{ id: string; type: DrawingTool; x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState('98.45');
  const [amount, setAmount] = useState('');
  const [chartView, setChartView] = useState<'price' | 'depth'>('price');
  const [historyTab, setHistoryTab] = useState<HistoryTab>('open');
  const [showSettings, setShowSettings] = useState(false);

  const drawingCanvasRef = useRef<SVGSVGElement>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const candleDataRef = useRef<CandlestickData<Time>[]>(generateCandleData(100));

  // Initialize and update chart when type changes
  useEffect(() => {
    // Don't create chart if in depth view
    if (chartView !== 'price' || !chartContainerRef.current) return;

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.03)' },
        horzLines: { color: 'rgba(255,255,255,0.03)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(99, 102, 241, 0.4)',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: 'rgba(99, 102, 241, 0.4)',
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const data = candleDataRef.current;

    // Create series based on chart type
    if (chartType === 'candle') {
      const series = chart.addCandlestickSeries({
        upColor: 'rgba(52, 211, 153, 0.8)',
        downColor: 'rgba(251, 113, 133, 0.8)',
        borderUpColor: 'rgba(52, 211, 153, 0.9)',
        borderDownColor: 'rgba(251, 113, 133, 0.9)',
        wickUpColor: 'rgba(52, 211, 153, 0.6)',
        wickDownColor: 'rgba(251, 113, 133, 0.6)',
      });
      series.setData(data);
      seriesRef.current = series;
    } else if (chartType === 'bar') {
      const series = chart.addBarSeries({
        upColor: 'rgba(52, 211, 153, 0.8)',
        downColor: 'rgba(251, 113, 133, 0.8)',
      });
      series.setData(data);
      seriesRef.current = series;
    } else if (chartType === 'line') {
      const series = chart.addLineSeries({
        color: '#6366f1',
        lineWidth: 2,
      });
      series.setData(data.map(d => ({ time: d.time, value: d.close })));
      seriesRef.current = series;
    } else if (chartType === 'area') {
      const series = chart.addAreaSeries({
        topColor: 'rgba(99, 102, 241, 0.4)',
        bottomColor: 'rgba(99, 102, 241, 0.0)',
        lineColor: '#6366f1',
        lineWidth: 2,
      });
      series.setData(data.map(d => ({ time: d.time, value: d.close })));
      seriesRef.current = series;
    }

    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Update price display
    if (data.length > 0) {
      setPriceDisplay(data[data.length - 1].close.toFixed(2));
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartType, chartView]);

  // Real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!seriesRef.current || !candleDataRef.current.length) return;

      const lastCandle = candleDataRef.current[candleDataRef.current.length - 1];
      const change = (Math.random() - 0.5) * 0.1;
      const newClose = lastCandle.close + change;

      const updatedCandle: CandlestickData<Time> = {
        ...lastCandle,
        close: newClose,
        high: Math.max(lastCandle.high, newClose),
        low: Math.min(lastCandle.low, newClose),
      };

      candleDataRef.current[candleDataRef.current.length - 1] = updatedCandle;

      try {
        if (chartType === 'candle' || chartType === 'bar') {
          seriesRef.current.update(updatedCandle);
        } else {
          seriesRef.current.update({
            time: updatedCandle.time,
            value: updatedCandle.close,
          });
        }
      } catch (e) {
        // Ignore update errors during chart type switch
      }

      setPriceDisplay(newClose.toFixed(2));
    }, 1000);

    return () => clearInterval(interval);
  }, [chartType]);

  const clearAllDrawings = () => {
    setDrawings([]);
  };

  // Drawing handlers
  const handleDrawingMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (selectedTool === 'cursor' || !drawingCanvasRef.current) return;

    const rect = drawingCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentDrawing({ x1: x, y1: y, x2: x, y2: y });
    setIsDrawing(true);
  };

  const handleDrawingMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !currentDrawing || !drawingCanvasRef.current) return;

    const rect = drawingCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentDrawing({
      ...currentDrawing,
      x2: selectedTool === 'hline' ? rect.width : x,
      y2: selectedTool === 'hline' ? currentDrawing.y1 : y,
    });
  };

  const handleDrawingMouseUp = () => {
    if (currentDrawing && isDrawing) {
      setDrawings(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: selectedTool,
          ...currentDrawing,
        },
      ]);
      setCurrentDrawing(null);
      setIsDrawing(false);
    }
  };

  const renderDrawingShape = (d: { type: DrawingTool; x1: number; y1: number; x2: number; y2: number }, key: string) => {
    const strokeColor = '#6366f1';
    switch (d.type) {
      case 'line':
      case 'hline':
        return <line key={key} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke={strokeColor} strokeWidth={2} strokeDasharray={d.type === 'hline' ? '5,5' : undefined} />;
      case 'trendline':
        return <line key={key} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke={strokeColor} strokeWidth={2} />;
      case 'arrow':
        const angle = Math.atan2(d.y2 - d.y1, d.x2 - d.x1);
        const arrowSize = 10;
        return (
          <g key={key}>
            <line x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke={strokeColor} strokeWidth={2} />
            <polygon
              points={`${d.x2},${d.y2} ${d.x2 - arrowSize * Math.cos(angle - Math.PI / 6)},${d.y2 - arrowSize * Math.sin(angle - Math.PI / 6)} ${d.x2 - arrowSize * Math.cos(angle + Math.PI / 6)},${d.y2 - arrowSize * Math.sin(angle + Math.PI / 6)}`}
              fill={strokeColor}
            />
          </g>
        );
      case 'rect':
        return <rect key={key} x={Math.min(d.x1, d.x2)} y={Math.min(d.y1, d.y2)} width={Math.abs(d.x2 - d.x1)} height={Math.abs(d.y2 - d.y1)} stroke={strokeColor} strokeWidth={2} fill="transparent" />;
      case 'circle':
        const radius = Math.sqrt(Math.pow(d.x2 - d.x1, 2) + Math.pow(d.y2 - d.y1, 2));
        return <circle key={key} cx={d.x1} cy={d.y1} r={radius} stroke={strokeColor} strokeWidth={2} fill="transparent" />;
      case 'fib':
        const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
        const height = d.y2 - d.y1;
        return (
          <g key={key}>
            {fibLevels.map((level, i) => (
              <g key={i}>
                <line x1={d.x1} y1={d.y1 + height * level} x2={d.x2} y2={d.y1 + height * level} stroke={strokeColor} strokeWidth={1} strokeDasharray="3,3" opacity={0.5 + level * 0.3} />
                <text x={d.x1 + 5} y={d.y1 + height * level - 3} fill={strokeColor} fontSize={10}>{(level * 100).toFixed(1)}%</text>
              </g>
            ))}
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-2 px-2 md:px-6 pb-2 animate-fade-in-up overflow-hidden">

      {/* --- Terminal Header --- */}
      <div className="flex flex-wrap items-center justify-between mb-2 gap-3 p-3 bg-zinc-900/50 backdrop-blur-md border border-white/5 shrink-0">

        {/* Asset Info */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="flex items-center gap-2 text-xl font-oswald font-bold text-white hover:text-brand-stellar transition-colors">
              {selectedAsset} / USDC <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <div>
            <span className="text-2xl font-mono text-white font-medium">${priceDisplay}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">24h Change</span>
            <span className="text-xs font-mono text-green-400 flex items-center">
              +1.2% <ArrowUpRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <div className="flex-col hidden md:flex">
             <span className="text-[10px] text-gray-500 uppercase tracking-wider">24h Volume</span>
             <span className="text-xs font-mono text-white">$42,102,932</span>
          </div>
        </div>

        {/* Chart Type + Timeframe Selector */}
        <div className="flex items-center gap-2">
          {/* Chart Type Selector */}
          <div className="flex bg-black/40 p-1 border border-white/5">
            {chartTypeConfig.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-1 text-[10px] font-bold hover:bg-white/10 transition-all ${chartType === type ? 'bg-white/10 text-brand-stellar' : 'text-gray-500'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Timeframe Selector */}
          <div className="flex bg-black/40 p-1 border border-white/5">
            {['15m', '1H', '4H', '1D', '1W'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-[10px] font-bold hover:bg-white/10 transition-all ${timeframe === tf ? 'bg-white/10 text-brand-stellar' : 'text-gray-500'}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* --- Main Grid Layout --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-3 flex-1 min-h-0 overflow-hidden">

        {/* --- LEFT: Chart Area (Span 3) --- */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-3 min-h-0 overflow-hidden">

          {/* Chart Container */}
          <div className="flex-1 bg-zinc-900/50 backdrop-blur-sm border border-white/5 relative overflow-hidden flex flex-col min-h-0">
            {/* Chart Header */}
            <div className="p-3 border-b border-white/5 flex justify-between items-center shrink-0">
               <div className="flex gap-4">
                  <button
                    onClick={() => setChartView('price')}
                    className={`flex items-center gap-1 text-xs transition-colors ${chartView === 'price' ? 'text-brand-stellar' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <BarChart2 className="w-3 h-3" /> Price Action
                  </button>
                  <button
                    onClick={() => setChartView('depth')}
                    className={`flex items-center gap-1 text-xs transition-colors ${chartView === 'depth' ? 'text-brand-stellar' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <Activity className="w-3 h-3" /> Depth
                  </button>
               </div>
               <div className="flex gap-2 items-center">
                  {drawings.length > 0 && (
                    <span className="text-[10px] text-gray-500 mr-2">{drawings.length} drawing{drawings.length > 1 ? 's' : ''}</span>
                  )}
                  <button onClick={() => setShowSettings(true)} className="p-1 hover:bg-white/5"><Settings className="w-3 h-3 text-gray-500 hover:text-white transition-colors" /></button>
               </div>
            </div>

            {/* Chart Area with Drawing Tools */}
            <div className="flex-1 flex flex-row" style={{ minHeight: 0 }}>
              {/* Drawing Tools Sidebar - LEFT */}
              <div className="w-10 bg-black/40 border-r border-white/5 flex flex-col py-2 shrink-0 overflow-y-auto">
                {drawingTools.map(({ tool, icon: Icon, label }) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    className={`p-2 hover:bg-white/10 transition-all relative group shrink-0 ${selectedTool === tool ? 'bg-white/10 text-brand-stellar' : 'text-gray-500 hover:text-gray-300'}`}
                    title={label}
                  >
                    <Icon className="w-4 h-4 mx-auto" />
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black border border-white/10 px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                      {label}
                    </div>
                  </button>
                ))}
                <div className="h-px bg-white/10 my-2 mx-2 shrink-0"></div>
                <button
                  onClick={clearAllDrawings}
                  className={`p-2 hover:bg-red-500/20 transition-all text-gray-500 hover:text-red-400 relative group shrink-0 ${drawings.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Clear All Drawings"
                  disabled={drawings.length === 0}
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black border border-white/10 px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                    Clear All
                  </div>
                </button>
              </div>

              {/* Main Chart Area */}
              {chartView === 'price' ? (
                <div className="flex-1 relative" style={{ minHeight: '300px' }}>
                  <div ref={chartContainerRef} className="absolute inset-0" />
                  {/* Drawing Canvas Overlay */}
                  <svg
                    ref={drawingCanvasRef}
                    className="absolute inset-0 z-10"
                    width="100%"
                    height="100%"
                    style={{ cursor: selectedTool !== 'cursor' ? 'crosshair' : 'default', pointerEvents: selectedTool === 'cursor' ? 'none' : 'auto' }}
                    onMouseDown={handleDrawingMouseDown}
                    onMouseMove={handleDrawingMouseMove}
                    onMouseUp={handleDrawingMouseUp}
                    onMouseLeave={handleDrawingMouseUp}
                  >
                    {/* Render saved drawings */}
                    {drawings.map((d) => renderDrawingShape(d, d.id))}
                    {/* Render current drawing */}
                    {currentDrawing && renderDrawingShape({ type: selectedTool, ...currentDrawing }, 'current')}
                  </svg>
                </div>
              ) : (
                <div className="flex-1 flex items-end justify-center p-4 gap-0.5" style={{ minHeight: '300px' }}>
                  <div className="flex items-end gap-0.5 flex-row-reverse h-full">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const height = 30 + Math.random() * 50 + (20 - i) * 3;
                      return (
                        <div
                          key={`bid-${i}`}
                          className="w-3 bg-emerald-600/30 hover:bg-emerald-500/50 transition-colors cursor-pointer"
                          style={{ height: `${height}%` }}
                          title={`Bid: $${(98.45 - i * 0.02).toFixed(2)} | Size: ${(Math.random() * 10000).toFixed(0)}`}
                        />
                      );
                    })}
                  </div>
                  <div className="w-px h-full bg-white/20 mx-2" />
                  <div className="flex items-end gap-0.5 h-full">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const height = 30 + Math.random() * 50 + (20 - i) * 3;
                      return (
                        <div
                          key={`ask-${i}`}
                          className="w-3 bg-rose-600/30 hover:bg-rose-500/50 transition-colors cursor-pointer"
                          style={{ height: `${height}%` }}
                          title={`Ask: $${(98.45 + i * 0.02).toFixed(2)} | Size: ${(Math.random() * 10000).toFixed(0)}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Drawing mode indicator */}
            {selectedTool !== 'cursor' && (
              <div className="absolute bottom-4 left-14 bg-brand-stellar/20 border border-brand-stellar/40 px-2 py-1 text-[10px] text-brand-stellar z-10">
                Drawing: {drawingTools.find(t => t.tool === selectedTool)?.label}
              </div>
            )}
          </div>

          {/* History / Open Orders Table */}
          <div className="h-48 shrink-0 bg-zinc-900/50 backdrop-blur-sm border border-white/5 overflow-hidden flex flex-col">
             <div className="flex items-center gap-6 px-4 py-3 border-b border-white/5">
                <button
                  onClick={() => setHistoryTab('open')}
                  className={`text-xs font-medium pb-3 -mb-3.5 transition-colors ${historyTab === 'open' ? 'text-white font-bold border-b-2 border-brand-stellar' : 'text-gray-500 hover:text-white'}`}
                >
                  Open Orders ({openOrdersData.length})
                </button>
                <button
                  onClick={() => setHistoryTab('orderHistory')}
                  className={`text-xs font-medium pb-3 -mb-3.5 transition-colors ${historyTab === 'orderHistory' ? 'text-white font-bold border-b-2 border-brand-stellar' : 'text-gray-500 hover:text-white'}`}
                >
                  Order History
                </button>
                <button
                  onClick={() => setHistoryTab('tradeHistory')}
                  className={`text-xs font-medium pb-3 -mb-3.5 transition-colors ${historyTab === 'tradeHistory' ? 'text-white font-bold border-b-2 border-brand-stellar' : 'text-gray-500 hover:text-white'}`}
                >
                  Trade History
                </button>
             </div>

             <div className="flex-1 overflow-auto">
                {historyTab === 'tradeHistory' ? (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Time</th>
                        <th className="px-4 py-2 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Pair</th>
                        <th className="px-4 py-2 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Side</th>
                        <th className="px-4 py-2 text-[10px] text-gray-500 uppercase font-normal tracking-wider text-right">Price</th>
                        <th className="px-4 py-2 text-[10px] text-gray-500 uppercase font-normal tracking-wider text-right">Amount</th>
                        <th className="px-4 py-2 text-[10px] text-gray-500 uppercase font-normal tracking-wider text-right">Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-mono text-gray-300">
                      {tradeHistoryData.map(trade => (
                        <tr key={trade.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-gray-500">{trade.time}</td>
                          <td className="px-4 py-3 font-bold text-white">{trade.pair}</td>
                          <td className={`px-4 py-3 ${trade.side === 'buy' ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                            {trade.side === 'buy' ? 'Buy' : 'Sell'}
                          </td>
                          <td className="px-4 py-3 text-right">{trade.price}</td>
                          <td className="px-4 py-3 text-right">{trade.amount}</td>
                          <td className="px-4 py-3 text-right text-gray-500">${trade.fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Time</th>
                        <th className="px-4 py-2 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Pair</th>
                        <th className="px-4 py-2 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Type</th>
                        <th className="px-4 py-2 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Side</th>
                        <th className="px-4 py-2 text-[10px] text-gray-500 uppercase font-normal tracking-wider text-right">Price</th>
                        <th className="px-4 py-2 text-[10px] text-gray-500 uppercase font-normal tracking-wider text-right">Amount</th>
                        <th className="px-4 py-2 text-[10px] text-gray-500 uppercase font-normal tracking-wider text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-mono text-gray-300">
                      {(historyTab === 'open' ? openOrdersData : orderHistoryData).map(order => (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-gray-500">{order.time}</td>
                          <td className="px-4 py-3 font-bold text-white">{order.pair}</td>
                          <td className="px-4 py-3 text-brand-stellar">{order.type}</td>
                          <td className={`px-4 py-3 ${order.side === 'buy' ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                            {order.side === 'buy' ? 'Buy' : 'Sell'}
                          </td>
                          <td className="px-4 py-3 text-right">{order.price}</td>
                          <td className="px-4 py-3 text-right">{order.amount}</td>
                          <td className="px-4 py-3 text-right flex justify-end gap-2 items-center">
                            {order.status === 'open' && <span className="w-2 h-2 bg-yellow-500 animate-pulse"></span>}
                            {order.status === 'filled' && <span className="w-2 h-2 bg-emerald-500/70"></span>}
                            {order.status === 'cancelled' && <span className="w-2 h-2 bg-gray-500"></span>}
                            <span className="capitalize">{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
             </div>
          </div>
        </div>


        {/* --- RIGHT COLUMN: OrderBook + Execution --- */}
        <div className="lg:col-span-1 xl:col-span-2 flex flex-col gap-3 min-h-0 overflow-hidden">

           {/* Order Book / Depth */}
           <div className="flex-1 min-h-0 bg-zinc-900/50 backdrop-blur-sm border border-white/5 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Pool Liquidity
                 </span>
                 <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5">0.05% Spread</span>
              </div>

              <div className="flex-1 flex flex-col relative">
                 {/* Header Row */}
                 <div className="grid grid-cols-3 px-4 py-2 text-[10px] text-gray-500 uppercase font-mono border-b border-white/5">
                    <span>Price</span>
                    <span className="text-right">Size</span>
                    <span className="text-right">Total</span>
                 </div>

                 {/* Asks (Red) */}
                 <div className="flex-1 overflow-hidden flex flex-col-reverse px-4 pb-2">
                    {orderBookData.asks.slice(0, 8).map((item, i) => (
                       <OrderBookRow
                         key={i}
                         type="ask"
                         price={item.price.toFixed(2)}
                         size={item.size.toString()}
                         total={item.total.toString()}
                         depth={(item.total / orderBookData.maxTotal) * 100}
                       />
                    ))}
                 </div>

                 {/* Spread Indicator */}
                 <div className="py-2 bg-white/5 border-y border-white/10 flex items-center justify-center gap-2">
                    <span className="text-lg font-mono text-white font-bold">{priceDisplay}</span>
                    <span className="text-xs text-gray-400">≈ ${priceDisplay}</span>
                 </div>

                 {/* Bids (Green) */}
                 <div className="flex-1 overflow-hidden px-4 pt-2">
                    {orderBookData.bids.slice(0, 8).map((item, i) => (
                       <OrderBookRow
                         key={i}
                         type="bid"
                         price={item.price.toFixed(2)}
                         size={item.size.toString()}
                         total={item.total.toString()}
                         depth={(item.total / orderBookData.maxTotal) * 100}
                       />
                    ))}
                 </div>
              </div>
           </div>

           {/* Execution Form */}
           <div className="bg-black border border-white/10 p-3 shadow-2xl relative overflow-hidden shrink-0">
              {/* ZK Background effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-stellar/10 blur-3xl pointer-events-none"></div>

              {/* Tabs */}
              <div className="grid grid-cols-2 gap-1 bg-white/5 p-1 mb-3">
                 <button
                    onClick={() => setOrderSide('buy')}
                    className={`py-2 text-xs font-bold uppercase tracking-wider transition-all ${orderSide === 'buy' ? 'bg-emerald-600/80 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                 >
                    Buy
                 </button>
                 <button
                    onClick={() => setOrderSide('sell')}
                    className={`py-2 text-xs font-bold uppercase tracking-wider transition-all ${orderSide === 'sell' ? 'bg-rose-600/80 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                 >
                    Sell
                 </button>
              </div>

              {/* Order Type */}
              <div className="flex items-center justify-between mb-3">
                 <span className="text-xs text-gray-400">Order Type</span>
                 <button className="text-xs text-brand-stellar font-bold flex items-center gap-1 hover:text-white transition-colors">
                    Limit (ZK) <ChevronDown className="w-3 h-3" />
                 </button>
              </div>

              {/* Inputs */}
              <div className="space-y-2">
                 <div className="bg-white/5 border border-white/10 px-3 py-2">
                    <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-1">
                       <span>Price</span>
                       <span>USDC</span>
                    </div>
                    <input
                       type="text"
                       value={priceDisplay}
                       onChange={(e) => setPriceDisplay(e.target.value)}
                       className="w-full bg-transparent text-white font-mono text-sm focus:outline-none"
                    />
                 </div>
                 <div className="bg-white/5 border border-white/10 px-3 py-2">
                    <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-1">
                       <span>Amount</span>
                       <span>{selectedAsset}</span>
                    </div>
                    <input
                       type="text"
                       value={amount}
                       onChange={(e) => setAmount(e.target.value)}
                       placeholder="0.00"
                       className="w-full bg-transparent text-white font-mono text-sm focus:outline-none"
                    />
                 </div>

                 {/* Slider */}
                 <div className="py-2">
                    <div className="h-1 bg-white/10 w-full relative">
                       <div className="absolute left-0 top-0 h-full w-[40%] bg-brand-stellar"></div>
                       <div className="absolute left-[40%] top-1/2 -translate-y-1/2 w-3 h-3 bg-white shadow cursor-pointer hover:scale-125 transition-transform"></div>
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-gray-600 font-mono">
                       <span>0%</span>
                       <span>50%</span>
                       <span>100%</span>
                    </div>
                 </div>

                 {/* Total */}
                 <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-xs text-gray-400">Total</span>
                    <span className="text-sm font-mono text-white">
                       ${amount ? (parseFloat(amount) * parseFloat(priceDisplay)).toLocaleString() : '0.00'}
                    </span>
                 </div>
              </div>

              {/* Submit Button */}
              <button
                 className={`w-full mt-3 py-3 font-bold text-sm uppercase tracking-wider text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${orderSide === 'buy' ? 'bg-emerald-600/80 hover:bg-emerald-500/80' : 'bg-rose-600/80 hover:bg-rose-500/80'}`}
              >
                 {orderSide} {selectedAsset}
              </button>

              <div className="flex items-center justify-center gap-2 mt-2 opacity-60">
                 <ShieldCheck className="w-3 h-3 text-brand-stellar" />
                 <span className="text-[10px] text-gray-400">Zero-Knowledge Proof Enabled</span>
              </div>

           </div>

        </div>

      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-md mx-4 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand-stellar" /> Chart Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Chart Type */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Chart Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {chartTypeConfig.map(({ type, label }) => (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      className={`py-2 text-xs font-medium transition-all ${chartType === type ? 'bg-brand-stellar text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeframe */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Timeframe</label>
                <div className="grid grid-cols-6 gap-2">
                  {['1m', '5m', '15m', '1H', '4H', '1D'].map(tf => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`py-2 text-xs font-medium transition-all ${timeframe === tf ? 'bg-brand-stellar text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawing Settings */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Drawing Tools</label>
                <div className="flex items-center justify-between py-2 px-3 bg-white/5">
                  <span className="text-xs text-gray-300">Saved Drawings</span>
                  <span className="text-xs font-mono text-brand-stellar">{drawings.length}</span>
                </div>
                {drawings.length > 0 && (
                  <button
                    onClick={() => { clearAllDrawings(); setShowSettings(false); }}
                    className="w-full mt-2 py-2 text-xs font-medium bg-red-700/20 text-red-500 hover:bg-red-700/30 transition-colors"
                  >
                    Clear All Drawings
                  </button>
                )}
              </div>

              {/* Privacy Settings */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Privacy</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 bg-white/5">
                    <span className="text-xs text-gray-300">ZK Proof Enabled</span>
                    <div className="w-8 h-4 bg-brand-stellar/50 relative">
                      <div className="absolute right-0 top-0 w-4 h-4 bg-brand-stellar"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-white/5">
                    <span className="text-xs text-gray-300">Hide Order Amounts</span>
                    <div className="w-8 h-4 bg-white/20 relative">
                      <div className="absolute left-0 top-0 w-4 h-4 bg-gray-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-xs font-medium bg-brand-stellar text-white hover:bg-brand-stellar/80 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trade;
