import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Command } from 'lucide-react';
import { blogPosts } from '../../data/blogData';
import { Search, useSearchShortcut } from './Search';
import { BlogHeader } from './BlogHeader';

export function Blog() {
  const [searchOpen, setSearchOpen] = useState(false);

  useSearchShortcut(() => setSearchOpen(true));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <BlogHeader />
      <div className="max-w-2xl mx-auto px-6 pt-12 md:pt-16 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            blogs
          </h1>
        </div>

        {/* Search shortcut hint */}
        <button
          onClick={() => setSearchOpen(true)}
          className="mb-8 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span>Search</span>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-500">
            <Command className="w-3 h-3" />K
          </kbd>
        </button>

        {/* Blog Posts */}
        {blogPosts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-400">No blog posts yet.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {blogPosts.map((post) => (
              <li key={post.id} className="font-medium">
                <Link
                  to={`/blog/${post.id}`}
                  className="group flex gap-1 -mx-2 px-2 py-1 justify-between items-center rounded hover:bg-gray-50 transition-colors"
                  draggable={false}
                >
                  <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                    {post.title}
                  </span>
                  <span className="dot-leaders flex-1 text-gray-200 font-normal group-hover:text-gray-400 transition-colors leading-none" />
                  <time className="text-gray-300 tabular-nums font-normal tracking-tighter group-hover:text-gray-500 transition-colors">
                    {formatDate(post.date)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Search Modal */}
      <Search isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export { BlogPost } from './BlogPost';
