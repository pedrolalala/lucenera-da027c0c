import { useState, useRef, useCallback } from 'react';
import { Paperclip, FileText, Image, X, Eye, Expand, GripVertical, Plus, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface FileItem {
  id: string;
  file?: File;
  nome_arquivo: string;
  tipo_arquivo: 'pdf' | 'imagem';
  tamanho_bytes: number;
  ordem: number;
  url_arquivo?: string;
  status: 'existing' | 'pending' | 'uploading' | 'uploaded' | 'error';
  progress: number;
  error?: string;
  markedForDeletion?: boolean;
}

interface MultiFileUploaderProps {
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const MAX_SIZE_MB = 15;
const MAX_FILES = 20;

export function MultiFileUploader({
  files,
  onFilesChange,
  maxFiles = MAX_FILES,
  maxSizeMB = MAX_SIZE_MB,
}: MultiFileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleFiles = files.filter(f => !f.markedForDeletion);

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

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [files]);

  const processFiles = (selectedFiles: File[]) => {
    const remainingSlots = maxFiles - visibleFiles.length;
    if (remainingSlots <= 0) {
      alert(`Máximo de ${maxFiles} arquivos por separação`);
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    const newFiles: FileItem[] = [];
    const errors: string[] = [];

    filesToAdd.forEach((file, index) => {
      const sizeMB = file.size / (1024 * 1024);
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];

      if (!validExtensions.includes(extension)) {
        errors.push(`${file.name}: formato não suportado`);
        return;
      }

      if (sizeMB > maxSizeMB) {
        errors.push(`${file.name}: excede ${maxSizeMB}MB`);
        return;
      }

      const tipoArquivo: 'pdf' | 'imagem' = extension === 'pdf' ? 'pdf' : 'imagem';
      const ordem = visibleFiles.length + newFiles.length + 1;

      newFiles.push({
        id: `new-${Date.now()}-${index}`,
        file,
        nome_arquivo: file.name,
        tipo_arquivo: tipoArquivo,
        tamanho_bytes: file.size,
        ordem,
        status: 'pending',
        progress: 0,
      });
    });

    if (errors.length > 0) {
      alert(`Erros:\n${errors.join('\n')}`);
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;

    if (file.status === 'existing') {
      // Mark for deletion instead of removing
      onFilesChange(files.map(f => 
        f.id === id ? { ...f, markedForDeletion: true } : f
      ));
    } else {
      // Remove from list
      const updatedFiles = files.filter(f => f.id !== id);
      // Reorder remaining
      const reordered = updatedFiles.map((f, i) => ({
        ...f,
        ordem: i + 1,
      }));
      onFilesChange(reordered);
    }
  };

  const handleViewFile = (file: FileItem) => {
    const url = file.url_arquivo || (file.file ? URL.createObjectURL(file.file) : null);
    if (!url) return;

    if (file.tipo_arquivo === 'pdf') {
      window.open(url, '_blank');
    } else {
      setImagePreview(url);
    }
  };

  // Drag and drop reordering
  const handleFileDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFileDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId === targetId || !draggedId) return;

    const draggedIndex = visibleFiles.findIndex(f => f.id === draggedId);
    const targetIndex = visibleFiles.findIndex(f => f.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const reordered = [...files];
    const draggedFile = reordered.find(f => f.id === draggedId);
    const targetFile = reordered.find(f => f.id === targetId);

    if (draggedFile && targetFile) {
      const tempOrdem = draggedFile.ordem;
      draggedFile.ordem = targetFile.ordem;
      targetFile.ordem = tempOrdem;
    }

    onFilesChange(reordered);
  };

  const handleFileDragEnd = () => {
    setDraggedId(null);
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const sortedVisibleFiles = [...visibleFiles].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'h-[180px] border-[3px] border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary hover:bg-muted/50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        <Paperclip className="w-12 h-12 text-primary" />
        <div className="text-center">
          <p className="font-medium text-foreground">
            {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            PDFs e Imagens • Máximo {maxSizeMB}MB por arquivo
          </p>
        </div>
      </div>

      {/* Files List */}
      {sortedVisibleFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Arquivos Anexados</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {sortedVisibleFiles.length} arquivo{sortedVisibleFiles.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            {sortedVisibleFiles.map((file) => (
              <div
                key={file.id}
                draggable={file.status !== 'uploading'}
                onDragStart={(e) => handleFileDragStart(e, file.id)}
                onDragOver={(e) => handleFileDragOver(e, file.id)}
                onDragEnd={handleFileDragEnd}
                className={cn(
                  'flex items-center gap-4 p-4 bg-background border rounded-lg shadow-sm transition-all',
                  draggedId === file.id && 'opacity-50 shadow-lg',
                  file.status === 'error' && 'border-destructive bg-destructive/5'
                )}
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* File Icon/Thumbnail */}
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {file.tipo_arquivo === 'pdf' ? (
                    <FileText className="w-6 h-6 text-red-500" />
                  ) : file.url_arquivo || file.file ? (
                    <img
                      src={file.url_arquivo || (file.file ? URL.createObjectURL(file.file) : '')}
                      alt={file.nome_arquivo}
                      className="w-10 h-10 object-cover"
                    />
                  ) : (
                    <Image className="w-6 h-6 text-primary" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {file.nome_arquivo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.tamanho_bytes)}
                  </p>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-1" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enviando... {file.progress}%
                      </p>
                    </div>
                  )}

                  {/* Status indicators */}
                  {file.status === 'uploaded' && (
                    <div className="flex items-center gap-1 mt-1">
                      <Check className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">Enviado</span>
                    </div>
                  )}

                  {file.status === 'error' && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-destructive" />
                      <span className="text-xs text-destructive">{file.error || 'Erro'}</span>
                    </div>
                  )}

                  {file.status === 'pending' && !file.url_arquivo && (
                    <span className="text-xs text-amber-600 mt-1">Novo arquivo</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {(file.url_arquivo || file.file) && file.status !== 'uploading' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewFile(file)}
                      className="h-8 px-2 text-primary border-primary/30 hover:bg-primary/10"
                    >
                      {file.tipo_arquivo === 'pdf' ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <Expand className="w-4 h-4" />
                      )}
                    </Button>
                  )}

                  {file.status !== 'uploading' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="h-8 px-2 text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}

                  {file.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add More Button */}
          {visibleFiles.length < maxFiles && (
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              className="w-full h-12 border-2 border-dashed border-primary text-primary hover:bg-primary/5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Mais Arquivos
            </Button>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
