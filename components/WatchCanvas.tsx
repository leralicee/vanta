'use client';

import { useRef } from 'react';
import { useThreeWatch, type WatchConfig } from '@/hooks/useThreeWatch';
import SiteImage from '@/components/SiteImage';
import { HERO_IMAGE, type ImageAsset } from '@/lib/content';

interface WatchCanvasProps {
  config: WatchConfig;
  interactive?: boolean;
  className?: string;

  fallback?: ImageAsset;

  magnetic?: boolean;
}

export default function WatchCanvas({
  config,
  interactive = true,
  className = '',
  fallback = HERO_IMAGE,
  magnetic = true,
}: WatchCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { supported } = useThreeWatch(containerRef, { interactive, config });

  return (
    <div
      ref={containerRef}
      data-magnetic={magnetic ? '' : undefined}
      aria-hidden={supported}
      className={`relative ${className}`}
    >
      {!supported && (
        <SiteImage image={fallback} priority className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
