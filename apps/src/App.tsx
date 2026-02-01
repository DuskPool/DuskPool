import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import BackgroundEffects from './components/BackgroundEffects';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate asset loading for smooth entrance
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-hidden selection:bg-white/20 selection:text-white">
      <BackgroundEffects />

      <div className={`transition-opacity duration-1000 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Header />
        <Sidebar />

        <main className="relative z-10 w-full h-screen flex flex-col items-center justify-center pt-16">
          <Hero />
        </main>
      </div>

      {/* Subtle grain overlay for texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  );
};

export default App;
