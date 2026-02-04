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

export function usePdfExtraction() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<ProcessingState[]>([]);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);

  // Parse text from PDF to extract structured data
  // Supports multiple PDF formats from Luce Nera separação system
  const parseTextToItems = (text: string): Omit<ExtractedItem, 'id' | 'ordem'>[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const items: Omit<ExtractedItem, 'id' | 'ordem'>[] = [];
    
    // First, try to find quantities (usually in a separate column/section)
    const quantidades: number[] = [];
    const marcas: string[] = [];
    
    for (const linha of lines) {
      // Match standalone quantities like "2,00" or "1,00"
      const matchQtde = linha.match(/^([\d]+[,.][\d]{2})$/);
      if (matchQtde) {
        quantidades.push(parseFloat(matchQtde[1].replace(',', '.')));
      }
      
      // Capture potential brand names (all caps, common patterns)
      if (linha.match(/^[A-Z]{3,}$/) && !linha.match(/^(ID|QTD|QTDE|LOCAL|CODIGO|DESCRICAO|MARCA|REFERENCIA)$/i)) {
        marcas.push(linha);
      }
    }

    let itemIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const linha = lines[i];

      // Pattern 1: Table format - "ID LOCAL REFERENCIA DESCRICAO"
      // Example: "1 L28 009988 EKPF22 - PERFIL PARA FITA LED COM DIFUSOR"
      // ID is 1-3 digits, Local is L + digits, Referencia is digits, rest is description
      const matchTableRow = linha.match(/^(\d{1,3})\s+(L\d+[A-Z]?)\s+(\d{5,})\s+(.+)$/i);
      
      if (matchTableRow) {
        const ordem_pdf = matchTableRow[1];
        const local = matchTableRow[2];
        const referencia = matchTableRow[3];
        const descricao = matchTableRow[4];
        
        // Get quantity from collected quantities or default to 1
        const quantidade = quantidades[itemIndex] || 1;
        // Get brand from collected brands or empty
        const marca = marcas[itemIndex] || '';
        
        items.push({
          id_lote: ordem_pdf,
          local,
          codigo_produto: referencia,
          referencia,
          descricao,
          marca,
          quantidade,
        });
        
        itemIndex++;
        continue;
      }

      // Pattern 2: Legacy format - ID (6 digits) + Local (L + number)
      // Example: "011248 L28" or "011248  L28A"
      const matchIdLocal = linha.match(/^(\d{6})\s+(L\d+[A-Z]?)/i);

      if (matchIdLocal) {
        const id_lote = matchIdLocal[1];
        const local = matchIdLocal[2];

        // Next line: Código + Quantidade + Número + Descrição
        if (i + 1 < lines.length) {
          const linhaDetalhes = lines[i + 1];
          const matchDetalhes = linhaDetalhes.match(/^(\S+)\s+([\d,\.]+)\s+(\d+)\s+(.+)$/);

          if (matchDetalhes) {
            const codigo_produto = matchDetalhes[1];
            const quantidade = parseFloat(matchDetalhes[2].replace(',', '.'));
            const descricao = matchDetalhes[4];

            let marca = '';
            if (i + 2 < lines.length) {
              const linhaMarca = lines[i + 2];
              if (!linhaMarca.match(/^\d{6}\s+L\d+/i) && !linhaMarca.match(/^\d{1,3}\s+L\d+/i)) {
                marca = linhaMarca.trim();
              }
            }

            items.push({
              id_lote,
              local,
              codigo_produto,
              referencia: codigo_produto,
              descricao,
              marca,
              quantidade: isNaN(quantidade) ? 1 : quantidade,
            });

            i += 2;
            continue;
          }
        }
      }

      // Pattern 3: Alternative inline format - "ID LOCAL CODIGO QTD DESCRICAO"
      const matchAlternative = linha.match(/^(\d{6})\s+(L\d+[A-Z]?)\s+(\S+)\s+([\d,\.]+)\s+(.+)$/i);
      if (matchAlternative) {
        items.push({
          id_lote: matchAlternative[1],
          local: matchAlternative[2],
          codigo_produto: matchAlternative[3],
          referencia: matchAlternative[3],
          quantidade: parseFloat(matchAlternative[4].replace(',', '.')) || 1,
          descricao: matchAlternative[5],
          marca: '',
        });
        continue;
      }

      // Pattern 4: Simple format without local - "CODIGO QTD DESCRICAO"
      const matchSimple = linha.match(/^([A-Z0-9\/-]+)\s+([\d,\.]+)\s+(.+)$/i);
      if (matchSimple && matchSimple[1].length >= 5) {
        items.push({
          id_lote: '',
          local: '',
          codigo_produto: matchSimple[1],
          referencia: matchSimple[1],
          quantidade: parseFloat(matchSimple[2].replace(',', '.')) || 1,
          descricao: matchSimple[3],
          marca: '',
        });
      }
    }

    return items;
  };

  // Extract text from a single PDF file
  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Sort items by vertical position (y) then horizontal (x) for proper reading order
      const items = textContent.items as any[];
      const sortedItems = items
        .filter(item => item.str && item.str.trim())
        .sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5]; // Descending Y (top to bottom)
          if (Math.abs(yDiff) > 5) return yDiff;
          return a.transform[4] - b.transform[4]; // Ascending X (left to right)
        });

      // Group items by Y position to reconstruct lines
      let lastY: number | null = null;
      let currentLine = '';

      for (const item of sortedItems) {
        const y = Math.round(item.transform[5]);
        
        if (lastY === null || Math.abs(y - lastY) < 5) {
          currentLine += (currentLine ? ' ' : '') + item.str;
        } else {
          if (currentLine.trim()) {
            fullText += currentLine.trim() + '\n';
          }
          currentLine = item.str;
        }
        lastY = y;
      }

      if (currentLine.trim()) {
        fullText += currentLine.trim() + '\n';
      }
      fullText += '\n'; // Page separator
    }

    return fullText;
  };

  // Process multiple PDF files
  const processPdfFiles = useCallback(async (files: File[]): Promise<ExtractedItem[]> => {
    setIsProcessing(true);
    setExtractedItems([]);
    
    // Initialize processing state for each file
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

      // Update status to processing
      setProcessingFiles(prev => prev.map((p, idx) => 
        idx === i ? { ...p, status: 'processing', progress: 10 } : p
      ));

      try {
        // Extract text
        setProcessingFiles(prev => prev.map((p, idx) => 
          idx === i ? { ...p, progress: 30 } : p
        ));
        
        const text = await extractTextFromPdf(file);

        // Parse items
        setProcessingFiles(prev => prev.map((p, idx) => 
          idx === i ? { ...p, progress: 70 } : p
        ));

        const parsedItems = parseTextToItems(text);

        // Add IDs and ordem
        const itemsWithIds: ExtractedItem[] = parsedItems.map(item => ({
          ...item,
          id: crypto.randomUUID(),
          ordem: globalOrdem++,
        }));

        allItems.push(...itemsWithIds);

        // Update status to done
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
