'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import { ArrowRight, Compass } from 'lucide-react';

interface AIMessageProps {
  content: string;
}

// Map of internal routes to friendly labels
const ROUTE_LABELS: Record<string, string> = {
  '/home': 'Dashboard',
  '/learn': 'Learning Tracker',
  '/fitness': 'Fitness Tracker',
  '/content': 'Content Studio',
  '/time': 'Tasks & Focus',
  '/feed': 'Social Feed',
  '/discover': 'Discover',
  '/leaderboard': 'Leaderboard',
  '/achievements': 'Achievements',
  '/analytics': 'Analytics',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
  '/messages': 'Messages',
  '/friends': 'Friends',
  '/onboarding': 'Onboarding',
  '/ai-hub': 'AI Hub',
  '/blog': 'Blog',
};

// Reverse map: friendly name keywords → route path
const NAME_TO_ROUTE: [RegExp, string][] = [
  [/dashboard|home page|overview|main page/i, '/home'],
  [/learning|learn section|study|learning tracker/i, '/learn'],
  [/fitness|workout|exercise|gym|nutrition|fitness tracker/i, '/fitness'],
  [/content|content studio|script|series|publishing/i, '/content'],
  [/task|tasks|todo|focus|time manage|productivity|pomodoro/i, '/time'],
  [/feed|social|posts|social feed/i, '/feed'],
  [/discover|explore|find user/i, '/discover'],
  [/leaderboard|ranking|xp rank|rank/i, '/leaderboard'],
  [/achievement|badge|trophy/i, '/achievements'],
  [/analytic|chart|stat|progress data|data dashboard/i, '/analytics'],
  [/profile|account|my page/i, '/profile'],
  [/setting|preference|config/i, '/settings'],
  [/notification|alert|bell/i, '/notifications'],
  [/message|dm|chat|direct message|inbox/i, '/messages'],
  [/friend|friend list/i, '/friends'],
  [/onboard|getting started|setup|phase/i, '/onboarding'],
  [/ai.?hub|ai assistant|ai center|ai chat/i, '/ai-hub'],
  [/blog|article|read|write article/i, '/blog'],
];

// Detect internal route references in AI message text
function extractRoutes(text: string): string[] {
  const found = new Set<string>();

  // 1. Match explicit route paths like /fitness, /learn
  const routePattern = /\/(?:home|learn|fitness|content|time|feed|discover|leaderboard|achievements|analytics|profile|settings|notifications|messages|friends|onboarding|ai-hub|blog)\b/g;
  const pathMatches = text.match(routePattern) || [];
  pathMatches.forEach(r => found.add(r));

  // 2. Match friendly name references (e.g., "Fitness section", "Learning tracker")
  for (const [pattern, route] of NAME_TO_ROUTE) {
    if (pattern.test(text)) {
      found.add(route);
    }
  }

  return [...found];
}

function NavigateButton({ route }: { route: string }) {
  const router = useRouter();
  const label = ROUTE_LABELS[route] || route;

  return (
    <button
      onClick={() => router.push(route)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/25 text-blue-300 text-xs font-medium transition-colors group"
    >
      <Compass size={12} className="text-blue-400 shrink-0" />
      <span>Go to {label}</span>
      <ArrowRight size={10} className="text-blue-400/60 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
    </button>
  );
}

export function AIMessage({ content }: AIMessageProps) {
  if (!content) return null;

  // Extract navigation routes from content
  const routes = extractRoutes(content);

  return (
    <div>
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
            a: ({ href, children }) => {
              // If it's an internal route link, render as a navigate button
              if (href && href.startsWith('/') && ROUTE_LABELS[href]) {
                return <InternalLink href={href}>{children}</InternalLink>;
              }
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  {children}
                </a>
              );
            },
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

      {/* Navigation buttons for detected routes */}
      {routes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            {routes.map(route => (
              <NavigateButton key={route} route={route} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Internal link component that navigates within the app
function InternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="inline-flex items-center gap-1 text-blue-400 hover:underline cursor-pointer bg-transparent border-0 p-0 font-inherit"
    >
      {children}
      <ArrowRight size={10} className="text-blue-400/60" />
    </button>
  );
}
