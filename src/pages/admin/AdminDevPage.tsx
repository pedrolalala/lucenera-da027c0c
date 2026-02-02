import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, 
  Palette, 
  Image, 
  Type,
  AlertTriangle,
  Construction
} from 'lucide-react';

export default function AdminDevPage() {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-purple-700">
            Área de Desenvolvimento
          </h1>
          <Badge className="bg-yellow-500">DEV ZONE</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Customizações, layout e ajustes avançados
        </p>
        <div className="flex items-center gap-2 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <p className="text-sm text-yellow-700">
            Área para ajustes técnicos. Cuidado ao modificar.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Colors Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              Cores e Tema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Customização de cores será implementada futuramente
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
              <div className="space-y-1">
                <div className="w-full h-12 rounded-lg bg-blue-600" />
                <p className="text-xs text-center text-muted-foreground">Principal</p>
              </div>
              <div className="space-y-1">
                <div className="w-full h-12 rounded-lg bg-green-600" />
                <p className="text-xs text-center text-muted-foreground">Sucesso</p>
              </div>
              <div className="space-y-1">
                <div className="w-full h-12 rounded-lg bg-orange-500" />
                <p className="text-xs text-center text-muted-foreground">Alerta</p>
              </div>
              <div className="space-y-1">
                <div className="w-full h-12 rounded-lg bg-red-500" />
                <p className="text-xs text-center text-muted-foreground">Erro</p>
              </div>
              <div className="space-y-1">
                <div className="w-full h-12 rounded-lg bg-purple-600" />
                <p className="text-xs text-center text-muted-foreground">Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logos Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-purple-600" />
              Logos e Marca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Upload de logos será implementado futuramente
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 border rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-2">Logo Horizontal</p>
                <div className="h-16 bg-muted rounded flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">800x200px</p>
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-2">Logo Vertical</p>
                <div className="h-16 bg-muted rounded flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">400x400px</p>
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-2">Favicon</p>
                <div className="h-16 bg-muted rounded flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">32x32px</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Texts Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5 text-purple-600" />
              Textos e Labels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Editor de textos será implementado futuramente
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Título da aplicação</span>
                <span className="font-medium">Lucenera - Sistema de Entregas</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Texto login</span>
                <span className="font-medium">Acesso restrito a funcionários</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-purple-600" />
              Informações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Framework</p>
                <p className="font-medium">React + Vite</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Estilização</p>
                <p className="font-medium">Tailwind CSS + shadcn/ui</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Backend</p>
                <p className="font-medium">Lovable Cloud (Supabase)</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Hospedagem</p>
                <p className="font-medium">Lovable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
