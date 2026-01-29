export type StatusSeparacao = 'separando' | 'separado';

export type MaterialTipo = 'texto' | 'imagem' | 'pdf';

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
  materialConteudo: string; // texto, URL da imagem, ou URL do PDF
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
