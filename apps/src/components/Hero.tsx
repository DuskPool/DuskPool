import React from 'react';
import { ShieldCheck } from 'lucide-react';
import AssetCard from './AssetCard';

const Hero: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-between relative px-6 md:px-12 pb-16 pt-20 max-w-[1920px] mx-auto">

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">

        {/* Top Text Group */}
        <div className="text-center mb-4 md:mb-8 animate-fade-in-down z-30">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-80">
            {/* <Lock className="w-3 h-3 text-brand-stellar" /> */}
            {/* <h2 className="text-gray-400 text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
              Privacy-Preserving Order Matching
            </h2> */}
          </div>
          <h1 className="pt-3 text-5xl md:text-7xl lg:text-[8.5rem] leading-[0.85] font-condensed font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 tracking-tighter uppercase drop-shadow-2xl">
            DUSKPOOL
          </h1>
          <h2 className="text-gray-400 text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
              Privacy-Preserving Order Matching
            </h2>
          {/* <p className="mt-4 text-gray-400 text-sm tracking-widest uppercase opacity-60">
             Protocol 25 &bull; Stellar &bull; ZK-Proofs
          </p> */}
        </div>

        {/* Product Visual Showcase - Asset Cards */}
        <div className="relative w-full max-w-6xl h-[35vh] md:h-[40vh] flex items-center justify-center perspective-1000">

          {/* Central Platform Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[20%] bg-brand-stellar/20 blur-[100px] rounded-full"></div>

          {/* Cards Container */}
          <div className="relative z-20 flex items-center justify-center gap-4 md:gap-10 w-full h-full">

            {/* Left Card (Real Estate) */}
            <div className="relative group w-[180px] md:w-[220px] h-[240px] md:h-[300px] opacity-80 hover:opacity-100 transition-all duration-500 hover:scale-105 transform-gpu rotate-y-12">
              <AssetCard type="realestate" />
            </div>

            {/* Center Card (Bonds/Treasuries) - Main Focus */}
            <div className="relative w-[220px] md:w-[280px] h-[280px] md:h-[360px] z-30 transform-gpu scale-105 shadow-2xl">
              <AssetCard type="bonds" isMain />
              {/* ZK Verified Badge below */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2">
                <ShieldCheck className="w-4 h-4 text-brand-stellar" />
                <span className="text-[10px] font-bold tracking-widest text-white uppercase">ZK-Proof Verified</span>
              </div>
            </div>

            {/* Right Card (Gold) */}
            <div className="relative group w-[180px] md:w-[220px] h-[240px] md:h-[300px] opacity-80 hover:opacity-100 transition-all duration-500 hover:scale-105 transform-gpu -rotate-y-12">
              <AssetCard type="gold" />
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Right: Product Info */}
      <div className="w-full flex justify-end items-end relative z-20">
        <div className="relative flex items-center max-w-sm md:max-w-md">
           {/* Dotted Line Connector */}
           <div className="hidden lg:block absolute right-full top-1/2 w-16 md:w-32 h-[1px] border-t border-dotted border-white/20 mr-4 md:mr-6">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-brand-stellar rounded-full"></div>
           </div>

           <div className="text-right lg:text-left pl-0 lg:pl-4 border-l-0 lg:border-l border-white/10">
             <div className="flex flex-col gap-1">
                <div className="flex items-center justify-end lg:justify-start gap-2 mb-1">
                   {/* Small Icon representing focus */}
                   <div className="w-4 h-4 rounded-full border border-brand-stellar/50 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-brand-stellar rounded-full"></div>
                   </div>
                   <span className="text-[10px] uppercase tracking-widest text-brand-stellar">Institutional Grade</span>
                </div>
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-light">
                  Tokenized real-world assets on Stellar. <strong className="text-white font-semibold">Zero-knowledge proofs for privacy & compliance.</strong>
                </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
