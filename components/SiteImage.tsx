'use client';

import { useState } from 'react';
import type { ImageAsset } from '@/lib/content';

interface SiteImageProps {
  image: ImageAsset;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export default function SiteImage({
  image,
  className = '',
  priority = false,
  sizes,
}: SiteImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-onyx ${className}`}>
      {!failed ? (
        <img
          src={image.src}
          alt={image.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...(priority ? { fetchPriority: 'high' as const } : {})}
          sizes={sizes}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={image.alt}
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 100% at 78% 18%, rgba(232,232,232,0.10), rgba(20,20,20,0.0) 42%), #141414',
          }}
        />
      )}
    </div>
  );
}
