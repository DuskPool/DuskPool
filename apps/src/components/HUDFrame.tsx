import React from 'react';

const HUDFrame: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Top Left Corner */}
      <div className="absolute top-20 left-6">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M0 20 L0 0 L20 0" stroke="white" strokeOpacity="0.3" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Top Right Corner */}
      <div className="absolute top-20 right-6">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M0 0 L20 0 L20 20" stroke="white" strokeOpacity="0.3" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Bottom Left Corner */}
      <div className="absolute bottom-6 left-6">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M0 0 L0 20 L20 20" stroke="white" strokeOpacity="0.3" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Bottom Right Corner */}
      <div className="absolute bottom-6 right-6">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M20 0 L20 20 L0 20" stroke="white" strokeOpacity="0.3" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Left Side Vertical Line */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 h-32 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

      {/* Right Side Vertical Line */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 h-32 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

      {/* Bottom Center Decorative Element */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <svg width="200" height="30" viewBox="0 0 200 30" fill="none">
          <line x1="0" y1="15" x2="70" y2="15" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          <line x1="130" y1="15" x2="200" y2="15" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          <rect x="80" y="10" width="40" height="10" stroke="white" strokeOpacity="0.3" strokeWidth="1" fill="none" />
          <circle cx="100" cy="15" r="2" fill="white" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
};

export default HUDFrame;
