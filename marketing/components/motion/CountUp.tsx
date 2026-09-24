'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/**
 * Counts up to the number inside `value` (e.g. "₹2 Cr+", "1,000+") once it is visible,
 * keeping any prefix and suffix. Renders the final value on the server and for
 * reduced-motion visitors.
 */
export default function CountUp({ value, duration = 1.4 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduceMotion = useReducedMotion();
  const match = value.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || !match || reduceMotion) return;
    const [, prefix, numeric, suffix] = match;
    const target = Number(numeric.replace(/,/g, ''));
    const useGrouping = numeric.includes(',');
    const controls = animate(0, target, {
      duration,
      onUpdate: (latest) => {
        const rounded = Math.round(latest);
        setDisplay(`${prefix}${useGrouping ? rounded.toLocaleString('en-IN') : rounded}${suffix}`);
      },
    });
    return () => controls.stop();
    // match is derived from value; depending on value keeps this stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, duration, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}
