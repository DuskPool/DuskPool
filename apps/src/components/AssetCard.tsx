interface AssetCardProps {
  type: 'gold' | 'bonds' | 'realestate';
  isMain?: boolean;
}

const AssetCard: React.FC<AssetCardProps> = ({ type, isMain = false }) => {

  const getAssetDetails = () => {
    switch (type) {
      case 'gold':
        return {
          title: 'COMMODITIES',
          subtitle: 'PAXG / GOLD',
          image: 'https://images.pexels.com/photos/366551/pexels-photo-366551.jpeg?auto=compress&cs=tinysrgb&w=600',
          accent: 'border-yellow-500/30'
        };
      case 'bonds':
        return {
          title: 'TREASURIES',
          subtitle: 'US T-BILLS',
          image: 'https://images.unsplash.com/photo-1698956116418-1eb44719aba9?w=500&auto=format&fit=crop&q=60',
          accent: 'border-blue-500/30'
        };
      case 'realestate':
        return {
          title: 'REAL ESTATE',
          subtitle: 'COMMERCIAL',
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
          accent: 'border-purple-500/30'
        };
    }
  };

  const details = getAssetDetails();

  return (
    <div className={`relative w-full h-full group overflow-hidden`}>

      {/* Card Container */}
      <div className={`
        absolute inset-0 bg-zinc-900/90 backdrop-blur-sm border border-white/10
        transition-all duration-500 ease-out
        ${isMain ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'shadow-lg group-hover:border-white/30'}
        ${details.accent}
        overflow-hidden
      `}>

        {/* Image Background */}
        <div className="absolute inset-0 overflow-hidden">
            <img
                src={details.image}
                alt={details.title}
                className={`
                    w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-700
                    ${isMain ? 'scale-100' : 'scale-110 group-hover:scale-100'}
                `}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 z-20">
            <div className={`w-8 h-[1px] bg-white/50 mb-2 ${isMain ? 'w-12' : 'group-hover:w-12 transition-all duration-500'}`}></div>
            <h3 className={`font-oswald uppercase tracking-wider text-white ${isMain ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                {details.title}
            </h3>
            <p className="text-[10px] md:text-xs text-gray-400 font-mono tracking-widest mt-1">
                {details.subtitle}
            </p>
        </div>

        {/* Active/Verification Badge (Visual Detail) */}
        <div className="absolute top-4 right-4 flex gap-1">
             <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
             <div className="w-1 h-1 bg-white/20 rounded-full"></div>
             <div className="w-1 h-1 bg-white/20 rounded-full"></div>
        </div>

        {/* Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
      </div>
    </div>
  );
};

export default AssetCard;
