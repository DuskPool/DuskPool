import React, { useState } from 'react';
import { ArrowDownUp, Shield, Lock, Unlock, ChevronDown, Zap, AlertTriangle, ArrowDownRight, ArrowUpRight, Clock, CheckCircle, Loader } from 'lucide-react';

const Escrow: React.FC = () => {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [showAssetSelect, setShowAssetSelect] = useState(false);

  const assets = [
    { symbol: 'USDC', name: 'USD Coin', balance: 50240.50, escrow: 12000.00, price: 1.00, color: '#22c55e' },
    { symbol: 'TBILL', name: 'US Treasury', balance: 150.00, escrow: 50.00, price: 98.45, color: '#3b82f6' },
    { symbol: 'PAXG', name: 'PAX Gold', balance: 2.50, escrow: 1.00, price: 2042.10, color: '#eab308' },
  ];

  const transactions = [
    { id: 1, type: 'deposit', asset: 'USDC', amount: 10000, timestamp: '2 hours ago', status: 'completed', txHash: '0x7a3b...4f2e' },
    { id: 2, type: 'withdraw', asset: 'PAXG', amount: 0.5, timestamp: '5 hours ago', status: 'completed', txHash: '0x9c1d...8a3f' },
    { id: 3, type: 'deposit', asset: 'TBILL', amount: 50, timestamp: '1 day ago', status: 'pending', txHash: '0x2e4f...1b7c' },
  ];

  const currentAsset = assets.find(a => a.symbol === selectedAsset) || assets[0];
  const maxAmount = mode === 'deposit' ? currentAsset.balance : currentAsset.escrow;
  const usdValue = parseFloat(amount || '0') * currentAsset.price;

  const handleMax = () => {
    setAmount(maxAmount.toString());
  };

  const toggleMode = () => {
    setMode(mode === 'deposit' ? 'withdraw' : 'deposit');
    setAmount('');
  };

  return (
    <div className="w-full h-full px-6 py-4 animate-fade-in-up overflow-hidden flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl">

        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-condensed font-bold text-white uppercase tracking-wide pr-37">Escrow Management</h1>
          <p className="text-xs text-gray-500 mt-1 pr-37">Deposit and withdraw assets from ZK-protected escrow</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Card - Deposit/Withdraw */}
          <div className="relative">
            {/* Accent Border */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-stellar via-brand-stellar/50 to-transparent"></div>

            <div className="bg-zinc-900/60 border border-white/5 ml-[2px]">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 border border-brand-stellar/30 bg-brand-stellar/10 flex items-center justify-center">
                  {mode === 'deposit' ? <Lock className="w-4 h-4 text-brand-stellar" /> : <Unlock className="w-4 h-4 text-brand-stellar" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {mode === 'deposit' ? 'Deposit' : 'Withdraw'}
                  </h2>
                  <p className="text-[10px] text-gray-500">
                    {mode === 'deposit' ? 'Lock funds in escrow' : 'Unlock available balance'}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-5">

                {/* Asset Selector */}
                <div className="relative">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">Select Asset</label>
                  <div
                    onClick={() => setShowAssetSelect(!showAssetSelect)}
                    className="flex items-center justify-between p-4 bg-black/30 border border-white/5 cursor-pointer hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center border border-white/10"
                        style={{ backgroundColor: `${currentAsset.color}15` }}
                      >
                        <span className="text-sm font-bold" style={{ color: currentAsset.color }}>
                          {currentAsset.symbol[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-bold">{currentAsset.symbol}</p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          {mode === 'deposit' ? 'Wallet' : 'Escrow'}: {maxAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showAssetSelect ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown */}
                  {showAssetSelect && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 z-10">
                      {assets.map(asset => (
                        <div
                          key={asset.symbol}
                          onClick={() => { setSelectedAsset(asset.symbol); setShowAssetSelect(false); setAmount(''); }}
                          className={`flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors ${
                            asset.symbol === selectedAsset ? 'bg-brand-stellar/10' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 flex items-center justify-center border border-white/10"
                              style={{ backgroundColor: `${asset.color}15` }}
                            >
                              <span className="text-xs font-bold" style={{ color: asset.color }}>{asset.symbol[0]}</span>
                            </div>
                            <div>
                              <p className="text-sm text-white font-bold">{asset.symbol}</p>
                              <p className="text-[10px] text-gray-500">{asset.name}</p>
                            </div>
                          </div>
                          <p className="text-xs text-white font-mono">{(mode === 'deposit' ? asset.balance : asset.escrow).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amount Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider">Amount</label>
                    <button
                      onClick={handleMax}
                      className="text-[10px] font-bold text-brand-stellar hover:text-white transition-colors uppercase tracking-wider"
                    >
                      Max
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                          setAmount(val);
                        }
                      }}
                      placeholder="0.00"
                      className="w-full bg-black/30 border border-white/5 px-4 py-4 text-white font-mono text-xl focus:outline-none focus:border-brand-stellar/30 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">{currentAsset.symbol}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1.5 text-right font-mono">
                    ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex justify-center py-1">
                  <button
                    onClick={toggleMode}
                    className="w-10 h-10 bg-zinc-800/80 border border-white/10 flex items-center justify-center hover:border-brand-stellar/30 hover:bg-brand-stellar/5 transition-all group"
                  >
                    <ArrowDownUp className="w-4 h-4 text-gray-500 group-hover:text-brand-stellar transition-colors" />
                  </button>
                </div>

                {/* Destination */}
                <div className="p-4 bg-black/30 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center border border-white/10 bg-brand-stellar/10">
                        {mode === 'deposit' ? <Lock className="w-4 h-4 text-brand-stellar" /> : <Unlock className="w-4 h-4 text-brand-stellar" />}
                      </div>
                      <div>
                        <p className="text-white font-bold">{mode === 'deposit' ? 'Escrow Vault' : 'Your Wallet'}</p>
                        <p className="text-[10px] text-gray-500">
                          {mode === 'deposit' ? 'ZK-protected' : 'External'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-oswald text-white">{amount || '0'}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="flex justify-between text-xs py-2">
                  <span className="text-gray-600">Network Fee</span>
                  <span className="text-gray-400 font-mono">~0.00001 XLM</span>
                </div>

                {/* Warning for Withdraw */}
                {mode === 'withdraw' && parseFloat(amount) > 0 && (
                  <div className="flex gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <p className="text-[10px] text-yellow-200/80 leading-relaxed">
                      Requires ZK-proof of non-inclusion in pending orders.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount}
                  className={`w-full py-4 font-bold uppercase tracking-widest text-sm transition-all ${
                    amount && parseFloat(amount) > 0 && parseFloat(amount) <= maxAmount
                      ? 'bg-brand-stellar hover:bg-brand-stellar/80 text-white shadow-[0_0_30px_rgba(125,0,255,0.2)]'
                      : 'bg-white/5 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {mode === 'deposit' ? 'Deposit' : 'Withdraw'}
                </button>

                {/* Security Footer */}
                <div className="flex items-center justify-center gap-2 opacity-30">
                  <Shield className="w-3 h-3" />
                  <span className="text-[9px] uppercase tracking-wider">Protocol 25 Secured</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card - Transaction History */}
          <div className="relative">
            {/* Accent Border */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-stellar via-brand-stellar/50 to-transparent"></div>

            <div className="bg-zinc-900/60 border border-white/5 ml-[2px] h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-stellar" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">Transaction History</h3>
                </div>
                <span className="text-[10px] text-gray-600">12 total</span>
              </div>

              {/* Transaction List - Only 3 */}
              <div className="flex-1">
                {transactions.map(tx => (
                  <div key={tx.id} className="px-6 py-4 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 flex items-center justify-center border ${
                        tx.type === 'deposit'
                          ? 'border-green-500/30 bg-green-500/10'
                          : 'border-red-500/30 bg-red-500/10'
                      }`}>
                        {tx.type === 'deposit'
                          ? <ArrowDownRight className="w-5 h-5 text-green-500" />
                          : <ArrowUpRight className="w-5 h-5 text-red-500" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase ${
                            tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {tx.type}
                          </span>
                          <span className="text-sm font-bold text-white">{tx.asset}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-600 font-mono">{tx.txHash}</span>
                          <span className="text-[10px] text-gray-700">•</span>
                          <span className="text-[10px] text-gray-600">{tx.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-white">
                        {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        {tx.status === 'completed' ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-[10px] text-green-400">Completed</span>
                          </>
                        ) : (
                          <>
                            <Loader className="w-3 h-3 text-yellow-500 animate-spin" />
                            <span className="text-[10px] text-yellow-400">Pending</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              <div className="p-6">
                <button className="w-full py-3 border border-white/10 hover:border-white/20 hover:bg-white/5 text-[11px] text-gray-500 hover:text-white transition-all uppercase tracking-widest">
                  View All Transactions
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 border border-white/5 bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-3 h-3 text-brand-stellar" />
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">Total in Escrow</span>
            </div>
            <p className="text-lg font-oswald text-white">$13,142.80</p>
          </div>
          <div className="p-3 border border-white/5 bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-1">
              <Unlock className="w-3 h-3 text-green-500" />
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">Available to Withdraw</span>
            </div>
            <p className="text-lg font-oswald text-green-400">$8,142.80</p>
          </div>
          <div className="p-3 border border-white/5 bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">Locked in Orders</span>
            </div>
            <p className="text-lg font-oswald text-yellow-400">$5,000.00</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Escrow;
