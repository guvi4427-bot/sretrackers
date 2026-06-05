'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { SITE_NAME, SITE_SHORT_NAME } from '@/lib/site-config';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

/**
 * Logo component — uses the official favicon across the entire UI.
 * - `size` controls the image dimension (default 32)
 * - `showText` appends the brand text
 */
export function Logo({ size = 32, className = '', showText = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/favicon-96x96.png"
        alt={SITE_NAME}
        width={size}
        height={size}
        className="rounded-lg object-cover"
        priority
      />
      {showText && (
        <span className="font-bold text-foreground text-sm">{SITE_SHORT_NAME}</span>
      )}
    </div>
  );
}

interface LogoSpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

/**
 * Animated logo spinner — used for full-screen loading states.
 * The logo pulses + rotates gently to indicate loading progress.
 */
export function LogoSpinner({ size = 48, className = '', label = 'Loading...' }: LogoSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Image
          src="/favicon-96x96.png"
          alt={SITE_NAME}
          width={size}
          height={size}
          className="rounded-xl object-cover"
          priority
        />
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-blue-400/30"
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      {label && (
        <motion.p
          className="text-sm text-muted-foreground font-medium"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}

/**
 * Inline mini spinner — small logo that spins for inline loading contexts.
 */
export function LogoMiniSpinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      className={className}
    >
      <Image
        src="/favicon-96x96.png"
        alt={SITE_NAME}
        width={size}
        height={size}
        className="rounded object-cover"
        priority
      />
    </motion.div>
  );
}
