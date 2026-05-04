'use client';
import { motion } from 'framer-motion';

export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <span className="text-sm text-zinc-500">Thinking...</span>
    </div>
  );
}
