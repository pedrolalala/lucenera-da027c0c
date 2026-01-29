import { useState } from 'react';
import { ChevronDown, ChevronUp, Package, FileText, Image, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSeparacaoItens } from '@/hooks/useSeparacaoItens';

interface MaterialDisplayProps {
  separacaoId: string;
  materialTipo: string;
  materialConteudo: string;
}

export function MaterialDisplay({ separacaoId, materialTipo, materialConteudo }: MaterialDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { items, isLoading } = useSeparacaoItens(isExpanded && materialTipo === 'tabela' ? separacaoId : null);

  const renderBadge = () => {
    if (materialTipo === 'tabela') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-light text-primary text-sm font-medium">
          <Package className="w-4 h-4" />
          {items.length > 0 ? `${items.length} itens` : 'Itens'}
        </span>
      );
    }
    
    if (materialTipo === 'pdf') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
          <FileText className="w-4 h-4" />
          PDF
        </span>
      );
    }
    
    if (materialTipo === 'imagem') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-light text-primary text-sm font-medium">
          <Image className="w-4 h-4" />
          Imagem
        </span>
      );
    }

    // texto type
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
        <FileText className="w-4 h-4" />
        Texto
      </span>
    );
  };

  const renderExpandedContent = () => {
    if (materialTipo === 'tabela') {
      if (isLoading) {
        return (
          <div className="mt-4 p-4 bg-muted rounded-lg animate-pulse">
            <div className="h-4 bg-muted-foreground/20 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
          </div>
        );
      }

      if (items.length === 0) {
        return (
          <div className="mt-4 p-4 bg-muted rounded-lg text-center text-muted-foreground">
            Nenhum item encontrado
          </div>
        );
      }

      return (
        <div className="mt-4 border rounded-lg overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-xs uppercase font-bold">
                  <th className="p-2.5 text-left">ID</th>
                  <th className="p-2.5 text-left">Código</th>
                  <th className="p-2.5 text-left">Referência</th>
                  <th className="p-2.5 text-left">Descrição</th>
                  <th className="p-2.5 text-right">Qtde</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={item.id}
                    className={`border-t ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}
                  >
                    <td className="p-2.5">{item.id_lote || '-'}</td>
                    <td className="p-2.5 font-medium">{item.codigo_produto}</td>
                    <td className="p-2.5">{item.referencia}</td>
                    <td className="p-2.5 max-w-[200px] truncate">{item.descricao}</td>
                    <td className="p-2.5 text-right font-bold">{Number(item.quantidade).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 border-t">
                  <td colSpan={4} className="p-2.5 text-right font-bold text-xs uppercase">
                    Total de itens:
                  </td>
                  <td className="p-2.5 text-right font-bold">{items.length}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      );
    }

    if (materialTipo === 'pdf' || materialTipo === 'imagem') {
      return (
        <div className="mt-4 p-4 bg-muted rounded-lg animate-fade-in">
          {materialTipo === 'imagem' && materialConteudo && (
            <img
              src={materialConteudo}
              alt="Material"
              className="max-w-full max-h-64 rounded-lg mb-3 mx-auto"
            />
          )}
          {materialConteudo && (
            <a
              href={materialConteudo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Visualizar arquivo
            </a>
          )}
        </div>
      );
    }

    // texto type
    if (materialConteudo) {
      return (
        <div className="mt-4 p-4 bg-muted rounded-lg animate-fade-in">
          <pre className="text-sm whitespace-pre-wrap font-sans text-secondary-foreground">
            {materialConteudo}
          </pre>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">Material</span>
          {renderBadge()}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary hover:text-primary-dark"
        >
          {isExpanded ? (
            <>
              Recolher
              <ChevronUp className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              Ver Detalhes
              <ChevronDown className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>

      {isExpanded && renderExpandedContent()}
    </div>
  );
}
