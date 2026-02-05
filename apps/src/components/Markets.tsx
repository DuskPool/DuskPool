import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, TrendingUp, TrendingDown, Search,
  ArrowRight, Activity, Globe, Lock, Verified,
  ChevronDown, Star, Filter
} from 'lucide-react';

// Sparkline component
const Sparkline: React.FC<{ data: number[]; positive: boolean }> = ({ data, positive }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const color = positive ? '#10b981' : '#f43f5e';

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 80;
    const y = 24 - ((v - min) / range) * 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="80" height="28" className="overflow-visible">
      <defs>
        <linearGradient id={`spark-grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,24 ${points} 80,24`}
        fill={`url(#spark-grad-${positive})`}
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

// Asset data
const assetsData = [
  {
    id: 'tbill',
    symbol: 'TBILL',
    name: 'US Treasury Bill',
    type: 'Security',
    category: 'Treasury',
    price: 98.42,
    change24h: +0.12,
    volume24h: 12500000,
    marketCap: 500000000,
    supply: 5080000,
    issuer: 'treasury.stellar.io',
    contract: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    color: '#6366f1',
    icon: 'T',
    sparkline: [97.8, 98.1, 97.9, 98.2, 98.0, 98.3, 98.42],
    description: 'Tokenized short-term US government debt securities',
    verified: true,
    featured: true,
  },
  {
    id: 'paxg',
    symbol: 'PAXG',
    name: 'PAX Gold',
    type: 'Commodity',
    category: 'Precious Metal',
    price: 2042.10,
    change24h: -1.24,
    volume24h: 8400000,
    marketCap: 84000000,
    supply: 41150,
    issuer: 'paxos.com',
    contract: 'GCQHDR2KSCVNULFX3C2NWFHWOR7XLCFPNPZ6TL7RNPQMXRXLMZC7V7Z',
    color: '#eab308',
    icon: 'Au',
    sparkline: [2050, 2060, 2045, 2055, 2040, 2048, 2042],
    description: 'Each token backed by one fine troy ounce of London Good Delivery gold',
    verified: true,
    featured: true,
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    type: 'Currency',
    category: 'Stablecoin',
    price: 1.00,
    change24h: 0.00,
    volume24h: 45000000,
    marketCap: 24000000000,
    supply: 24000000000,
    issuer: 'circle.com',
    contract: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    color: '#10b981',
    icon: '$',
    sparkline: [1, 1, 1, 1, 1, 1, 1],
    description: 'Fully reserved stablecoin backed 1:1 by US dollars',
    verified: true,
    featured: false,
  },
  {
    id: 'realtoken',
    symbol: 'REALT',
    name: 'RealToken Property',
    type: 'Security',
    category: 'Real Estate',
    price: 52.40,
    change24h: +0.85,
    volume24h: 1200000,
    marketCap: 15000000,
    supply: 286259,
    issuer: 'realt.co',
    contract: 'GBXGQJWVLWOYHFLVTKWV5FGHA3LNYY2JQKM7OAJAUEQFU6LPCSEFVXON',
    color: '#8b5cf6',
    icon: 'R',
    sparkline: [51.2, 51.8, 52.0, 51.5, 52.2, 52.1, 52.4],
    description: 'Fractional ownership in US rental properties',
    verified: true,
    featured: false,
  },
];

const Markets: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'marketCap' | 'volume' | 'change'>('marketCap');

  const categories = ['All', 'Treasury', 'Precious Metal', 'Stablecoin', 'Real Estate'];

  const filteredAssets = assetsData
    .filter(asset => {
      const matchesSearch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === 'All' || asset.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'marketCap') return b.marketCap - a.marketCap;
      if (sortBy === 'volume') return b.volume24h - a.volume24h;
      if (sortBy === 'change') return b.change24h - a.change24h;
      return 0;
    });

  const featuredAssets = assetsData.filter(a => a.featured);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  const totalMarketCap = assetsData.reduce((sum, a) => sum + a.marketCap, 0);
  const totalVolume = assetsData.reduce((sum, a) => sum + a.volume24h, 0);

  return (
    <div className="w-full min-h-screen relative px-4 md:px-6 py-6 overflow-auto">

      {/* Background */}
      <div className="fixed inset-0 bg-black z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-stellar/5 blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] pointer-events-none"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-condensed font-bold text-white uppercase tracking-tight">
                Supported Assets
              </h1>
              <span className="px-2 py-1 bg-brand-stellar/20 text-brand-stellar text-[10px] font-bold uppercase">
                {assetsData.length} Assets
              </span>
            </div>
            <p className="text-sm text-gray-500">Trade tokenized real-world assets with zero-knowledge privacy</p>
          </div>

          {/* Global Stats */}
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Market Cap</p>
              <p className="text-xl font-oswald text-white">{formatNumber(totalMarketCap)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">24h Volume</p>
              <p className="text-xl font-oswald text-emerald-400">{formatNumber(totalVolume)}</p>
            </div>
          </div>
        </div>

        {/* Featured Assets */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-yellow-500" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Featured</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredAssets.map(asset => (
              <div
                key={asset.id}
                className="group relative p-5 bg-gradient-to-br from-zinc-900/80 via-zinc-900/50 to-transparent border border-white/10 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
                onClick={() => navigate('/trade')}
              >
                {/* Accent gradient */}
                <div
                  className="absolute top-0 left-0 w-full h-1 opacity-60"
                  style={{ background: `linear-gradient(90deg, ${asset.color}, transparent)` }}
                ></div>

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 flex items-center justify-center text-lg font-bold border-2"
                      style={{ borderColor: `${asset.color}60`, backgroundColor: `${asset.color}15`, color: asset.color }}
                    >
                      {asset.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white">{asset.symbol}</h3>
                        {asset.verified && <Verified className="w-4 h-4 text-brand-stellar" />}
                      </div>
                      <p className="text-xs text-gray-500">{asset.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-gray-400">{asset.type}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-gray-400">{asset.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-mono text-white">${asset.price.toLocaleString()}</p>
                    <div className={`flex items-center justify-end gap-1 ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span className="text-sm font-mono">{asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Market Cap</p>
                      <p className="text-sm font-mono text-white">{formatNumber(asset.marketCap)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">24h Volume</p>
                      <p className="text-sm font-mono text-white">{formatNumber(asset.volume24h)}</p>
                    </div>
                  </div>
                  <Sparkline data={asset.sparkline} positive={asset.change24h >= 0} />
                </div>

                <p className="mt-3 text-xs text-gray-500 line-clamp-1">{asset.description}</p>

                <ArrowRight className="absolute bottom-5 right-5 w-5 h-5 text-white/0 group-hover:text-white/40 transition-all transform translate-x-2 group-hover:translate-x-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-stellar/50"
            />
          </div>

          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === 'All' ? null : cat)}
                className={`px-3 py-2 text-xs font-medium transition-all ${
                  (cat === 'All' && !selectedCategory) || selectedCategory === cat
                    ? 'bg-brand-stellar text-white'
                    : 'bg-zinc-900/50 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortBy(prev => prev === 'marketCap' ? 'volume' : prev === 'volume' ? 'change' : 'marketCap')}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/20 transition-all"
          >
            <Filter className="w-3 h-3" />
            Sort: {sortBy === 'marketCap' ? 'Market Cap' : sortBy === 'volume' ? 'Volume' : 'Change'}
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Asset Registry Table */}
        <div className="bg-zinc-900/50 border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-stellar" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Asset Registry</h3>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Lock className="w-3 h-3" />
              <span>All trades ZK-protected</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 bg-black/20">
                  <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Asset</th>
                  <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Price</th>
                  <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider">24h Change</th>
                  <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider">7d Chart</th>
                  <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider text-right">Market Cap</th>
                  <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider text-right">Volume (24h)</th>
                  <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Issuer</th>
                  <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAssets.map(asset => (
                  <tr key={asset.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 flex items-center justify-center text-xs font-bold border shrink-0"
                          style={{ borderColor: `${asset.color}50`, backgroundColor: `${asset.color}15`, color: asset.color }}
                        >
                          {asset.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{asset.symbol}</span>
                            {asset.verified && <Verified className="w-3 h-3 text-brand-stellar" />}
                          </div>
                          <span className="text-[10px] text-gray-500">{asset.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono text-white">${asset.price.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`flex items-center gap-1 ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span className="text-xs font-mono">{asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Sparkline data={asset.sparkline} positive={asset.change24h >= 0} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-mono text-white">{formatNumber(asset.marketCap)}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-mono text-gray-400">{formatNumber(asset.volume24h)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-xs text-brand-stellar font-mono">
                        <Globe className="w-3 h-3" />
                        <span>{asset.issuer}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => navigate('/trade')}
                        className="px-3 py-1.5 bg-brand-stellar/20 text-brand-stellar text-[10px] font-bold uppercase hover:bg-brand-stellar/30 transition-colors"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-900/50 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-brand-stellar" />
              <h4 className="text-xs font-bold text-white uppercase">Verified Assets</h4>
            </div>
            <p className="text-[10px] text-gray-500">All listed assets undergo rigorous verification including proof of reserves, regulatory compliance, and smart contract audits.</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-brand-stellar" />
              <h4 className="text-xs font-bold text-white uppercase">ZK Privacy</h4>
            </div>
            <p className="text-[10px] text-gray-500">Every trade is protected by zero-knowledge proofs, ensuring your positions and trading activity remain confidential.</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-brand-stellar" />
              <h4 className="text-xs font-bold text-white uppercase">Real-Time Settlement</h4>
            </div>
            <p className="text-[10px] text-gray-500">Instant atomic settlement on Stellar ensures your trades execute without counterparty risk or settlement delays.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Markets;
