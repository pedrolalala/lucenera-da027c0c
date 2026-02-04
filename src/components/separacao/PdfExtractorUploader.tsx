import { useState, useRef, useCallback, useEffect } from 'react';
import { FileText, Upload, X, Loader2, CheckCircle, AlertCircle, Plus, Trash2, Pencil, RefreshCw, Package, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { usePdfExtraction, ExtractedItem } from '@/hooks/usePdfExtraction';
import { TableItem } from './ItemsTableInput';

interface PdfExtractorUploaderProps {
  onItemsExtracted: (items: TableItem[]) => void;
  existingItems?: TableItem[];
}

export function PdfExtractorUploader({ onItemsExtracted, existingItems = [] }: PdfExtractorUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isProcessing,
    processingFiles,
    extractedItems,
    setExtractedItems,
    processPdfFiles,
    clearExtractedItems,
    updateItem,
    removeItem,
    addManualItem,
  } = usePdfExtraction();

  // Initialize with existing items if any
  useEffect(() => {
    if (existingItems.length > 0 && extractedItems.length === 0) {
      const converted: ExtractedItem[] = existingItems.map(item => ({
        id: item.id,
        ordem: item.ordem,
        id_lote: item.id_lote || '',
        local: (item as any).local || '',
        codigo_produto: item.codigo_produto,
        referencia: item.referencia,
        descricao: item.descricao,
        marca: (item as any).marca || '',
        quantidade: item.quantidade,
      }));
      setExtractedItems(converted);
    }
  }, [existingItems]);

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

    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (files.length > 0) {
      processPdfFiles(files);
    }
  }, [processPdfFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type === 'application/pdf');
    if (files.length > 0) {
      processPdfFiles(files);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleReprocess = () => {
    inputRef.current?.click();
  };

  const handleConfirm = () => {
    // Convert ExtractedItem[] to TableItem[] for compatibility
    const tableItems: TableItem[] = extractedItems.map(item => ({
      id: item.id,
      ordem: item.ordem,
      id_lote: item.id_lote,
      codigo_produto: item.codigo_produto,
      referencia: item.referencia,
      descricao: item.descricao,
      quantidade: item.quantidade,
      // Additional fields passed through
      local: item.local,
      marca: item.marca,
    } as TableItem));
    onItemsExtracted(tableItems);
  };

  const handleExportCsv = () => {
    const headers = ['Ordem', 'ID Lote', 'Local', 'Código', 'Referência', 'Descrição', 'Marca', 'Quantidade'];
    const rows = extractedItems.map(item => [
      item.ordem,
      item.id_lote,
      item.local,
      item.codigo_produto,
      item.referencia,
      item.descricao,
      item.marca,
      item.quantidade,
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `itens_extraidos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filter items based on search
  const filteredItems = searchQuery
    ? extractedItems.filter(item =>
        item.codigo_produto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.marca.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : extractedItems;

  const totalItemsFound = processingFiles.reduce((sum, f) => sum + f.itemsFound, 0);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {extractedItems.length === 0 && !isProcessing && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'h-[200px] border-[3px] border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all',
            isDragging
              ? 'border-amber-500 bg-amber-50'
              : 'border-border hover:border-amber-500 hover:bg-amber-50/50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <FileText className="w-14 h-14 text-amber-500" />
          <div className="text-center">
            <p className="font-semibold text-foreground text-lg">
              {isDragging ? 'Solte os PDFs aqui' : 'Arraste PDFs ou clique para selecionar'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Apenas arquivos PDF • Dados serão extraídos automaticamente
            </p>
          </div>
          <Upload className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            <h4 className="text-lg font-semibold text-amber-800">Processando PDFs...</h4>
          </div>

          <div className="space-y-3">
            {processingFiles.map((file, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <FileText className={cn(
                    'w-6 h-6',
                    file.status === 'done' ? 'text-green-500' :
                    file.status === 'error' ? 'text-red-500' :
                    'text-amber-500'
                  )} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{file.fileName}</p>
                    {file.status === 'processing' && (
                      <p className="text-xs text-muted-foreground">Extraindo dados...</p>
                    )}
                    {file.status === 'done' && (
                      <p className="text-xs text-green-600">
                        ✓ {file.itemsFound} itens encontrados
                      </p>
                    )}
                    {file.status === 'error' && (
                      <p className="text-xs text-red-600">{file.error}</p>
                    )}
                  </div>
                  {file.status === 'done' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {file.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
                {file.status === 'processing' && (
                  <Progress value={file.progress} className="h-1.5 mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Items Preview */}
      {extractedItems.length > 0 && !isProcessing && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">
                  Dados Extraídos dos PDFs
                </h4>
                <p className="text-sm text-green-600">
                  {extractedItems.length} itens encontrados • Revise antes de confirmar
                </p>
              </div>
            </div>
            <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {extractedItems.length} itens
            </span>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Buscar por código ou descrição..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={addManualItem}
                className="text-primary border-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReprocess}
                className="text-amber-600 border-amber-400"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reprocessar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleExportCsv}
                className="text-green-600 border-green-400"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                    <th className="p-3 text-left w-12">#</th>
                    <th className="p-3 text-left w-20">ID</th>
                    <th className="p-3 text-left w-16">Local</th>
                    <th className="p-3 text-left w-32">Código</th>
                    <th className="p-3 text-right w-16">Qtde</th>
                    <th className="p-3 text-left">Descrição</th>
                    <th className="p-3 text-left w-24">Marca</th>
                    <th className="p-3 text-center w-20">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className={cn(
                        'border-t transition-colors',
                        index % 2 === 0 ? 'bg-card' : 'bg-muted/30',
                        editingId === item.id && 'bg-primary-light/50'
                      )}
                    >
                      <td className="p-3 text-sm text-muted-foreground">{item.ordem}</td>
                      <td className="p-3">
                        {editingId === item.id ? (
                          <Input
                            value={item.id_lote}
                            onChange={e => updateItem(item.id, 'id_lote', e.target.value)}
                            className="h-8 w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{item.id_lote || '-'}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {editingId === item.id ? (
                          <Input
                            value={item.local}
                            onChange={e => updateItem(item.id, 'local', e.target.value)}
                            className="h-8 w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm font-medium text-amber-600">{item.local || '-'}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {editingId === item.id ? (
                          <Input
                            value={item.codigo_produto}
                            onChange={e => updateItem(item.id, 'codigo_produto', e.target.value)}
                            className="h-8 w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm font-semibold">{item.codigo_produto}</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={item.quantidade}
                            onChange={e => updateItem(item.id, 'quantidade', parseFloat(e.target.value) || 0)}
                            className="h-8 w-20 text-sm text-right"
                          />
                        ) : (
                          <span className="text-sm font-bold">{item.quantidade.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {editingId === item.id ? (
                          <Input
                            value={item.descricao}
                            onChange={e => updateItem(item.id, 'descricao', e.target.value)}
                            className="h-8 w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm max-w-xs truncate block">{item.descricao}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {editingId === item.id ? (
                          <Input
                            value={item.marca}
                            onChange={e => updateItem(item.id, 'marca', e.target.value)}
                            className="h-8 w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">{item.marca || '-'}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                            className={cn(
                              "p-1.5 rounded transition-colors",
                              editingId === item.id
                                ? "bg-primary text-primary-foreground"
                                : "text-primary hover:bg-primary-light"
                            )}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted border-t">
                    <td colSpan={4} className="p-3 text-right font-bold text-sm">
                      Total de itens:
                    </td>
                    <td className="p-3 text-right font-bold text-sm">
                      {extractedItems.reduce((sum, i) => sum + i.quantidade, 0).toFixed(2)}
                    </td>
                    <td colSpan={2} className="p-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="font-bold">{extractedItems.length} itens</span>
                      </div>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={clearExtractedItems}
              className="text-destructive border-destructive/50"
            >
              <X className="w-4 h-4 mr-2" />
              Descartar Tudo
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[200px]"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar {extractedItems.length} Itens
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
