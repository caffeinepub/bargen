import { useState } from 'react';
import { ExternalBlob } from '@/backend';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductPhotoGalleryProps {
  photoBlobs?: ExternalBlob[] | null;
  productName: string;
}

export default function ProductPhotoGallery({ photoBlobs, productName }: ProductPhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const photos = photoBlobs && photoBlobs.length > 0 ? photoBlobs : null;

  if (!photos) {
    return (
      <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No photos available</p>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
        <img
          src={photos[currentIndex].getDirectURL()}
          alt={`${productName} - Photo ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {photos.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent hover:border-muted-foreground/30'
              }`}
            >
              <img
                src={photo.getDirectURL()}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
