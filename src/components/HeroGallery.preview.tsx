import { HeroGallery } from './HeroGallery';

export default function Demo(props: { layout?: number }) {
  const layout = props.layout === 0 ? 'grid' : 'asymmetric';
  return (
    <div className="w-full p-8">
      <HeroGallery
        layout={layout}
        images={[
          { src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80', alt: 'Mountain lake', aspect: 'landscape' },
          { src: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=400&q=80', alt: 'Studio interior', aspect: 'portrait' },
          { src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80', alt: 'Workspace detail', aspect: 'square' },
        ]}
      />
    </div>
  );
}
