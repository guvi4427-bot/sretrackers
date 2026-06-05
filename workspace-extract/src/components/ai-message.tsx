'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIMessageProps {
  content: string;
}

export function AIMessage({ content }: AIMessageProps) {
  if (!content) return null;

  return (
    <div className="ai-message prose prose-invert prose-sm max-w-none overflow-x-auto
      prose-headings:text-white prose-headings:font-semibold
      prose-h1:text-lg prose-h1:mt-3 prose-h1:mb-2
      prose-h2:text-base prose-h2:mt-2.5 prose-h2:mb-1.5
      prose-h3:text-sm prose-h3:mt-2 prose-h3:mb-1
      prose-p:text-white/80 prose-p:leading-relaxed prose-p:my-1.5
      prose-strong:text-white prose-strong:font-semibold
      prose-em:text-white/70
      prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
      prose-code:text-blue-300 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-[''] prose-code:after:content-['']
      prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg prose-pre:overflow-x-auto
      prose-ul:text-white/80 prose-ul:my-1.5
      prose-ol:text-white/80 prose-ol:my-1.5
      prose-li:text-white/80 prose-li:my-0.5
      prose-blockquote:border-l-2 prose-blockquote:border-blue-400/50 prose-blockquote:pl-3 prose-blockquote:text-white/60 prose-blockquote:italic
      prose-hr:border-white/10 prose-hr:my-3
      prose-table:text-white/80 prose-table:text-xs
      prose-th:text-white prose-th:bg-white/10 prose-th:px-2 prose-th:py-1 prose-th:border prose-th:border-white/10
      prose-td:px-2 prose-td:py-1 prose-td:border prose-td:border-white/10
      prose-img:rounded-lg
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border-collapse border border-white/10 text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/10">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-2 py-1.5 text-left text-white font-semibold border border-white/10 whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2 py-1.5 text-white/80 border border-white/10">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="even:bg-white/5">{children}</tr>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-white/10 text-blue-300 px-1 py-0.5 rounded text-xs" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`${className || ''} text-xs`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-white/5 border border-white/10 rounded-lg p-3 overflow-x-auto text-xs">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-4 my-1.5 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-4 my-1.5 space-y-0.5">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-blue-400/50 pl-3 my-2 text-white/60 italic">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-white mt-3 mb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-white mt-2.5 mb-1.5">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-white mt-2 mb-1">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-white/80 leading-relaxed my-1.5">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
          ),
          hr: () => (
            <hr className="border-white/10 my-3" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
