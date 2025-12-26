import { Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";

interface LayoutProps {
  userRole: string;
  userName: string;
}

export default function Layout({ userRole, userName }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-destaque selection:text-black">
      {/* Passamos as props adiante para o Header para o botão Sair e Perfil funcionarem */}
      <Header userRole={userRole} userName={userName} />
      
      <main>
        <Outlet context={{ userRole, userName }} />
      </main>

      <Footer />
    </div>
  );
}