import { useEffect, useState } from 'react';

export const MouseFollower: React.FC = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-50 w-8 h-8 rounded-full border border-white/20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out mix-blend-difference"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="absolute inset-0 m-auto w-1 h-1 bg-white rounded-full"></div>
    </div>
  );
};
