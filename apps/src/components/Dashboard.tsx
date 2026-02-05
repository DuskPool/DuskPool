import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Wallet, Lock, Activity, Shield, ChevronRight, ExternalLink,
  BarChart3, PieChart, Clock, Zap, Eye, EyeOff, Plus, ArrowRight
} from 'lucide-react';

// Mini sparkline component
const Sparkline: React.FC<{ data: number[]; color: string; positive: boolean }> = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = 20 - ((v - min) / range) * 16;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="60" height="24" className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,20 ${points} 60,20`}
        fill={`url(#spark-${color})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('7D');
  const [hideBalances, setHideBalances] = useState(false);

  // Mock portfolio data
  const portfolioData = [
    { day: 'Mon', value: 52000 },
    { day: 'Tue', value: 54200 },
    { day: 'Wed', value: 53100 },
    { day: 'Thu', value: 56800 },
    { day: 'Fri', value: 55400 },
    { day: 'Sat', value: 58200 },
    { day: 'Sun', value: 62450 },
  ];

  const maxValue = Math.max(...portfolioData.map(d => d.value));
  const minValue = Math.min(...portfolioData.map(d => d.value));

  // Enhanced assets data
  const assets = [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 50240.50,
      price: 1.00,
      change: 0.00,
      color: '#10b981',
      percentage: 45,
      sparkline: [1, 1, 1, 1, 1, 1, 1],
      icon: '$'
    },
    {
      symbol: 'TBILL',
      name: 'US Treasury Bill',
      balance: 14767.50,
      holdings: 150.12,
      price: 98.42,
      change: +0.12,
      color: '#6366f1',
      percentage: 35,
      sparkline: [95, 96, 97, 96.5, 97.5, 98, 98.42],
      icon: 'T'
    },
    {
      symbol: 'PAXG',
      name: 'PAX Gold',
      balance: 5105.25,
      holdings: 2.5,
      price: 2042.10,
      change: -1.24,
      color: '#eab308',
      percentage: 20,
      sparkline: [2050, 2060, 2045, 2055, 2040, 2048, 2042],
      icon: 'Au'
    },
  ];

  const totalValue = 70113.25;
  const dayChange = +2847.50;
  const dayChangePercent = +4.23;

  // Recent activity
  const recentActivity = [
    { id: 1, type: 'buy', asset: 'TBILL', amount: '5,000 USDC', received: '50.8 TBILL', time: '2 min ago', status: 'completed', hash: '0x7a2f...3d1e' },
    { id: 2, type: 'sell', asset: 'PAXG', amount: '0.5 PAXG', received: '1,022.60 USDC', time: '15 min ago', status: 'completed', hash: '0x9c4e...8f2a' },
    { id: 3, type: 'deposit', asset: 'USDC', amount: '10,000 USDC', received: null, time: '1 hr ago', status: 'completed', hash: '0x3b1d...6e9c' },
    { id: 4, type: 'buy', asset: 'TBILL', amount: '2,500 USDC', received: '25.4 TBILL', time: '3 hr ago', status: 'pending', hash: '0x5f8a...2c7b' },
  ];

  // Open orders
  const openOrders = [
    { id: 1, side: 'buy', asset: 'TBILL', amount: 50000, price: 98.40, filled: 35, total: '50,000 USDC' },
    { id: 2, side: 'sell', asset: 'PAXG', amount: 2.5, price: 2050.00, filled: 0, total: '5,125 USDC' },
  ];

  const formatBalance = (value: number) => {
    if (hideBalances) return '••••••';
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="w-full h-full px-4 md:px-6 py-4 animate-fade-in-up overflow-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-condensed font-bold text-white uppercase tracking-wide">Portfolio</h1>
            <button
              onClick={() => setHideBalances(!hideBalances)}
              className="p-1.5 hover:bg-white/10 transition-colors text-gray-500 hover:text-white"
            >
              {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-500">Manage your RWA positions and track performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Synced</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 border border-white/10 bg-white/5">
            <Shield className="w-3 h-3 text-brand-stellar" />
            <span className="text-[10px] text-white/60 uppercase tracking-wider">ZK Protected</span>
          </div>
        </div>
      </div>

      {/* Portfolio Value Hero */}
      <div className="relative mb-6 p-6 bg-gradient-to-br from-zinc-900/80 via-zinc-900/50 to-brand-stellar/5 border border-white/10 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-stellar/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                Total Balance
                <span className="px-1.5 py-0.5 bg-brand-stellar/20 text-brand-stellar text-[8px]">PRIVATE</span>
              </p>
              <div className="flex items-baseline gap-4">
                <h2 className="text-5xl md:text-6xl font-oswald text-white tracking-tight">
                  {hideBalances ? '$••••••' : `$${totalValue.toLocaleString()}`}
                </h2>
                <div className={`flex items-center gap-1.5 px-2 py-1 ${dayChange >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'} border`}>
                  {dayChange >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
                  <span className={`text-sm font-mono ${dayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {dayChange >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {dayChange >= 0 ? '+' : ''}{formatBalance(Math.abs(dayChange)).replace('$', '')} today
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Available</p>
                <p className="text-lg font-mono text-white">{formatBalance(50240.50)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">In Orders</p>
                <p className="text-lg font-mono text-yellow-400">{formatBalance(12210.00)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">24h P&L</p>
                <p className="text-lg font-mono text-emerald-400">+{formatBalance(2847.50).replace('$', '')}</p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500">Performance</span>
              <div className="flex bg-black/40 p-0.5 border border-white/5">
                {['24H', '7D', '30D', 'ALL'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 text-[10px] font-bold transition-all ${
                      timeframe === tf
                        ? 'bg-brand-stellar text-white'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative h-32">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Grid */}
                {[25, 50, 75].map(y => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="white" strokeOpacity="0.03" />
                ))}

                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7d00ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#7d00ff" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path
                  d={`
                    M 0 ${100 - ((portfolioData[0].value - minValue) / (maxValue - minValue)) * 70 - 15}
                    ${portfolioData.map((d, i) => {
                      const x = (i / (portfolioData.length - 1)) * 100;
                      const y = 100 - ((d.value - minValue) / (maxValue - minValue)) * 70 - 15;
                      return `L ${x} ${y}`;
                    }).join(' ')}
                    L 100 100 L 0 100 Z
                  `}
                  fill="url(#portfolioGradient)"
                />

                <path
                  d={`
                    M 0 ${100 - ((portfolioData[0].value - minValue) / (maxValue - minValue)) * 70 - 15}
                    ${portfolioData.map((d, i) => {
                      const x = (i / (portfolioData.length - 1)) * 100;
                      const y = 100 - ((d.value - minValue) / (maxValue - minValue)) * 70 - 15;
                      return `L ${x} ${y}`;
                    }).join(' ')}
                  `}
                  fill="none"
                  stroke="#7d00ff"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-600 font-mono">
                {portfolioData.map((d, i) => (
                  <span key={i}>{d.day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">

        {/* Assets Section */}
        <div className="col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-stellar" /> Your Assets
            </h3>
            <button className="flex items-center gap-1 text-[10px] text-brand-stellar hover:text-white transition-colors uppercase tracking-wider">
              <Plus className="w-3 h-3" /> Add Asset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {assets.map(asset => (
              <div
                key={asset.symbol}
                className="group relative p-4 bg-zinc-900/50 border border-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
                onClick={() => navigate('/trade')}
              >
                {/* Accent line */}
                <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: asset.color, opacity: 0.5 }}></div>

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 flex items-center justify-center text-xs font-bold border"
                      style={{ borderColor: `${asset.color}50`, backgroundColor: `${asset.color}15`, color: asset.color }}
                    >
                      {asset.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{asset.symbol}</p>
                      <p className="text-[10px] text-gray-500">{asset.name}</p>
                    </div>
                  </div>
                  <Sparkline
                    data={asset.sparkline}
                    color={asset.change >= 0 ? '#10b981' : '#f43f5e'}
                    positive={asset.change >= 0}
                  />
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-lg font-mono text-white">{formatBalance(asset.balance)}</p>
                    {asset.holdings && (
                      <p className="text-[10px] text-gray-500 font-mono">{asset.holdings} {asset.symbol}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-mono">${asset.price.toLocaleString()}</p>
                    <p className={`text-[10px] font-mono ${asset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Allocation bar */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                    <span>Portfolio allocation</span>
                    <span>{asset.percentage}%</span>
                  </div>
                  <div className="h-1 bg-white/5 w-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{ width: `${asset.percentage}%`, backgroundColor: asset.color, opacity: 0.7 }}
                    ></div>
                  </div>
                </div>

                {/* Hover arrow */}
                <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-white/0 group-hover:text-white/40 transition-all transform translate-x-2 group-hover:translate-x-0" />
              </div>
            ))}
          </div>

          {/* Open Orders */}
          <div className="mt-4 p-4 bg-zinc-900/50 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-stellar" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Open Orders</h3>
                <span className="px-1.5 py-0.5 bg-brand-stellar/20 text-brand-stellar text-[10px] font-bold">{openOrders.length}</span>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="text-[10px] text-brand-stellar hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {openOrders.length > 0 ? (
              <div className="space-y-2">
                {openOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-black/30 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-1 h-12 ${order.side === 'buy' ? 'bg-emerald-500/70' : 'bg-rose-500/70'}`}></div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold uppercase ${order.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {order.side}
                          </span>
                          <span className="text-sm font-bold text-white">{order.asset}/USDC</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                          <span>{order.amount.toLocaleString()} @ ${order.price}</span>
                          <span className="text-gray-600">|</span>
                          <span>Total: {order.total}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-28">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-gray-500">Filled</span>
                          <span className="text-white font-mono">{order.filled}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 w-full overflow-hidden">
                          <div
                            className="h-full bg-brand-stellar transition-all"
                            style={{ width: `${order.filled}%` }}
                          ></div>
                        </div>
                      </div>
                      <button className="text-[10px] text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:bg-rose-500/10 px-3 py-1.5 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No open orders
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/trade')}
              className="p-4 bg-brand-stellar/20 border border-brand-stellar/30 hover:bg-brand-stellar/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-stellar/0 via-brand-stellar/10 to-brand-stellar/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <BarChart3 className="w-5 h-5 text-brand-stellar mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Trade</span>
              <span className="text-[10px] text-gray-400">Buy & Sell RWAs</span>
            </button>
            <button
              onClick={() => navigate('/escrow')}
              className="p-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <Wallet className="w-5 h-5 text-white/60 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Deposit</span>
              <span className="text-[10px] text-gray-400">Add funds</span>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-zinc-900/50 border border-white/5 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-stellar" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Activity</h3>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="text-[10px] text-gray-500 hover:text-white transition-colors"
              >
                See all
              </button>
            </div>

            <div className="space-y-1">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-white/5 transition-colors group">
                  <div className={`w-8 h-8 flex items-center justify-center border shrink-0 ${
                    activity.type === 'buy' ? 'border-emerald-500/30 bg-emerald-500/10' :
                    activity.type === 'sell' ? 'border-rose-500/30 bg-rose-500/10' :
                    'border-blue-500/30 bg-blue-500/10'
                  }`}>
                    {activity.type === 'buy' && <ArrowDownRight className="w-4 h-4 text-emerald-500" />}
                    {activity.type === 'sell' && <ArrowUpRight className="w-4 h-4 text-rose-500" />}
                    {activity.type === 'deposit' && <Plus className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase ${
                        activity.type === 'buy' ? 'text-emerald-400' :
                        activity.type === 'sell' ? 'text-rose-400' :
                        'text-blue-400'
                      }`}>
                        {activity.type}
                      </span>
                      <span className="text-xs font-bold text-white">{activity.asset}</span>
                      {activity.status === 'pending' && (
                        <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 uppercase">Pending</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                      <span>{activity.amount}</span>
                      {activity.received && (
                        <>
                          <ArrowRight className="w-3 h-3" />
                          <span className="text-gray-400">{activity.received}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-600 block">{activity.time}</span>
                    <button className="text-[10px] text-gray-600 hover:text-brand-stellar opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-zinc-900/50 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] text-gray-500 uppercase">Active</span>
              </div>
              <p className="text-xl font-oswald text-white">{openOrders.length}</p>
              <p className="text-[10px] text-gray-600">Open orders</p>
            </div>
            <div className="p-3 bg-zinc-900/50 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-3 h-3 text-yellow-500" />
                <span className="text-[10px] text-gray-500 uppercase">Locked</span>
              </div>
              <p className="text-xl font-oswald text-white">{formatBalance(12210).replace('$', '')}</p>
              <p className="text-[10px] text-gray-600">In escrow</p>
            </div>
            <div className="p-3 bg-zinc-900/50 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3 h-3 text-brand-stellar" />
                <span className="text-[10px] text-gray-500 uppercase">Volume</span>
              </div>
              <p className="text-xl font-oswald text-white">$47.2K</p>
              <p className="text-[10px] text-gray-600">30-day trading</p>
            </div>
            <div className="p-3 bg-zinc-900/50 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-3 h-3 text-brand-stellar" />
                <span className="text-[10px] text-gray-500 uppercase">Proofs</span>
              </div>
              <p className="text-xl font-oswald text-white">156</p>
              <p className="text-[10px] text-gray-600">ZK verified txns</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
