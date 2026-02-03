import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import LoginPage from "./pages/LoginPage";
import SeparacaoPage from "./pages/SeparacaoPage";
import CalendarioPage from "./pages/CalendarioPage";
import RegistrarEntregaPage from "./pages/RegistrarEntregaPage";
import EntregasFinalizadasPage from "./pages/EntregasFinalizadasPage";
import PendentesPage from "./pages/PendentesPage";
import RouteOptimizerPage from "./pages/RouteOptimizerPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminDevPage from "./pages/admin/AdminDevPage";
import AdminLogsPage from "./pages/admin/AdminLogsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={<Navigate to="/separacao" replace />} />
            <Route
              path="/separacao"
              element={
                <ProtectedRoute>
                  <SeparacaoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendario"
              element={
                <ProtectedRoute>
                  <CalendarioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pendentes"
              element={
                <ProtectedRoute>
                  <PendentesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/registrar-entrega"
              element={
                <ProtectedRoute>
                  <RegistrarEntregaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/entregas-finalizadas"
              element={
                <ProtectedRoute>
                  <EntregasFinalizadasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/otimizar-rota"
              element={
                <ProtectedRoute>
                  <RouteOptimizerPage />
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/configuracoes"
              element={
                <AdminRoute>
                  <AdminSettingsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/desenvolvimento"
              element={
                <AdminRoute>
                  <AdminDevPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <AdminRoute>
                  <AdminLogsPage />
                </AdminRoute>
              }
            />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
