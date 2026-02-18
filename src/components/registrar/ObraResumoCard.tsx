import { useState, useEffect } from 'react';
import { Check, MapPin, User, Phone, Package, Paperclip, FileText, Image, Eye, Expand, ChevronDown, ChevronUp, AlertTriangle, Star } from 'lucide-react';
import { Separacao } from '@/hooks/useSeparacoes';
import { useSeparacaoItens } from '@/hooks/useSeparacaoItens';
import { useSeparacaoArquivos, SeparacaoArquivo } from '@/hooks/useSeparacaoArquivos';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ObraResumoCardProps {
  separacao: Separacao;
}

export function ObraResumoCard({ separacao }: ObraResumoCardProps) {
  const [showAllMaterial, setShowAllMaterial] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { items } = useSeparacaoItens(separacao.material_tipo === 'tabela' ? separacao.id : null);
  const { fetchArquivos } = useSeparacaoArquivos();
  const [arquivos, setArquivos] = useState<SeparacaoArquivo[]>([]);

  useEffect(() => {
    if (separacao.material_tipo === 'arquivos' || separacao.material_tipo === 'pdf' || separacao.material_tipo === 'imagem') {
      loadArquivos();
    }
  }, [separacao.id, separacao.material_tipo]);

  const loadArquivos = async () => {
    const files = await fetchArquivos(separacao.id);
    setArquivos(files);
  };

  const handleCall = () => {
    window.open(`tel:${separacao.telefone.replace(/\D/g, '')}`, '_self');
  };

  const renderMaterialContent = () => {
    if (separacao.material_tipo === 'tabela') {
      const displayItems = showAllMaterial ? items : items.slice(0, 5);
      return (
        <div className="space-y-2">
          {items.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{items.length} itens</span>
              </div>
              <div className="space-y-1">
                {displayItems.map((item) => (
                  <div key={item.id} className="text-xs bg-muted/50 rounded px-2 py-1.5 flex justify-between">
                    <span className="truncate flex-1">{item.codigo_produto} - {item.descricao}</span>
                    <span className="font-semibold ml-2">{Number(item.quantidade).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              {items.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllMaterial(!showAllMaterial)}
                  className="w-full text-primary text-xs h-7"
                >
                  {showAllMaterial ? (
                    <>Mostrar menos <ChevronUp className="w-3 h-3 ml-1" /></>
                  ) : (
                    <>+ {items.length - 5} itens <ChevronDown className="w-3 h-3 ml-1" /></>
                  )}
                </Button>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Carregando itens...</p>
          )}
        </div>
      );
    }

    if (separacao.material_tipo === 'arquivos' || separacao.material_tipo === 'pdf' || separacao.material_tipo === 'imagem') {
      // Check new arquivos table first
      if (arquivos.length > 0) {
        const displayFiles = showAllMaterial ? arquivos : arquivos.slice(0, 3);
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{arquivos.length} arquivo{arquivos.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2">
              {displayFiles.map((arquivo) => (
                <div key={arquivo.id} className="flex items-center gap-2 bg-muted/50 rounded p-2">
                  {arquivo.tipo_arquivo === 'pdf' ? (
                    <FileText className="w-4 h-4 text-red-500" />
                  ) : (
                    <Image className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-xs truncate flex-1">{arquivo.nome_arquivo}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (arquivo.tipo_arquivo === 'pdf') {
                        window.open(arquivo.url_arquivo, '_blank');
                      } else {
                        setImagePreview(arquivo.url_arquivo);
                      }
                    }}
                    className="h-6 w-6 p-0 text-primary"
                  >
                    {arquivo.tipo_arquivo === 'pdf' ? <Eye className="w-3 h-3" /> : <Expand className="w-3 h-3" />}
                  </Button>
                </div>
              ))}
            </div>
            {arquivos.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllMaterial(!showAllMaterial)}
                className="w-full text-primary text-xs h-7"
              >
                {showAllMaterial ? (
                  <>Mostrar menos <ChevronUp className="w-3 h-3 ml-1" /></>
                ) : (
                  <>+ {arquivos.length - 3} arquivos <ChevronDown className="w-3 h-3 ml-1" /></>
                )}
              </Button>
            )}
          </div>
        );
      }

      // Fallback to old materialConteudo
      if (separacao.material_conteudo) {
        return (
          <div className="space-y-2">
            {separacao.material_tipo === 'imagem' ? (
              <img
                src={separacao.material_conteudo}
                alt="Material"
                className="max-w-full max-h-32 rounded cursor-pointer"
                onClick={() => setImagePreview(separacao.material_conteudo)}
              />
            ) : (
              <a
                href={separacao.material_conteudo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Ver arquivo
              </a>
            )}
          </div>
        );
      }

      return <p className="text-sm text-muted-foreground">Nenhum arquivo</p>;
    }

    // texto type or fallback
    if (separacao.material_conteudo) {
      return (
        <pre className="text-sm text-secondary-foreground whitespace-pre-wrap font-sans">
          {separacao.material_conteudo}
        </pre>
      );
    }

    return <p className="text-sm text-muted-foreground">Sem material</p>;
  };

  return (
    <>
      {/* Observations Alert Card */}
      {(separacao as any).observacoes_internas && (
        <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-4 mb-4 animate-slide-down">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold uppercase text-amber-800 mb-1">
                Observações Importantes
              </p>
              <p className="text-sm text-amber-900">
                {(separacao as any).observacoes_internas}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative bg-primary-light border-2 border-primary rounded-xl p-5 animate-slide-down">
        {/* Success Check Badge */}
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-md">
          <Check className="w-5 h-5 text-success-foreground" />
        </div>

        <div className="space-y-4">
          {/* Número da Entrega + Cliente */}
          <div>
            {separacao.numero_entrega && (
              <div className="inline-flex items-center gap-1.5 bg-primary/15 border border-primary/30 rounded-lg px-3 py-1 mb-2">
                <span className="text-xs font-mono font-bold text-primary tracking-widest">
                  {separacao.numero_entrega}
                </span>
              </div>
            )}
            <p className="text-xs uppercase font-semibold text-primary-dark/70 tracking-wide mb-1">
              Cliente
            </p>
            <p className="text-base font-semibold text-foreground">
              {separacao.cliente}
            </p>
          </div>

          {/* Endereço */}
          <div>
            <p className="text-xs uppercase font-semibold text-primary-dark/70 tracking-wide mb-1">
              Endereço
            </p>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{separacao.endereco}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Responsável */}
            <div>
              <p className="text-xs uppercase font-semibold text-primary-dark/70 tracking-wide mb-1">
                Responsável
              </p>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-sm font-medium text-foreground">
                  {separacao.responsavel_recebimento}
                </p>
              </div>
            </div>

            {/* Telefone */}
            <div>
              <p className="text-xs uppercase font-semibold text-primary-dark/70 tracking-wide mb-1">
                Telefone
              </p>
              <button
                onClick={handleCall}
                className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium underline">
                  {separacao.telefone}
                </p>
              </button>
            </div>
          </div>

          {/* Gestora */}
          {separacao.gestora_equipe && (
            <div>
              <p className="text-xs uppercase font-semibold text-primary-dark/70 tracking-wide mb-1">
                Gestora da Equipe
              </p>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <p className="text-sm font-medium text-purple-600">
                  {separacao.gestora_equipe}
                </p>
              </div>
            </div>
          )}

          {/* Material */}
          <div>
            <p className="text-xs uppercase font-semibold text-primary-dark/70 tracking-wide mb-2">
              Material Esperado
            </p>
            <div className="bg-card rounded-lg p-3 border border-border">
              {renderMaterialContent()}
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
}
