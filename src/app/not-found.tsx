import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { SITE_NAME } from "@/lib/site-config";

export const metadata = {
  title: `Page Not Found — ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
        <Compass size={32} />
      </div>

      <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">
        Error 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-slate-400 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        The page you are looking for doesn&apos;t exist or has been moved. Explore
        our public self-growth features or return home.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Return Home
        </Link>
        <Link
          href="/feed"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300 font-medium text-sm transition-colors"
        >
          Explore Community
        </Link>
      </div>
    </div>
  );
}

