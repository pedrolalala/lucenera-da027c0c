import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using CDN for v3.x
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export interface ExtractedItem {
  id: string;
  ordem: number;
  id_lote: string;
  local: string;
  codigo_produto: string;
  referencia: string;
  descricao: string;
  marca: string;
  quantidade: number;
}

interface ProcessingState {
  fileName: string;
  progress: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
  itemsFound: number;
}

interface TextItem {
  str: string;
  transform: number[]; // [scaleX, skewX, skewY, scaleY, x, y]
}

// --- Coordinate-based PDF table extraction ---

const Y_TOLERANCE = 5; // px tolerance for same row
const COLUMN_TOLERANCE = 40; // px tolerance for column matching

/** Group text items into rows by Y coordinate, sorted top-to-bottom, left-to-right */
function groupIntoRows(textItems: TextItem[]): TextItem[][] {
  const rowMap = new Map<number, TextItem[]>();

  for (const item of textItems) {
    if (!item.str.trim()) continue;
    const y = Math.round(item.transform[5] / Y_TOLERANCE) * Y_TOLERANCE;
    if (!rowMap.has(y)) rowMap.set(y, []);
    rowMap.get(y)!.push(item);
  }

  return Array.from(rowMap.entries())
    .sort((a, b) => b[0] - a[0]) // descending Y = top to bottom
    .map(([, items]) => items.sort((a, b) => a.transform[4] - b.transform[4]));
}

/** Build a simple text string from a row */
function rowToText(row: TextItem[]): string {
  return row.map(i => i.str.trim()).filter(Boolean).join(' ');
}

/** Detect known column headers and return their X positions, including Qtde if present */
function detectHeaderColumns(rows: TextItem[][]): { headerRowIdx: number; columns: Record<string, number>; qtdeX?: number; brandXPositions: { name: string; x: number }[] } | null {
  for (let idx = 0; idx < rows.length; idx++) {
    const text = rowToText(rows[idx]).toLowerCase();
    if (text.includes('id') && (text.includes('descri') || text.includes('referencia') || text.includes('codigo'))) {
      const columns: Record<string, number> = {};
      let qtdeX: number | undefined;
      const brandXPositions: { name: string; x: number }[] = [];

      for (const item of rows[idx]) {
        const label = item.str.trim().toLowerCase();
        if (label === 'id') columns['id'] = item.transform[4];
        else if (label === 'codigo' || label === 'código') columns['local'] = item.transform[4];
        else if (label === 'referencia' || label === 'referência') columns['referencia'] = item.transform[4];
        else if (label.startsWith('descri')) columns['descricao'] = item.transform[4];
        else if (label === 'qtde' || label === 'qtd' || label === 'quantidade') {
          qtdeX = item.transform[4];
        } else if (label.length >= 3 && !['id', 'codigo', 'código', 'referencia', 'referência'].includes(label) && !label.startsWith('descri')) {
          brandXPositions.push({ name: item.str.trim(), x: item.transform[4] });
        }
      }
      if (Object.keys(columns).length >= 2) {
        return { headerRowIdx: idx, columns, qtdeX, brandXPositions };
      }
    }
  }
  return null;
}

/** Detect a SEPARATE Qtde header row (for split-header PDFs) */
function detectSeparateQtdeHeader(rows: TextItem[][], skipIdx: number): { headerRowIdx: number; qtdeX: number; brandXPositions: { name: string; x: number }[] } | null {
  for (let idx = 0; idx < rows.length; idx++) {
    if (idx === skipIdx) continue;
    const text = rowToText(rows[idx]).toLowerCase();
    if (text.includes('qtde') || text.includes('qtd')) {
      let qtdeX = 0;
      const brands: { name: string; x: number }[] = [];
      for (const item of rows[idx]) {
        const label = item.str.trim().toLowerCase();
        if (label === 'qtde' || label === 'qtd') {
          qtdeX = item.transform[4];
        } else if (label.length >= 3 && !['id', 'codigo', 'código', 'referencia', 'referência'].includes(label) && !label.startsWith('descri')) {
          brands.push({ name: item.str.trim(), x: item.transform[4] });
        }
      }
      if (qtdeX > 0) {
        return { headerRowIdx: idx, qtdeX, brandXPositions: brands };
      }
    }
  }
  return null;
}

/** Assign a text item to the closest column */
function assignToColumn(x: number, columns: Record<string, number>): string {
  let closest = '';
  let minDist = Infinity;
  for (const [name, colX] of Object.entries(columns)) {
    const dist = Math.abs(x - colX);
    if (dist < minDist && dist < COLUMN_TOLERANCE) {
      minDist = dist;
      closest = name;
    }
  }
  return closest;
}

/** Main parser: extract items from PDF text items using coordinates */
function parseItemsFromTextItems(allPageItems: TextItem[][]): Omit<ExtractedItem, 'id' | 'ordem'>[] {
  const items: Omit<ExtractedItem, 'id' | 'ordem'>[] = [];

  for (const pageItems of allPageItems) {
    const rows = groupIntoRows(pageItems);

    // 1. Detect main data header (ID | Codigo | Referencia | Descricao | possibly Qtde)
    const mainHeader = detectHeaderColumns(rows);
    if (!mainHeader) {
      console.log('[PDF] No table header found on page, trying line-based fallback');
      items.push(...parseLineBasedFallback(rows));
      continue;
    }

    const hasQtdeInMainHeader = mainHeader.qtdeX !== undefined;
    console.log('[PDF] Main header detected at row', mainHeader.headerRowIdx,
      '| columns:', Object.keys(mainHeader.columns),
      '| qtdeInSameRow:', hasQtdeInMainHeader);

    // 2. Check for a SEPARATE Qtde header row (split-header PDFs)
    const separateQtdeHeader = hasQtdeInMainHeader
      ? null
      : detectSeparateQtdeHeader(rows, mainHeader.headerRowIdx);

    // 3. Determine data row range
    const dataStartIdx = mainHeader.headerRowIdx + 1;
    const dataEndIdx = separateQtdeHeader
      ? separateQtdeHeader.headerRowIdx
      : rows.length;

    // Build column map including qtde if in same header
    const allColumns = { ...mainHeader.columns };
    if (hasQtdeInMainHeader && mainHeader.qtdeX !== undefined) {
      allColumns['qtde'] = mainHeader.qtdeX;
    }

    // 4. Extract data rows
    const stopWords = ['data orçamento', 'previsão', 'conferido', 'assumo', 'responsabilidade', 'telefone', 'vendedor', 'bairro', 'cidade'];
    const dataRows: Record<string, string>[] = [];
    for (let i = dataStartIdx; i < dataEndIdx; i++) {
      const row = rows[i];
      const rowText = rowToText(row);
      if (!rowText) continue;
      const lower = rowText.toLowerCase();
      if (stopWords.some(w => lower.includes(w))) continue;

      const record: Record<string, string> = {};
      for (const item of row) {
        const col = assignToColumn(item.transform[4], allColumns);
        if (col) {
          record[col] = record[col] ? `${record[col]} ${item.str.trim()}` : item.str.trim();
        }
      }
      // Only accept rows that have at least an ID or referencia
      if (record['id'] || record['referencia']) {
        dataRows.push(record);
      }
    }

    console.log('[PDF] Found', dataRows.length, 'data rows');

    // 5. Handle quantities and brands from SEPARATE qtde section (if exists)
    const quantities: number[] = [];
    const brands: string[] = [];

    if (separateQtdeHeader) {
      for (let i = separateQtdeHeader.headerRowIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        const rowText = rowToText(row).toLowerCase();
        if (rowText.includes('conferido') || rowText.includes('assumo') || rowText.includes('responsabilidade')) break;

        for (const item of row) {
          const val = item.str.trim();
          if (!val) continue;

          const distToQtde = Math.abs(item.transform[4] - separateQtdeHeader.qtdeX);
          if (distToQtde < COLUMN_TOLERANCE) {
            const num = parseFloat(val.replace(',', '.'));
            if (!isNaN(num)) quantities.push(num);
          } else {
            for (const brand of separateQtdeHeader.brandXPositions) {
              if (Math.abs(item.transform[4] - brand.x) < COLUMN_TOLERANCE && val.length >= 2) {
                brands.push(val);
              }
            }
          }
        }
      }
    }

    // 6. Build extracted items
    for (let i = 0; i < dataRows.length; i++) {
      const r = dataRows[i];

      // Parse quantity: from inline 'qtde' column or from separate section
      let qty = 1;
      if (r['qtde']) {
        const parsed = parseFloat(r['qtde'].replace(',', '.'));
        if (!isNaN(parsed)) qty = parsed;
      } else if (quantities[i] !== undefined) {
        qty = quantities[i];
      }

      const marca = brands[i] || '';

      items.push({
        id_lote: r['id'] || '',
        local: r['local'] || '',
        codigo_produto: r['referencia'] || '',
        referencia: r['referencia'] || '',
        descricao: r['descricao'] || '',
        marca,
        quantidade: qty,
      });
    }
  }

  return items;
}

/** Fallback line-based parser for PDFs without detectable headers */
function parseLineBasedFallback(rows: TextItem[][]): Omit<ExtractedItem, 'id' | 'ordem'>[] {
  const items: Omit<ExtractedItem, 'id' | 'ordem'>[] = [];

  for (const row of rows) {
    const text = rowToText(row);

    // Pattern: "ID LOCAL REFERENCIA DESCRICAO"
    const match = text.match(/^(\d{1,3})\s+(L\d+[A-Z]?)\s+(\d{5,})\s+(.+)$/i);
    if (match) {
      items.push({
        id_lote: match[1],
        local: match[2],
        codigo_produto: match[3],
        referencia: match[3],
        descricao: match[4],
        marca: '',
        quantidade: 1,
      });
    }
  }
  return items;
}

export function usePdfExtraction() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<ProcessingState[]>([]);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);

  // Extract raw text items with coordinates from a single PDF file
  const extractTextItemsFromPdf = async (file: File): Promise<TextItem[][]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const allPageItems: TextItem[][] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items = (textContent.items as any[])
        .filter(item => item.str !== undefined)
        .map(item => ({ str: item.str, transform: item.transform }));
      allPageItems.push(items);
    }

    return allPageItems;
  };

  // Process multiple PDF files
  const processPdfFiles = useCallback(async (files: File[]): Promise<ExtractedItem[]> => {
    setIsProcessing(true);
    setExtractedItems([]);

    const initialState: ProcessingState[] = files.map(f => ({
      fileName: f.name,
      progress: 0,
      status: 'pending',
      itemsFound: 0,
    }));
    setProcessingFiles(initialState);

    const allItems: ExtractedItem[] = [];
    let globalOrdem = 1;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProcessingFiles(prev => prev.map((p, idx) =>
        idx === i ? { ...p, status: 'processing', progress: 10 } : p
      ));

      try {
        setProcessingFiles(prev => prev.map((p, idx) =>
          idx === i ? { ...p, progress: 30 } : p
        ));

        const pageItems = await extractTextItemsFromPdf(file);

        // Debug: log reconstructed text for troubleshooting
        for (let p = 0; p < pageItems.length; p++) {
          const rows = groupIntoRows(pageItems[p]);
          console.log(`[PDF_DEBUG] Page ${p + 1} rows:`, rows.map(r => rowToText(r)));
        }

        setProcessingFiles(prev => prev.map((p, idx) =>
          idx === i ? { ...p, progress: 70 } : p
        ));

        const parsedItems = parseItemsFromTextItems(pageItems);

        const itemsWithIds: ExtractedItem[] = parsedItems.map(item => ({
          ...item,
          id: crypto.randomUUID(),
          ordem: globalOrdem++,
        }));

        allItems.push(...itemsWithIds);

        setProcessingFiles(prev => prev.map((p, idx) =>
          idx === i ? { ...p, status: 'done', progress: 100, itemsFound: itemsWithIds.length } : p
        ));
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        setProcessingFiles(prev => prev.map((p, idx) =>
          idx === i ? {
            ...p,
            status: 'error',
            progress: 100,
            error: error instanceof Error ? error.message : 'Erro ao processar PDF'
          } : p
        ));
      }
    }

    setExtractedItems(allItems);
    setIsProcessing(false);
    return allItems;
  }, []);

  const clearExtractedItems = useCallback(() => {
    setExtractedItems([]);
    setProcessingFiles([]);
  }, []);

  const updateItem = useCallback((id: string, field: keyof ExtractedItem, value: string | number) => {
    setExtractedItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }, []);

  const removeItem = useCallback((id: string) => {
    setExtractedItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      return filtered.map((item, index) => ({ ...item, ordem: index + 1 }));
    });
  }, []);

  const addManualItem = useCallback(() => {
    const newItem: ExtractedItem = {
      id: crypto.randomUUID(),
      ordem: extractedItems.length + 1,
      id_lote: '',
      local: '',
      codigo_produto: '',
      referencia: '',
      descricao: '',
      marca: '',
      quantidade: 1,
    };
    setExtractedItems(prev => [...prev, newItem]);
  }, [extractedItems.length]);

  return {
    isProcessing,
    processingFiles,
    extractedItems,
    setExtractedItems,
    processPdfFiles,
    clearExtractedItems,
    updateItem,
    removeItem,
    addManualItem,
  };
}
