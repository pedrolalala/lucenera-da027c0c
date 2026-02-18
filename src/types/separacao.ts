export type StatusSeparacao = 
  | 'material_solicitado' 
  | 'em_separacao' 
  | 'separado' 
  | 'matheus_separacao_garantia' 
  | 'pendente' 
  | 'finalizado';

export type NivelComplexidade = 'facil' | 'medio' | 'dificil';

export type TipoEntrega = 'lucenera_entrega' | 'transportadora' | 'cliente_retira' | 'correios';

export type MaterialTipo = 'texto' | 'imagem' | 'pdf' | 'tabela' | 'arquivos';

export interface Separacao {
  id: string;
  cliente: string;
  codigoObra: string;
  dataEntrega: Date;
  responsavelRecebimento: string;
  telefone: string;
  endereco: string;
  status: StatusSeparacao;
  materialTipo: MaterialTipo;
  materialConteudo: string;
  nivelComplexidade: NivelComplexidade;
  tipoEntrega: TipoEntrega;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntregaFinalizada {
  id: string;
  separacaoId: string;
  cliente: string;
  codigoObra: string;
  dataEntregaReal: Date;
  endereco: string;
  recebidoPor: string;
  materialTipo: MaterialTipo;
  materialConteudo: string;
  fotosUrls: string[];
  observacoes: string | null;
  createdAt: Date;
}

export type FiltroSegmento = 
  | 'todas' 
  | 'ultima-semana' 
  | 'ultimo-mes' 
  | 'ultimos-3-meses' 
  | 'ultimos-6-meses' 
  | 'personalizar';

export interface FiltroConfig {
  segmento: FiltroSegmento;
  dataInicio?: Date;
  dataFim?: Date;
}

export type TipoProblema = 
  | 'falta_material'
  | 'material_defeito'
  | 'cliente_ausente'
  | 'endereco_incorreto'
  | 'acesso_bloqueado'
  | 'problema_tecnico'
  | 'outros';

export interface EntregaPendente {
  id: string;
  separacao_id: string;
  codigo_obra: string;
  cliente: string;
  endereco: string | null;
  responsavel: string | null;
  telefone: string | null;
  tipo_problema: TipoProblema | string;
  descricao_problema: string;
  fotos_urls: string[];
  registrado_por: string;
  registrado_por_user_id: string | null;
  data_registro: string | null;
  status_pendencia: 'aguardando_resolucao' | 'em_analise' | 'resolvido' | 'cancelado' | null;
  resolved_at: string | null;
  resolved_by: string | null;
  fotos_resolucao?: string[] | null;
  observacoes_resolucao?: string | null;
  created_at: string | null;
}
