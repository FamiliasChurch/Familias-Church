import React from "react"; // Certifique-se de importar o React
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  userRole: string;
  allowedRoles: string[];
  children: React.ReactNode; // Trocamos JSX.Element por React.ReactNode
}

export default function ProtectedRoute({ userRole, allowedRoles, children }: ProtectedRouteProps) {
  // Se o cargo do utilizador estiver na lista de permitidos, mostra a página
  if (allowedRoles.includes(userRole)) {
    return <>{children}</>; // Usamos um fragment para garantir o retorno do tipo
  }

  // Caso contrário, manda de volta para a Home (ou uma página de 'Acesso Negado')
  return <Navigate to="/" replace />;
}