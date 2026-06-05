'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

// ══════════════════════════════════════════════════════════════════════════
// AI MESSAGE CONTENT — Renders markdown AI responses beautifully
// ══════════════════════════════════════════════════════════════════════════

interface AIMessageContentProps {
  content: string;
  className?: string;
}

export function AIMessageContent({ content, className }: AIMessageContentProps) {
  return (
    <div className={cn('ai-prose', className)}>
      <ReactMarkdown
        components={{
          // ── Headings ──
          h1: ({ children }) => (
            <h1 className="text-base font-bold mt-3 mb-1.5 text-foreground first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[15px] font-bold mt-2.5 mb-1 text-foreground first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold mt-2 mb-1 text-foreground first:mt-0">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold mt-1.5 mb-0.5 text-foreground">{children}</h4>
          ),

          // ── Paragraphs ──
          p: ({ children }) => (
            <p className="text-sm leading-relaxed my-1.5 first:my-0">{children}</p>
          ),

          // ── Bold & Italic ──
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90">{children}</em>
          ),
          del: ({ children }) => (
            <del className="line-through text-muted-foreground">{children}</del>
          ),

          // ── Links ──
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),

          // ── Code blocks ──
          code: ({ className: codeClass, children, ...props }) => {
            const match = /language-(\w+)/.exec(codeClass || '');
            const isInline = !match && !codeClass;

            if (isInline) {
              return (
                <code
                  className="bg-white/10 dark:bg-white/15 px-1.5 py-0.5 rounded text-[12px] font-mono text-emerald-400 dark:text-emerald-300 border border-white/10"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="relative my-2 rounded-lg overflow-hidden border border-white/10">
                {match && (
                  <div className="flex items-center justify-between px-3 py-1 bg-black/40 border-b border-white/10">
                    <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                      {match[1]}
                    </span>
                  </div>
                )}
                <SyntaxHighlighter
                  style={oneDark}
                  language={match?.[1] || 'text'}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '12px',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    background: 'rgba(0,0,0,0.4)',
                    borderRadius: 0,
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          },

          // ── Pre (wrapper for code blocks) ──
          pre: ({ children }) => <>{children}</>,

          // ── Lists ──
          ul: ({ children }) => (
            <ul className="my-1.5 ml-4 space-y-1 list-disc list-outside marker:text-white/40">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1.5 ml-4 space-y-1 list-decimal list-outside marker:text-white/40 marker:font-medium">
              {children}
            </ol>
          ),
          li: ({ children, ordered }) => (
            <li className="text-sm leading-relaxed pl-1">
              {children}
            </li>
          ),

          // ── Blockquotes ──
          blockquote: ({ children }) => (
            <blockquote className="my-2 pl-3 border-l-2 border-blue-400/50 bg-blue-500/5 rounded-r-lg py-1 pr-2">
              {children}
            </blockquote>
          ),

          // ── Horizontal Rule ──
          hr: () => (
            <hr className="my-3 border-white/10" />
          ),

          // ── Tables ──
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto -mx-1">
              <table className="w-full text-xs border-collapse rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/10">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/5">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="even:bg-white/[0.02] hover:bg-white/5 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-2.5 py-1.5 text-left font-semibold text-foreground/90 border-b border-white/10 whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2.5 py-1.5 text-white/70 border-b border-white/5 whitespace-normal">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
