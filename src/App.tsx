import React from 'react';
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
  // O comando 'return' é obrigatório para o React saber o que renderizar
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota do Layout que envolve as outras para manter o Header/Footer fixos */}
        <Route path="/" element={<Layout />}>
          
          {/* Rota inicial (Home) */}
          <Route index element={<Home />} />
          
          {/* Página de Doações pública */}
          <Route path="doacoes" element={<Donations />} />

          {/* PAINEL ADMINISTRATIVO (Protegido) */}
          <Route path="admin" element={
            <ProtectedRoute userRole={userRole} allowedRoles={["Tesoureira", "Apóstolo", "Dev"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* LISTA DE MEMBROS (Protegido) */}
          <Route path="membros" element={
            <ProtectedRoute userRole={userRole} allowedRoles={["Apóstolo", "Dev"]}>
              <MembersList />
            </ProtectedRoute>
          } />

          {/* ESTUDOS BÍBLICOS (Protegido) */}
          <Route path="estudos" element={
            <ProtectedRoute userRole={userRole} allowedRoles={["Pastor", "Apóstolo", "Dev"]}>
              <BibleStudies userRole={userRole} userName={userName} />
            </ProtectedRoute>
          } />

          {/* GESTÃO DE EVENTOS E MINISTÉRIOS (Protegido) */}
          <Route path="gestao-eventos" element={
            <ProtectedRoute userRole={userRole} allowedRoles={["Mídia", "Apóstolo", "Dev"]}>
              <EventsManagement userRole={userRole} />
            </ProtectedRoute>
          } />

          <Route path="gestao-ministerios" element={
            <ProtectedRoute userRole={userRole} allowedRoles={["Mídia", "Apóstolo", "Dev"]}>
              <MinistriesManagement userRole={userRole} />
            </ProtectedRoute>
          } />
          
        </Route> {/* Fechamento correto do Layout */}
      </Routes>
    </BrowserRouter>
  );
}