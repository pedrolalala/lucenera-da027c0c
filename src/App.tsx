import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SeparacaoPage from "./pages/SeparacaoPage";
import RegistrarEntregaPage from "./pages/RegistrarEntregaPage";
import EntregasFinalizadasPage from "./pages/EntregasFinalizadasPage";
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
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
