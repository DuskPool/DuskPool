import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  inline?: boolean;
}

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const language = className?.replace('language-', '') || '';

  // Robustly handle children to get text content
  const codeContent = typeof children === 'string'
    ? children
    : Array.isArray(children)
      ? children.join('')
      : String(children);

  useEffect(() => {
    if (codeRef.current && !inline) {
      try {
        if (language && hljs.getLanguage(language)) {
          codeRef.current.innerHTML = hljs.highlight(codeContent, { language }).value;
        } else {
          const result = hljs.highlightAuto(codeContent);
          codeRef.current.innerHTML = result.value;
        }
        codeRef.current.classList.add('hljs');
      } catch (e) {
        console.error('Highlight error:', e);
        codeRef.current.textContent = codeContent;
      }
    }
  }, [codeContent, language, inline]);

  if (inline) {
    return (
      <code className="inline text-[0.875em] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">
        {children}
      </code>
    );
  }

  return (
    <code
      ref={codeRef}
      className="block text-sm font-mono text-gray-100"
    >
      {children}
    </code>
  );
}
