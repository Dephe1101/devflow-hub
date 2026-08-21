'use client';

import React from 'react';

import { motion } from 'framer-motion';
import { Bell, Layers } from 'lucide-react';

export function DistractionVisual(): React.ReactElement {
  return (
    <div className="relative w-full h-80 flex items-center justify-center bg-background/50 dark:bg-muted/10 rounded-3xl border border-border/50 overflow-hidden shadow-xl">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Distracting Tabs */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-4 md:left-10 top-10 w-48 h-32 bg-background border border-border shadow-lg rounded-xl p-3 opacity-90 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-red-400 rounded-full" />
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <div className="w-3 h-3 bg-green-400 rounded-full" />
        </div>
        <div className="h-2 w-20 bg-muted rounded mb-2" />
        <div className="h-12 w-full bg-muted/30 rounded border border-border/50" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute right-4 md:right-10 bottom-10 w-52 h-36 bg-background border border-border shadow-xl rounded-xl p-3 opacity-95 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-blue-500" />
          <div className="h-2 w-24 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-full bg-muted rounded" />
          <div className="h-2 w-5/6 bg-muted rounded" />
          <div className="h-2 w-4/6 bg-muted rounded" />
        </div>
      </motion.div>

      {/* Floating Notification */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute z-10 bg-destructive text-destructive-foreground px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-500/30"
      >
        <motion.div
          animate={{ rotate: [0, 15, -15, 15, -15, 0, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originY: 0 }}
        >
          <Bell className="w-5 h-5" />
        </motion.div>
        <span className="text-sm font-semibold tracking-wide">Quá nhiều Tab & Ứng dụng!</span>
      </motion.div>
    </div>
  );
}
