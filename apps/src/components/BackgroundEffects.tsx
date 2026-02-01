const BackgroundEffects: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dark Ambient Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#080808] to-[#0c0c0c]"></div>

      {/* Hero Glow Spot behind the Tees */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] bg-white opacity-[0.03] blur-[120px] rounded-full"></div>

      {/* Abstract Smoke/Curve Shapes (SVGs) */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-20" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#333" stopOpacity="0" />
            <stop offset="50%" stopColor="#555" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#333" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Large sweeping curve left */}
        <path
          d="M-100,600 C200,400 600,800 1000,200"
          fill="none"
          stroke="url(#curveGrad)"
          strokeWidth="150"
          filter="url(#blurMe)"
          className="opacity-30"
        />

        {/* Large sweeping curve right */}
        <path
          d="M1600,900 C1200,600 800,1000 400,0"
          fill="none"
          stroke="url(#curveGrad)"
          strokeWidth="200"
          filter="url(#blurMe)"
          className="opacity-20"
        />

        <filter id="blurMe">
          <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
        </filter>
      </svg>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
    </div>
  );
};

export default BackgroundEffects;
