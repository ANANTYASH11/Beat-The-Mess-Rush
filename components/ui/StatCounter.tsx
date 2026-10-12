'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface StatCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function StatCounter({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: StatCounterProps) {
  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(decimals)}${suffix}`;
  });

  const [renderedValue, setRenderedValue] = useState<string>(
    `${prefix}${value.toFixed(decimals)}${suffix}`
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      setRenderedValue(latest);
    });
    return () => unsubscribe();
  }, [display]);

  return (
    <motion.span className={`font-mono inline-block tracking-tight ${className}`}>
      {renderedValue}
    </motion.span>
  );
}
