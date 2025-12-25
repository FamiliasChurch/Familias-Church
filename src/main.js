// Main.tsx
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
// Definindo o componente que gerencia o estado de login
const Root = () => {
    const [role, setRole] = useState("Visitante");
    const [name, setName] = useState("Convidado");
    useEffect(() => {
        // @ts-ignore (O script do Netlify está no index.html)
        const netlifyIdentity = window.netlifyIdentity;
        const updateUserInfo = (user) => {
            if (user) {
                // Pegamos o cargo definido no 'metadata' do Netlify Identity
                const userRole = user.app_metadata?.roles?.[0] || "Membro";
                setRole(userRole);
                setName(user.user_metadata?.full_name || "Usuário");
            }
            else {
                setRole("Visitante");
            }
        };
        // Verifica usuário atual ao carregar a página
        updateUserInfo(netlifyIdentity.currentUser());
        // Escuta eventos de login/logout
        netlifyIdentity.on('login', (user) => updateUserInfo(user));
        netlifyIdentity.on('logout', () => updateUserInfo(null));
    }, []);
    return (<StrictMode>
      <App userRole={role} userName={name}/>
    </StrictMode>);
};
createRoot(document.getElementById('root')).render(<Root />);
