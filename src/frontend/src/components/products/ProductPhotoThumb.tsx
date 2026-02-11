import { ExternalBlob } from '@/backend';
import { ImageIcon } from 'lucide-react';

interface ProductPhotoThumbProps {
  photoBlobs?: ExternalBlob[] | null;
  productName: string;
  className?: string;
}

export default function ProductPhotoThumb({ photoBlobs, productName, className = '' }: ProductPhotoThumbProps) {
  const firstPhoto = photoBlobs && photoBlobs.length > 0 ? photoBlobs[0] : null;

  if (!firstPhoto) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={firstPhoto.getDirectURL()}
      alt={productName}
      className={`object-cover ${className}`}
    />
  );
}
