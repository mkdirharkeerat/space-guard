import { motion } from 'motion/react';

export default function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.4,
  y = 12,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
