import { useState } from 'react';
import { Clipboard, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TableItem } from './ItemsTableInput';

interface PasteListInputProps {
  onItemsParsed: (items: TableItem[]) => void;
}

export function PasteListInput({ onItemsParsed }: PasteListInputProps) {
  const [text, setText] = useState('');
  const [parsedItems, setParsedItems] = useState<TableItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const parseList = () => {
    setParseError(null);
    
    if (!text.trim()) {
      setParseError('Cole os dados da planilha no campo acima');
      return;
    }

    const lines = text.trim().split('\n').filter(line => line.trim());
    const items: TableItem[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      // Try to split by TAB first, then by multiple spaces
      let parts = line.split('\t');
      if (parts.length < 4) {
        parts = line.split(/\s{2,}/);
      }

      if (parts.length >= 4) {
        // Try to detect quantity (usually last numeric value)
        let quantidade = 1;
        let descricao = '';
        
        // Check if last part is a number
        const lastPart = parts[parts.length - 1].replace(',', '.').trim();
        const lastAsNumber = parseFloat(lastPart);
        
        if (!isNaN(lastAsNumber)) {
          quantidade = lastAsNumber;
          descricao = parts.slice(3, -1).join(' ').trim();
        } else {
          descricao = parts.slice(3).join(' ').trim();
        }

        items.push({
          id: crypto.randomUUID(),
          ordem: index + 1,
          id_lote: parts[0]?.trim() || '',
          codigo_produto: parts[1]?.trim() || '',
          referencia: parts[2]?.trim() || '',
          descricao: descricao || parts[3]?.trim() || '',
          quantidade,
        });
      } else if (parts.length >= 3) {
        // Minimal format: código, referência, descrição
        items.push({
          id: crypto.randomUUID(),
          ordem: index + 1,
          id_lote: '',
          codigo_produto: parts[0]?.trim() || '',
          referencia: parts[1]?.trim() || '',
          descricao: parts[2]?.trim() || '',
          quantidade: 1,
        });
      } else {
        errors.push(`Linha ${index + 1}: formato inválido`);
      }
    });

    if (items.length === 0) {
      setParseError('Não foi possível identificar itens. Verifique o formato dos dados.');
      return;
    }

    if (errors.length > 0 && errors.length < lines.length) {
      setParseError(`Atenção: ${errors.length} linha(s) ignorada(s) por formato inválido`);
    }

    setParsedItems(items);
    setShowPreview(true);
  };

  const confirmItems = () => {
    onItemsParsed(parsedItems);
    setText('');
    setParsedItems([]);
    setShowPreview(false);
  };

  const cancelPreview = () => {
    setShowPreview(false);
    setParsedItems([]);
  };

  return (
    <div className="space-y-4">
      {!showPreview ? (
        <>
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Cole dados do Excel (separados por TAB):

L53\t011636\t3027-S-PM\tFINCO CLED 6W SPOT LED\t2
L54\t009815\tACS0043\tACESSORIO HOOD\t14`}
            className="min-h-[200px] font-mono text-sm"
          />
          
          {parseError && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {parseError}
            </div>
          )}

          <Button
            type="button"
            onClick={parseList}
            className="w-full h-12 bg-primary hover:bg-primary-dark"
          >
            <Clipboard className="w-4 h-4 mr-2" />
            Processar Lista
          </Button>
        </>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 font-semibold text-sm">
              Preview: {parsedItems.length} itens encontrados
            </div>
            <div className="max-h-[300px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Código</th>
                    <th className="p-2 text-left">Ref</th>
                    <th className="p-2 text-left">Descrição</th>
                    <th className="p-2 text-right">Qtde</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedItems.map((item, i) => (
                    <tr key={item.id} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                      <td className="p-2">{item.id_lote || '-'}</td>
                      <td className="p-2 font-medium">{item.codigo_produto}</td>
                      <td className="p-2">{item.referencia}</td>
                      <td className="p-2 max-w-xs truncate">{item.descricao}</td>
                      <td className="p-2 text-right font-bold">{item.quantidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={cancelPreview}
              className="flex-1 h-12"
            >
              Corrigir
            </Button>
            <Button
              type="button"
              onClick={confirmItems}
              className="flex-1 h-12 bg-success hover:bg-success-dark"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar {parsedItems.length} itens
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
