import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSignedUrls } from '@/hooks/useSignedUrls';

interface PhotoGalleryProps {
  photos: string[];
  maxVisible?: number;
}

export function PhotoGallery({ photos, maxVisible = 8 }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // Generate signed URLs for all photos
  const { signedUrls, isLoading } = useSignedUrls(photos, 'entregas-fotos');
  
  const displayPhotos = signedUrls.length > 0 ? signedUrls : photos;
  const visiblePhotos = displayPhotos.slice(0, maxVisible);
  const remainingCount = displayPhotos.length - maxVisible;

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? displayPhotos.length - 1 : selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === displayPhotos.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setSelectedIndex(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando fotos...</span>
      </div>
    );
  }

  if (displayPhotos.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visiblePhotos.map((photo, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-square rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img
              src={photo}
              alt={`Foto ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                // Fallback if signed URL fails
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
          </button>
        ))}
        
        {remainingCount > 0 && (
          <button
            onClick={() => setSelectedIndex(maxVisible)}
            className="aspect-square rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span className="text-lg font-semibold text-muted-foreground">
              +{remainingCount} fotos
            </span>
          </button>
        )}
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] p-0 bg-foreground/95 border-none"
          onKeyDown={handleKeyDown}
        >
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
            >
              <X className="w-6 h-6 text-background" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 text-background text-sm font-medium">
              {selectedIndex !== null && `${selectedIndex + 1} / ${displayPhotos.length}`}
            </div>

            {/* Navigation arrows */}
            {displayPhotos.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 p-2 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8 text-background" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 p-2 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
                >
                  <ChevronRight className="w-8 h-8 text-background" />
                </button>
              </>
            )}

            {/* Image */}
            {selectedIndex !== null && (
              <img
                src={displayPhotos[selectedIndex]}
                alt={`Foto ${selectedIndex + 1}`}
                className="max-w-[90vw] max-h-[85vh] object-contain animate-scale-in"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
