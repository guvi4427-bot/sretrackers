import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-[#0A0F1E] dark:to-[#1E3A5F] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="flex-1 flex items-center justify-center w-full">
        {children}
      </div>
      {/* Footer Links */}
      <div className="w-full pb-6 pt-4 flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground/50 relative z-10">
        <Link href="/about" className="hover:text-muted-foreground transition-colors">About</Link>
        <span>·</span>
        <Link href="/contact" className="hover:text-muted-foreground transition-colors">Contact</Link>
        <span>·</span>
        <Link href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy Policy</Link>
        <span>·</span>
        <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms & Conditions</Link>
        <span>·</span>
        <Link href="/community-guidelines" className="hover:text-muted-foreground transition-colors">Community Guidelines</Link>
      </div>
    </div>
  );
}
