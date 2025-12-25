import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import Home from "./pages/Home";
import Donations from "./pages/Donations";
import AdminDashboard from "./pages/Admin";
import MembersList from "./pages/MembersList";
import BibleStudies from "./pages/BibleStudies";
import EventsManagement from "./pages/EventsManagement";
import MinistriesManagement from "./pages/MinistriesManagement";
import ProtectedRoute from "./components/ProtectedRoute";

interface AppProps {
  userRole: string;
  userName: string;
}

export default function App({ userRole, userName }: AppProps) {
  return (
    /* Removido o basename="/Familias" para funcionar corretamente no Netlify.
       Agora o React Router entenderá as rotas a partir da raiz do domínio.
    */
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Rotas Públicas */}
          <Route index element={<Home />} />
          <Route path="doacoes" element={<Donations />} />

          {/* ROTAS PROTEGIDAS POR CARGO */}

          {/* Painel Administrativo: Tesouraria e Liderança */}
          <Route path="admin" element={
            <ProtectedRoute userRole={userRole} allowedRoles={["Tesoureira", "Apóstolo", "Dev"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Lista de Membros: Só Apóstolo e Dev */}
          <Route path="membros" element={
            <ProtectedRoute userRole={userRole} allowedRoles={["Apóstolo", "Dev"]}>
              <MembersList />
            </ProtectedRoute>
          } />

          {/* Estudos Bíblicos: Pastores e Liderança de Ensino */}
          <Route path="estudos" element={
            <ProtectedRoute userRole={userRole} allowedRoles={["Pastor", "Apóstolo", "Dev"]}>
              <BibleStudies userRole={userRole} userName={userName} />
            </ProtectedRoute>
          } />

          {/* Gestão de Eventos: Equipa de Mídia e Apóstolo */}
          <Route path="gestao-eventos" element={
            <ProtectedRoute userRole={userRole} allowedRoles={["Mídia", "Apóstolo", "Dev"]}>
              <EventsManagement userRole={userRole} />
            </ProtectedRoute>
          } />

          {/* Gestão de Ministérios: Equipa de Mídia e Apóstolo */}
          <Route path="gestao-ministerios" element={
            <ProtectedRoute userRole={userRole} allowedRoles={["Mídia", "Apóstolo", "Dev"]}>
              <MinistriesManagement userRole={userRole} />
            </ProtectedRoute>
          } />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
