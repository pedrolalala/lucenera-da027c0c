import { useRef, ChangeEvent } from 'react';
import { Camera, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  photos: string[];
  onAddPhoto: (photoUrl: string) => void;
  onRemovePhoto: (index: number) => void;
}

export function PhotoUploader({ photos, onAddPhoto, onRemovePhoto }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      onAddPhoto(url);
    });

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-semibold text-foreground">
          Fotos da Entrega
        </label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Registre a instalação finalizada
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/webp"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {photos.length === 0 ? (
        /* Empty state - Large button */
        <button
          type="button"
          onClick={triggerFileInput}
          className={cn(
            'w-full h-32 border-3 border-dashed border-muted-foreground/30 rounded-xl',
            'flex flex-col items-center justify-center gap-2',
            'bg-card hover:bg-muted/50 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
        >
          <Camera className="w-12 h-12 text-primary" />
          <span className="text-sm text-muted-foreground">
            Tirar Foto ou Escolher da Galeria
          </span>
        </button>
      ) : (
        /* Photos grid */
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
              >
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemovePhoto(index)}
                  className={cn(
                    'absolute top-2 right-2 w-6 h-6 rounded-full',
                    'bg-destructive text-destructive-foreground',
                    'flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'hover:bg-destructive/90 focus:opacity-100'
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add more button */}
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            className="w-full h-12 border-2 border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar mais fotos
          </Button>

          {/* Counter */}
          <p className="text-xs text-success font-medium">
            {photos.length} {photos.length === 1 ? 'foto adicionada' : 'fotos adicionadas'}
          </p>
        </div>
      )}
    </div>
  );
}
