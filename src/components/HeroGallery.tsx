import { useEffect, useRef, useState } from 'react';

export interface HeroGalleryImage {
  src: string;
  alt: string;
  aspect?: 'square' | 'portrait' | 'landscape';
}

export interface HeroGalleryProps {
  images: HeroGalleryImage[];
  layout?: 'grid' | 'asymmetric';
  className?: string;
}

const aspectClass: Record<string, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[16/9]',
};

/** Stagger-fade entrance using IntersectionObserver */
function useEntranceVisible(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setVisible(true); return; }

    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.1 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [count]);

  return { ref, visible };
}

function GalleryImage({
  image,
  index,
  visible,
  className = '',
}: {
  image: HeroGalleryImage;
  index: number;
  visible: boolean;
  className?: string;
}) {
  const aspect = aspectClass[image.aspect ?? 'landscape'];
  return (
    <div
      className={`overflow-hidden rounded-[var(--radius-md)] ${aspect} ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: visible
          ? `opacity var(--duration-base) var(--ease-out-quart) ${index * 80}ms, transform var(--duration-base) var(--ease-out-quart) ${index * 80}ms`
          : 'none',
      }}
    >
      <img
        src={image.src}
        alt={image.alt}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export function HeroGallery({
  images,
  layout = 'asymmetric',
  className = '',
}: HeroGalleryProps) {
  const { ref, visible } = useEntranceVisible(images.length);
  const [first, ...rest] = images;

  if (layout === 'grid') {
    return (
      <div
        ref={ref}
        className={`grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-2 ${className}`}
      >
        {images.map((img, i) => (
          <GalleryImage key={i} image={img} index={i} visible={visible} />
        ))}
      </div>
    );
  }

  // Asymmetric: first image is large (full width on mobile, left col on desktop),
  // remaining images stack in the right column.
  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 ${className}`}
    >
      {/* Large primary image */}
      {first && (
        <GalleryImage
          image={first}
          index={0}
          visible={visible}
          className="sm:row-span-2"
        />
      )}
      {/* Secondary images stacked */}
      {rest.map((img, i) => (
        <GalleryImage key={i + 1} image={img} index={i + 1} visible={visible} />
      ))}
    </div>
  );
}
