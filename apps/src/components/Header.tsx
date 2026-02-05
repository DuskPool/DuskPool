import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Maximize2, Menu, LogOut } from 'lucide-react';

interface HeaderProps {
  currentPath?: string;
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentPath = '/',
  isConnected = false,
  onConnect,
  onDisconnect
}) => {

  const publicNavItems = [
    { label: 'MARKETS', id: 'markets' },
    { label: 'PROTOCOL', id: 'protocol' },
    { label: 'FAQ', id: 'faq' }
  ];

  const isHomePage = currentPath === '/';

  const handleScrollToSection = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Top border line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="px-6 py-4 md:px-8 flex items-center justify-between">
        {/* Left Section - Icons */}
        <div className="flex items-center gap-4">
          <Link to="/" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
            <div className="w-5 h-5 border border-white/60 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </Link>
          <button className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
            <Search className="w-4 h-4 text-white/60" />
          </button>
          <div className="w-24 h-[1px] bg-white/20 hidden md:block"></div>
        </div>

        {/* Center Section - Decorative frame only (no logo) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0">
          <svg className="w-[400px] h-12" viewBox="0 0 400 50" fill="none">
            {/* Angled lines coming down from top */}
            <path d="M120 0 L150 20 L250 20 L280 0" stroke="white" strokeOpacity="0.3" strokeWidth="1" fill="none" />
            {/* Small accent lines */}
            <line x1="140" y1="10" x2="145" y2="15" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
            <line x1="260" y1="10" x2="255" y2="15" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
          </svg>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-4">
          <div className="w-24 h-[1px] bg-white/20 hidden md:block"></div>

          {!isConnected ? (
            <button
              onClick={onConnect}
              className="hidden md:flex items-center gap-2 px-6 py-2 border border-white/20 hover:border-white/40 transition-colors text-[11px] font-medium tracking-widest text-white"
            >
              CONNECT
            </button>
          ) : (
            <button
              onClick={onDisconnect}
              className="hidden md:flex items-center gap-2 px-4 py-2 border border-brand-stellar/30 hover:border-red-500/50 transition-colors"
            >
              <span className="text-[10px] font-mono text-white">0x71...3A92</span>
              <LogOut className="w-3 h-3 text-white/60" />
            </button>
          )}

          <button className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
            <Bell className="w-4 h-4 text-white/60" />
          </button>
          <button className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
            <Maximize2 className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Navigation Row - Only visible on home page */}
      {isHomePage && !isConnected && (
        <div className="hidden lg:flex items-center justify-center gap-12 py-3">
          {publicNavItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleScrollToSection(item.id, e)}
              className="text-[11px] font-medium tracking-[0.2em] transition-all duration-300 text-white/40 hover:text-white/70"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}

      {/* Mobile Menu Toggle */}
      <button className="lg:hidden fixed top-4 right-4 w-10 h-10 border border-white/20 flex items-center justify-center">
        <Menu className="w-5 h-5 text-white" />
      </button>
    </header>
  );
};

export default Header;
