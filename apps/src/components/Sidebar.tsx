import { Facebook, Instagram, Twitter } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-6 md:left-12 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-6">
      <SocialIcon icon={<Facebook className="w-4 h-4" />} />
      <SocialIcon icon={<Instagram className="w-4 h-4" />} />
      <SocialIcon icon={<Twitter className="w-4 h-4" />} />

      {/* Decorative vertical line */}
      <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/20 to-white/0 mx-auto mt-4"></div>
    </aside>
  );
};

const SocialIcon: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <a
    href="#"
    className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent border border-transparent hover:border-white/20 hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110"
  >
    {icon}
  </a>
);

export default Sidebar;
