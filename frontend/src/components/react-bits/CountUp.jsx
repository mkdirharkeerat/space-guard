import { useInView, useMotionValue, useSpring } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  prefix = '',
  suffix = '',
  decimals = 0,
  onStart,
  onEnd
}) {
  const ref = useRef(null);
  const motionValue = useMotionValue(direction === 'down' ? to : from);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);

  const springValue = useSpring(motionValue, {
    damping,
    stiffness
  });

  const isInView = useInView(ref, { once: true, margin: '0px' });

  const formatNumber = useCallback(
    (num) => {
      const fixed = Number(num).toFixed(decimals);
      if (!separator) return fixed;
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      return parts.join('.');
    },
    [decimals, separator]
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = `${prefix}${formatNumber(direction === 'down' ? to : from)}${suffix}`;
    }
  }, [from, to, direction, prefix, suffix, formatNumber]);

  useEffect(() => {
    if (isInView && startWhen) {
      if (typeof onStart === 'function') onStart();

      const timeout = setTimeout(() => {
        motionValue.set(direction === 'down' ? from : to);
      }, delay * 1000);

      const durationTimeout = setTimeout(() => {
        if (typeof onEnd === 'function') onEnd();
      }, (delay + duration) * 1000);

      return () => {
        clearTimeout(timeout);
        clearTimeout(durationTimeout);
      };
    }
  }, [isInView, startWhen, motionValue, direction, from, to, delay, duration, onStart, onEnd]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${formatNumber(latest)}${suffix}`;
      }
    });

    return () => unsubscribe();
  }, [springValue, prefix, suffix, formatNumber]);

  return <span className={className} ref={ref} />;
}
