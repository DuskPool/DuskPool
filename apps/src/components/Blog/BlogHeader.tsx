import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function BlogHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Hamburger icon only - fixed position */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-6 right-6 z-50 p-2 text-gray-400 hover:text-gray-900 transition-colors"
        aria-label="Menu"
      >
        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Slide-out menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed top-0 right-0 z-40 h-full w-72 bg-white shadow-2xl animate-slide-in-right">
            <nav className="flex flex-col p-8 pt-20 gap-1">
              <Link
                to="/blog"
                onClick={() => setMenuOpen(false)}
                className="text-lg text-gray-600 hover:text-gray-900 py-3 transition-colors"
              >
                Blog
              </Link>
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="text-lg text-gray-600 hover:text-gray-900 py-3 transition-colors"
              >
                App
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
