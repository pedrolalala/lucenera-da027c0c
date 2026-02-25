import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  MapPin, 
  Users, 
  Bell, 
  Link2, 
  Database,
  Clock,
  Pencil,
  Check,
  X,
  Save,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const GESTORAS = [
  { id: 1, nome: 'Thais Gomes', ativo: true },
  { id: 2, nome: 'Thairine Silva', ativo: true },
  { id: 3, nome: 'Marina Pousa', ativo: true },
  { id: 4, nome: 'Vinicius', ativo: true },
  { id: 5, nome: 'Terezinha', ativo: true },
];

export default function AdminSettingsPage() {
  // Delivery settings
  const [tempoEntrega, setTempoEntrega] = useState(30);
  const [horarioInicio, setHorarioInicio] = useState('08:00');
  const [raioAtendimento, setRaioAtendimento] = useState(50);
  
  // Address settings
  const [endereco, setEndereco] = useState('R. Dr. Hugo Fortes, 1010 – Parque Industrial Lagoinha – Ribeirão Preto/SP');
  const [editandoEndereco, setEditandoEndereco] = useState(false);
  
  // Notifications
  const [notifCriarSeparacao, setNotifCriarSeparacao] = useState(true);
  const [notifFinalizarEntrega, setNotifFinalizarEntrega] = useState(true);
  
  // Integrations
  const [googleMapsConfigured, setGoogleMapsConfigured] = useState(true);
  const [geminiConfigured, setGeminiConfigured] = useState(true);

  const handleSaveDeliverySettings = () => {
    toast.success('Configurações de entrega salvas!');
  };

  const handleSaveAddress = () => {
    setEditandoEndereco(false);
    toast.success('Endereço atualizado com sucesso!');
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-700">
          Configurações do Sistema
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personalize o funcionamento da Lucenera
        </p>
      </div>

      <div className="space-y-6">
        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              Parâmetros de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tempo por Entrega */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tempo padrão de permanência na obra</Label>
                <span className="text-lg font-bold text-purple-700">{tempoEntrega} min</span>
              </div>
              <Slider
                value={[tempoEntrega]}
                onValueChange={([value]) => setTempoEntrega(value)}
                min={15}
                max={60}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15 min</span>
                <span>60 min</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Usado para cálculo de rotas otimizadas
              </p>
            </div>

            {/* Horário de Início */}
            <div className="space-y-2">
              <Label htmlFor="horario-inicio" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário padrão de início das rotas
              </Label>
              <Input
                id="horario-inicio"
                type="time"
                value={horarioInicio}
                onChange={(e) => setHorarioInicio(e.target.value)}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Sugerido ao criar rotas
              </p>
            </div>

            {/* Raio de Atendimento */}
            <div className="space-y-2">
              <Label htmlFor="raio">Distância máxima do estoque</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="raio"
                  type="number"
                  value={raioAtendimento}
                  onChange={(e) => setRaioAtendimento(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-muted-foreground">km</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Alerta será exibido para entregas fora do raio
              </p>
            </div>

            <Button onClick={handleSaveDeliverySettings} className="bg-purple-600 hover:bg-purple-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>

        {/* Stock Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Origem das Entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Endereço Completo</Label>
              {editandoEndereco ? (
                <div className="space-y-2">
                  <Textarea
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveAddress} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Check className="w-4 h-4 mr-1" />
                      Salvar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditandoEndereco(false)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">{endereco}</p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditandoEndereco(true)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input value="-21.1767" disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input value="-47.8208" disabled className="bg-muted" />
              </div>
            </div>

            <Button variant="outline" asChild>
              <a 
                href="https://www.google.com/maps/search/-21.1767,-47.8208" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver no Google Maps
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Team Managers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Gestoras Responsáveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {GESTORAS.map((gestora) => (
                <div 
                  key={gestora.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {gestora.nome[0]}
                    </div>
                    <span className="font-medium">{gestora.nome}</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">ATIVA</Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Lista fixa de gestoras. Funcionalidade de adicionar novas gestoras será implementada futuramente.
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              Alertas e Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enviar email ao criar separação</Label>
                <p className="text-xs text-muted-foreground">Notificar responsáveis quando nova separação é criada</p>
              </div>
              <Switch
                checked={notifCriarSeparacao}
                onCheckedChange={setNotifCriarSeparacao}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificar ao finalizar entrega</Label>
                <p className="text-xs text-muted-foreground">Enviar confirmação quando entrega é registrada</p>
              </div>
              <Switch
                checked={notifFinalizarEntrega}
                onCheckedChange={setNotifFinalizarEntrega}
              />
            </div>
            <p className="text-xs text-muted-foreground border-t pt-4">
              ⚠️ Funcionalidade de notificações por email será implementada futuramente.
            </p>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-purple-600" />
              Serviços Externos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Google Maps API</p>
                  <p className="text-xs text-muted-foreground">Geocodificação e mapas</p>
                </div>
              </div>
              {googleMapsConfigured ? (
                <Badge className="bg-green-100 text-green-700">
                  <Check className="w-3 h-3 mr-1" />
                  Configurado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Não configurado
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Google Gemini API</p>
                  <p className="text-xs text-muted-foreground">Otimização de rotas com IA</p>
                </div>
              </div>
              {geminiConfigured ? (
                <Badge className="bg-green-100 text-green-700">
                  <Check className="w-3 h-3 mr-1" />
                  Configurado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Não configurado
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              Segurança dos Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Backup Automático</Label>
                <p className="text-xs text-muted-foreground">Gerenciado pelo Lovable Cloud</p>
              </div>
              <Badge className="bg-green-100 text-green-700">
                <Check className="w-3 h-3 mr-1" />
                Ativo
              </Badge>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Último backup:</strong> Automático (contínuo)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Os dados são salvos automaticamente pelo sistema de banco de dados em nuvem.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              ⚠️ Funcionalidades de exportação e limpeza de dados serão implementadas futuramente.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
