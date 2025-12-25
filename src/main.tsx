import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const Root = () => {
  const [role, setRole] = useState("Visitante");
  const [name, setName] = useState("Convidado");

  useEffect(() => {
    // @ts-ignore
    const netlifyIdentity = window.netlifyIdentity;

    // Verificação de segurança: garante que o script carregou
    if (!netlifyIdentity) return;

    const updateUserInfo = (user: any) => {
      if (user) {
        // RBAC: Extrai o cargo do metadado do Netlify
        const userRole = user.app_metadata?.roles?.[0] || "Membro";
        setRole(userRole);
        setName(user.user_metadata?.full_name || "Usuário");
      } else {
        setRole("Visitante");
      }
    };

    updateUserInfo(netlifyIdentity.currentUser());

    netlifyIdentity.on('login', (user: any) => updateUserInfo(user));
    netlifyIdentity.on('logout', () => updateUserInfo(null));
  }, []);

  return (
    <StrictMode>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<Root />);