import React from 'react';
import { Lock, Shield, Network } from 'lucide-react';

const Protocol: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center relative px-6 md:px-12 py-20 animate-fade-in-up">

      {/* Background Tech Grid */}
      <div className="absolute inset-0 z-0 opacity-10"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10">

        {/* Left Column: Typography & Info */}
        <div className="flex flex-col items-start space-y-8">
           {/* Section Label */}
           <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-brand-stellar"></div>
              <span className="text-xs font-bold tracking-[0.3em] text-brand-stellar uppercase">System Architecture</span>
           </div>

           {/* Main Title */}
           <h2 className="text-5xl md:text-7xl font-condensed font-bold text-white uppercase leading-[0.9] tracking-tighter">
             X-Ray <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-white">Protocol</span>
           </h2>

           {/* Description with 'schematic' lines */}
           <div className="relative pl-8 border-l border-white/10 py-2">
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md font-light">
                Built on <strong className="text-white">Protocol 25</strong>, the engine utilizes the BN254 curve for Groth16 proof verification.
                Orders are matched off-chain with Zero-Knowledge privacy, while settlement occurs atomically on Stellar.
              </p>

              {/* Decorative schematic markers */}
              <div className="absolute top-0 -left-[5px] w-[9px] h-[9px] bg-black border border-brand-stellar rounded-full"></div>
              <div className="absolute bottom-0 -left-[5px] w-[9px] h-[9px] bg-black border border-gray-600 rounded-full"></div>
           </div>

           {/* Stats / Tech Specs */}
           <div className="grid grid-cols-2 gap-8 w-full pt-8">
              <div>
                 <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Elliptic Curve</h4>
                 <p className="text-2xl font-oswald text-white">BN254</p>
              </div>
              <div>
                 <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Proof System</h4>
                 <p className="text-2xl font-oswald text-white">Groth16</p>
              </div>
              <div>
                 <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Hashing</h4>
                 <p className="text-2xl font-oswald text-white">Poseidon</p>
              </div>
              <div>
                 <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Latency</h4>
                 <p className="text-2xl font-oswald text-white">&lt;50ms</p>
              </div>
           </div>
        </div>

        {/* Right Column: Visual Schematic */}
        <div className="relative h-[50vh] w-full flex items-center justify-center">

           {/* Central Object (The "Core") */}
           <div className="relative w-64 h-64 md:w-80 md:h-80">
              {/* Outer Rings */}
              <div className="absolute inset-0 border border-brand-stellar/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-4 border border-dashed border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

              {/* Core Glow */}
              <div className="absolute inset-0 bg-brand-stellar/10 blur-3xl rounded-full"></div>

              {/* Central Shield/Lock 3D Representation */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                 <Shield className="w-32 h-32 text-white stroke-[0.5] drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                 <Lock className="absolute w-12 h-12 text-brand-stellar" />
              </div>

              {/* Schematic Connector Lines */}
              {/* Line 1: Top Right */}
              <div className="absolute top-10 right-0 w-32 h-[1px] bg-white/20 -rotate-12 translate-x-full origin-left flex items-center">
                 <div className="w-2 h-2 bg-white rounded-full"></div>
                 <span className="absolute left-full ml-2 text-[10px] uppercase tracking-widest text-brand-stellar whitespace-nowrap">
                    Verification Key
                 </span>
              </div>

              {/* Line 2: Bottom Right */}
              <div className="absolute bottom-10 right-0 w-24 h-[1px] bg-white/20 rotate-12 translate-x-full origin-left flex items-center">
                 <div className="w-2 h-2 bg-white rounded-full"></div>
                 <span className="absolute left-full ml-2 text-[10px] uppercase tracking-widest text-gray-400 whitespace-nowrap">
                    Merkle Root
                 </span>
              </div>

              {/* Line 3: Left */}
              <div className="absolute top-1/2 left-0 w-20 h-[1px] bg-white/20 -translate-x-full flex items-center justify-end">
                 <div className="w-2 h-2 bg-brand-stellar rounded-full"></div>
                 <span className="absolute right-full mr-2 text-[10px] uppercase tracking-widest text-white whitespace-nowrap">
                    ZK-SNARK
                 </span>
              </div>
           </div>

           {/* Floating Info Cards around the core */}
           <div className="absolute -bottom-10 right-10 bg-black/80 backdrop-blur border border-white/10 p-4 max-w-[200px]">
              <div className="flex items-start gap-3">
                 <Network className="w-5 h-5 text-brand-stellar mt-1" />
                 <div>
                    <h5 className="text-white text-xs font-bold uppercase mb-1">Atomic Swap</h5>
                    <p className="text-[10px] text-gray-400 leading-tight">Simultaneous exchange of assets upon proof verification.</p>
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default Protocol;
