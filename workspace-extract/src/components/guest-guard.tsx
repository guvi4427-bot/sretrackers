'use client';

import { useState, createContext, useContext, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LogIn, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';

interface GuestContextType {
  isGuest: boolean;
  requireAuth: (action?: string) => boolean;
  showLoginPrompt: (action?: string) => void;
}

const GuestContext = createContext<GuestContextType>({
  isGuest: false,
  requireAuth: () => false,
  showLoginPrompt: () => {},
});

export function useGuest() {
  return useContext(GuestContext);
}

export function GuestProvider({ children }: { children: ReactNode }) {
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptAction, setPromptAction] = useState('');
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  // Check if user is a guest: only true if unauthenticated AND guest flag is set.
  // Authenticated users are NEVER guests, even if stale flags exist.
  const isGuest =
    sessionStatus !== 'authenticated' &&
    typeof window !== 'undefined' &&
    localStorage.getItem('sre_guest') === 'true';

  const showLoginPrompt = useCallback((action?: string) => {
    setPromptAction(action || 'this feature');
    setPromptOpen(true);
  }, []);

  const requireAuth = useCallback(
    (action?: string): boolean => {
      if (isGuest) {
        showLoginPrompt(action);
        return true; // means auth IS required (guest blocked)
      }
      return false; // auth not required (user is logged in)
    },
    [isGuest, showLoginPrompt]
  );

  const handleLogin = () => {
    setPromptOpen(false);
    localStorage.removeItem('sre_guest');
    router.push('/login');
  };

  const handleSignup = () => {
    setPromptOpen(false);
    localStorage.removeItem('sre_guest');
    router.push('/signup');
  };

  return (
    <GuestContext.Provider value={{ isGuest, requireAuth, showLoginPrompt }}>
      {children}

      <AnimatePresence>
        {promptOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setPromptOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-card p-6 m-4 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPromptOpen(false)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X size={18} />
              </button>
              <div className="flex flex-col items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <LogIn size={24} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Sign in to continue</h3>
                <p className="text-sm text-muted-foreground">
                  Create an account or sign in to {promptAction}. Join {SITE_NAME} to track your progress and connect with the community.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleLogin}
                  className="w-full gradient-blue text-white font-semibold h-10 rounded-lg"
                >
                  <LogIn size={16} className="mr-2" /> Sign In
                </Button>
                <Button
                  onClick={handleSignup}
                  variant="outline"
                  className="w-full border-border text-foreground font-semibold h-10 rounded-lg hover:bg-accent"
                >
                  <UserPlus size={16} className="mr-2" /> Create Account
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GuestContext.Provider>
  );
}
