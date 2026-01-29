import { Separacao, EntregaFinalizada } from '@/types/separacao';

// Helper para criar datas
const today = new Date();
const addDays = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date;
};

const subDays = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date;
};

export const mockSeparacoes: Separacao[] = [
  {
    id: '1',
    cliente: 'Construtora Horizonte Ltda',
    codigoObra: 'OBR-2024-001',
    dataEntrega: today,
    responsavelRecebimento: 'Carlos Silva',
    telefone: '(11) 98765-4321',
    endereco: 'Rua das Acácias, 450 - Jardim Europa, São Paulo - SP',
    status: 'separando',
    materialTipo: 'texto',
    materialConteudo: '• 50x Luminária LED 40W\n• 30x Spot Embutir 12W\n• 100m Fita LED 5050\n• 20x Driver LED 50W',
    createdAt: subDays(3),
    updatedAt: new Date(),
  },
  {
    id: '2',
    cliente: 'Arquitetura Moderna S.A.',
    codigoObra: 'OBR-2024-002',
    dataEntrega: today,
    responsavelRecebimento: 'Marina Costa',
    telefone: '(11) 99876-5432',
    endereco: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
    status: 'separado',
    materialTipo: 'texto',
    materialConteudo: '• 25x Pendente Decorativo\n• 15x Arandela Externa\n• 40x Lâmpada Bulbo E27',
    createdAt: subDays(2),
    updatedAt: new Date(),
  },
  {
    id: '3',
    cliente: 'Hotel Premium Inn',
    codigoObra: 'OBR-2024-003',
    dataEntrega: today,
    responsavelRecebimento: 'Roberto Mendes',
    telefone: '(11) 97654-3210',
    endereco: 'Rua Oscar Freire, 890 - Jardins, São Paulo - SP',
    status: 'separando',
    materialTipo: 'texto',
    materialConteudo: '• 200x Spot LED 7W\n• 50x Luminária Linear 1.2m\n• 80x Sensor de Presença\n• 30x Dimmer Inteligente',
    createdAt: subDays(1),
    updatedAt: new Date(),
  },
  {
    id: '4',
    cliente: 'Shopping Center Norte',
    codigoObra: 'OBR-2024-004',
    dataEntrega: addDays(1),
    responsavelRecebimento: 'Ana Paula Rodrigues',
    telefone: '(11) 96543-2109',
    endereco: 'Av. Cruzeiro do Sul, 1100 - Santana, São Paulo - SP',
    status: 'separando',
    materialTipo: 'texto',
    materialConteudo: '• 500x Painel LED 60x60\n• 100x Luminária High Bay 100W\n• 200m Trilho Eletrificado',
    createdAt: subDays(5),
    updatedAt: new Date(),
  },
  {
    id: '5',
    cliente: 'Residencial Alto Padrão',
    codigoObra: 'OBR-2024-005',
    dataEntrega: addDays(1),
    responsavelRecebimento: 'Fernando Almeida',
    telefone: '(11) 95432-1098',
    endereco: 'Rua Harmonia, 256 - Vila Madalena, São Paulo - SP',
    status: 'separado',
    materialTipo: 'texto',
    materialConteudo: '• 30x Lustre Cristal\n• 45x Spot Direcionável\n• 20x Arandela Moderna\n• 15x Plafon LED',
    createdAt: subDays(4),
    updatedAt: new Date(),
  },
  {
    id: '6',
    cliente: 'Escritório Tech Solutions',
    codigoObra: 'OBR-2024-006',
    dataEntrega: addDays(3),
    responsavelRecebimento: 'Juliana Pires',
    telefone: '(11) 94321-0987',
    endereco: 'Rua Funchal, 418 - Vila Olímpia, São Paulo - SP',
    status: 'separando',
    materialTipo: 'texto',
    materialConteudo: '• 150x Luminária de Mesa LED\n• 80x Painel Modular\n• 40x Luminária de Emergência',
    createdAt: subDays(2),
    updatedAt: new Date(),
  },
];

export const mockEntregasFinalizadas: EntregaFinalizada[] = [
  {
    id: '1',
    separacaoId: 'old-1',
    cliente: 'Restaurante Sabor & Arte',
    codigoObra: 'OBR-2024-F01',
    dataEntregaReal: subDays(2),
    endereco: 'Rua Augusta, 2034 - Consolação, São Paulo - SP',
    recebidoPor: 'João Martins',
    materialTipo: 'texto',
    materialConteudo: '• 40x Pendente Industrial\n• 25x Spot Trilho\n• 60x Lâmpada Vintage',
    fotosUrls: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400',
    ],
    observacoes: 'Entrega realizada com sucesso. Cliente solicitou orientações sobre instalação dos pendentes. Material conferido e aprovado.',
    createdAt: subDays(2),
  },
  {
    id: '2',
    separacaoId: 'old-2',
    cliente: 'Clínica Bem Estar',
    codigoObra: 'OBR-2024-F02',
    dataEntregaReal: subDays(5),
    endereco: 'Av. Brasil, 1500 - Jardim América, São Paulo - SP',
    recebidoPor: 'Dra. Patricia Sousa',
    materialTipo: 'texto',
    materialConteudo: '• 100x Painel LED 40W\n• 50x Luminária Hospitalar\n• 30x Sensor Crepuscular',
    fotosUrls: [
      'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400',
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400',
    ],
    observacoes: 'Material entregue conforme especificação. Instalação agendada para próxima semana.',
    createdAt: subDays(5),
  },
  {
    id: '3',
    separacaoId: 'old-3',
    cliente: 'Escola Futuro Brilhante',
    codigoObra: 'OBR-2024-F03',
    dataEntregaReal: subDays(10),
    endereco: 'Rua Educação, 789 - Vila Nova, São Paulo - SP',
    recebidoPor: 'Diretor Marcos Lima',
    materialTipo: 'texto',
    materialConteudo: '• 200x Luminária Escolar\n• 100x Lâmpada Tubular LED\n• 50x Luminária de Emergência',
    fotosUrls: [
      'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    ],
    observacoes: null,
    createdAt: subDays(10),
  },
];
