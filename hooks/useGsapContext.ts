'use client';

import { DependencyList, RefObject } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useReducedMotion } from './useReducedMotion';

export function useGsapContext(
  scopeRef: RefObject<HTMLElement>,
  setup: (self: gsap.Context) => void,
  deps: DependencyList = [],
) {
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (reduced || !scopeRef.current) return;
    const ctx = gsap.context(setup, scopeRef);
    return () => ctx.revert();
  }, [reduced, ...deps]);
}
