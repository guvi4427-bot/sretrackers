import { LogoSpinner } from "@/components/logo";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LogoSpinner size={48} label="Loading..." />
    </div>
  );
}
