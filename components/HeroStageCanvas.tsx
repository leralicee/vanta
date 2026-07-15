'use client';

import { useRef } from 'react';
import { useHeroStage, type StageControl } from '@/hooks/useHeroStage';
import SiteImage from '@/components/SiteImage';
import { HERO_IMAGE } from '@/lib/content';

interface HeroStageCanvasProps {
  control: StageControl;
  className?: string;
}

export default function HeroStageCanvas({ control, className = '' }: HeroStageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { supported } = useHeroStage(containerRef, control);

  return (
    <div ref={containerRef} aria-hidden={supported} className={`relative ${className}`}>
      {!supported && (
        <SiteImage image={HERO_IMAGE} priority className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
