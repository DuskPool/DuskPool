import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, FileText } from 'lucide-react';
import { searchBlogPosts, type BlogPost } from '../../data/blogData';

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Search({ isOpen, onClose }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BlogPost[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Search when query changes
  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchBlogPosts(query).slice(0, 5);
      setResults(searchResults);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigate(`/blog/${results[selectedIndex].id}`);
      onClose();
      setQuery('');
    } else if (e.key === 'Escape') {
      onClose();
      setQuery('');
    }
  }, [results, selectedIndex, navigate, onClose]);

  const handleResultClick = (postId: string) => {
    navigate(`/blog/${postId}`);
    onClose();
    setQuery('');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setQuery('');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-xl mx-4 bg-white border border-gray-200 shadow-2xl rounded-lg animate-fade-in-down">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <SearchIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search blog posts..."
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 outline-none text-lg"
          />
          <button
            onClick={() => { onClose(); setQuery(''); }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <p className="text-sm">No posts found for "{query}"</p>
            </div>
          )}

          {results.map((post, index) => (
            <button
              key={post.id}
              onClick={() => handleResultClick(post.id)}
              className={`w-full flex items-start gap-3 p-4 text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-gray-100 border-l-2 border-gray-900'
                  : 'hover:bg-gray-50 border-l-2 border-transparent'
              }`}
            >
              <FileText className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-gray-900 font-medium truncate">{post.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 text-[10px] text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px]">Enter</kbd>
              Open
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px]">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Hook to handle Cmd+K / Ctrl+K shortcut
export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpen]);
}
