import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import type { Order, Settlement } from '../types';

const History: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'settlements'>('orders');

  // Mock Orders
  const orders: Order[] = [
    { id: 'ord_1', asset: 'TBILL', side: 'buy', amount: 50000, price: 98.40, filled: 0, status: 'open', timestamp: '2023-10-25 14:02', hash: '0x7f...3a' },
    { id: 'ord_2', asset: 'PAXG', side: 'sell', amount: 10, price: 2045.50, filled: 2, status: 'partial', timestamp: '2023-10-25 10:15', hash: '0x2b...9c' },
    { id: 'ord_3', asset: 'USDC', side: 'sell', amount: 10000, price: 1.00, filled: 10000, status: 'filled', timestamp: '2023-10-24 09:30', hash: '0x1c...4d' },
    { id: 'ord_4', asset: 'TBILL', side: 'buy', amount: 25000, price: 98.35, filled: 0, status: 'cancelled', timestamp: '2023-10-23 16:45', hash: '0x8e...1f' },
  ];

  // Mock Settlements
  const settlements: Settlement[] = [
    { id: 'set_1', asset: 'USDC', side: 'sell', amount: 10000, price: 1.00, timestamp: '2023-10-24 09:35', txHash: '0xabcd...ef12' },
    { id: 'set_2', asset: 'PAXG', side: 'sell', amount: 2, price: 2042.00, timestamp: '2023-10-25 11:20', txHash: '0xbcde...f023' },
  ];

  const StatusBadge = ({ status }: { status: Order['status'] }) => {
    switch (status) {
      case 'open': return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 text-[10px] uppercase font-bold border border-blue-500/30">Open</span>;
      case 'partial': return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 text-[10px] uppercase font-bold border border-yellow-500/30">Partial</span>;
      case 'filled': return <span className="bg-green-500/20 text-green-400 px-2 py-1 text-[10px] uppercase font-bold border border-green-500/30">Filled</span>;
      case 'cancelled': return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 text-[10px] uppercase font-bold border border-gray-500/30">Cancelled</span>;
    }
  };

  return (
    <div className="w-full h-full px-6 md:px-12 py-4 animate-fade-in-up overflow-auto">

      <div className="max-w-7xl mx-auto">

        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
           <div>
              <h2 className="text-3xl font-condensed font-bold text-white uppercase mb-1">Trade History</h2>
              <p className="text-gray-400 text-sm">Review your ZK-proof orders and on-chain settlements.</p>
           </div>

           <div className="flex bg-zinc-900/50 p-1 border border-white/10">
              <button
                 onClick={() => setActiveTab('orders')}
                 className={`px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'orders' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
              >
                 Orders
              </button>
              <button
                 onClick={() => setActiveTab('settlements')}
                 className={`px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'settlements' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
              >
                 Settlements
              </button>
           </div>
        </div>

        {/* Filters Bar */}
        <div className="glass-panel p-4 border border-white/5 mb-6 flex items-center gap-4">
           <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search Asset or ID..." className="w-full bg-black/40 border border-white/10 pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/30" />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 text-sm text-gray-400 hover:text-white transition-colors">
              <Filter className="w-4 h-4" /> Filter
           </button>
        </div>

        {/* Content Table */}
        <div className="glass-panel border border-white/5 overflow-hidden">

           {activeTab === 'orders' ? (
              <table className="w-full text-left">
                 <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider">Order ID / Hash</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider">Date</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider">Pair</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider">Side</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider text-right">Price</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider text-right">Amount</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider text-right">Filled</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider text-center">Status</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                       <tr key={order.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                             <div className="font-mono text-xs text-white">#{order.id}</div>
                             <div className="font-mono text-[10px] text-gray-600">Commit: {order.hash}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-400 font-mono">{order.timestamp}</td>
                          <td className="px-6 py-4 text-sm font-bold text-white">{order.asset}/USDC</td>
                          <td className={`px-6 py-4 text-xs font-bold uppercase ${order.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>{order.side}</td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-300 text-right">${order.price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm font-mono text-white text-right">{order.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-400 text-right">{order.filled.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center"><StatusBadge status={order.status} /></td>
                          <td className="px-6 py-4 text-right">
                             {order.status === 'open' || order.status === 'partial' ? (
                                <button className="text-xs text-red-500 hover:text-red-400 border border-red-500/30 hover:bg-red-500/10 px-3 py-1 transition-colors">Cancel</button>
                             ) : (
                                <span className="text-gray-600">-</span>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           ) : (
              <table className="w-full text-left">
                 <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider">Settlement ID</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider">Time</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider">Pair</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider">Side</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider text-right">Price</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider text-right">Amount</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider text-right">Total Value</th>
                       <th className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider text-right">Tx Hash</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {settlements.map((set) => (
                       <tr key={set.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-white">#{set.id}</td>
                          <td className="px-6 py-4 text-xs text-gray-400 font-mono">{set.timestamp}</td>
                          <td className="px-6 py-4 text-sm font-bold text-white">{set.asset}/USDC</td>
                          <td className={`px-6 py-4 text-xs font-bold uppercase ${set.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>{set.side}</td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-300 text-right">${set.price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm font-mono text-white text-right">{set.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm font-mono text-white text-right">${(set.amount * set.price).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                             <a href="#" className="text-xs text-brand-stellar hover:underline font-mono">{set.txHash}</a>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           )}

        </div>

      </div>
    </div>
  );
};

export default History;
