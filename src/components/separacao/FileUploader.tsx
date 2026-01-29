import { useState, useRef, useCallback } from 'react';
import { FileText, Image, X, Upload, Loader2, ExternalLink } from 'lucide-react';

interface FileUploaderProps {
  type: 'pdf' | 'imagem';
  file: File | null;
  onFileChange: (file: File | null) => void;
  isUploading?: boolean;
  existingUrl?: string | null;
}

export function FileUploader({ type, file, onFileChange, isUploading, existingUrl }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = type === 'pdf' 
    ? '.pdf' 
    : '.jpg,.jpeg,.png,.pdf';
  
  const maxSize = type === 'pdf' ? 15 : 10; // MB

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const validateAndSetFile = (selectedFile: File) => {
    const sizeMB = selectedFile.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      alert(`Arquivo muito grande. Máximo: ${maxSize}MB`);
      return;
    }

    const validTypes = type === 'pdf'
      ? ['application/pdf']
      : ['image/jpeg', 'image/png', 'application/pdf'];

    if (!validTypes.includes(selectedFile.type)) {
      alert('Tipo de arquivo não suportado');
      return;
    }

    onFileChange(selectedFile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const removeFile = () => {
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)}MB` : `${(bytes / 1024).toFixed(0)}KB`;
  };

  // Show existing file from URL
  if (existingUrl && !file) {
    const isImage = existingUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const fileName = existingUrl.split('/').pop() || 'arquivo';

    return (
      <div className="border-2 border-dashed border-primary rounded-xl p-6 bg-primary-light/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-card flex items-center justify-center overflow-hidden">
            {isImage ? (
              <img
                src={existingUrl}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <FileText className="w-8 h-8 text-destructive" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{fileName}</p>
            <p className="text-sm text-muted-foreground">Arquivo atual</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={existingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-primary hover:bg-primary/10 rounded-full"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-sm text-primary hover:underline"
            >
              Substituir
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    );
  }

  // Show selected new file
  if (file) {
    return (
      <div className="border-2 border-dashed border-success rounded-xl p-6 bg-success-light/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-card flex items-center justify-center">
            {file.type === 'application/pdf' ? (
              <FileText className="w-8 h-8 text-destructive" />
            ) : (
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <button
              type="button"
              onClick={removeFile}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show upload area
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        border-3 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
        ${isDragging 
          ? 'border-primary bg-primary-light' 
          : 'border-border hover:border-primary hover:bg-muted/50'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleInputChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center gap-3">
        {type === 'pdf' ? (
          <FileText className="w-12 h-12 text-destructive" />
        ) : (
          <Image className="w-12 h-12 text-primary" />
        )}
        
        <div>
          <p className="font-medium text-foreground">
            {isDragging ? 'Solte o arquivo aqui' : 'Arraste aqui ou clique'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {type === 'pdf' ? 'Apenas PDF' : 'JPG, PNG ou PDF'} • Máximo {maxSize}MB
          </p>
        </div>

        <Upload className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
}
