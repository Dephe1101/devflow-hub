'use client';

import type { ReactNode } from 'react';

import { motion } from 'framer-motion';

interface SlideUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
}

export function SlideUp({
  children,
  delay = 0,
  duration = 0.5,
  yOffset = 20,
  className = '',
}: SlideUpProps): React.ReactNode {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -yOffset }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
