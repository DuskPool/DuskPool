import { ArrowRight, Wallet, Menu } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 md:py-8 flex items-start justify-between">
      {/* Logo Area */}
      <div className="flex items-center">
        <div className="relative group cursor-pointer">
          <h1 className="text-xl md:text-2xl font-condensed tracking-wide italic font-bold text-white uppercase">
            Duskpool
          </h1>
        </div>
      </div>

      {/* Navigation Pill */}
      <div className="hidden lg:flex items-center">
        {/* Main Nav Links */}
        <nav className="flex items-center bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-full px-1.5 py-1.5 mr-4">
          <ul className="flex items-center">
            {['MARKETS', 'TRADE', 'POOLS', 'GOVERNANCE'].map((item, index) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className={`
                    relative px-5 py-2.5 text-[11px] font-medium tracking-widest transition-all duration-300 rounded-full
                    ${index === 0
                      ? 'bg-zinc-800 text-white'
                      : 'text-gray-400 hover:text-white'}
                  `}
                >
                  <span className={index === 0 ? 'flex items-center gap-2' : ''}>
                    {index === 0 && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                    {item}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Connect Wallet Button */}
          <button className="group flex items-center gap-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-full pl-5 pr-1.5 py-1.5 transition-all duration-300">
            <span className="text-[11px] font-medium tracking-widest text-white">CONNECT WALLET</span>
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </button>

          {/* Wallet Icon */}
          <button className="w-11 h-11 flex items-center justify-center bg-zinc-900/60 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-full transition-all duration-300 group">
            <Wallet className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
          </button>

          {/* Menu Icon */}
          <button className="w-11 h-11 flex items-center justify-center bg-zinc-900/60 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-full transition-all duration-300 group">
            <div className="flex flex-col gap-[5px] items-center">
              <span className="w-4 h-[1.5px] bg-gray-300 group-hover:bg-white transition-colors"></span>
              <span className="w-4 h-[1.5px] bg-gray-300 group-hover:bg-white transition-colors"></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Toggle (Visible only on small screens) */}
      <button className="lg:hidden w-10 h-10 flex items-center justify-center bg-zinc-900 border border-white/10 rounded-full">
        <Menu className="w-5 h-5 text-white" />
      </button>
    </header>
  );
};

export default Header;
