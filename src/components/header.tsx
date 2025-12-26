import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Bell, LogOut, Shield } from "lucide-react";
import logoIgreja from "../assets/logo.jpg"; 
import fotoApostolo from "../assets/Ap.jpg";

export default function Header({ userRole, userName }: { userRole: string, userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate(); // Hook para redirecionamento

  const handleLogout = () => {
    // @ts-ignore - Acessa o widget do Netlify carregado no index.html
    const netlifyIdentity = window.netlifyIdentity;
    
    if (netlifyIdentity) {
      netlifyIdentity.logout(); // Limpa a sessão no Netlify
      setMenuAberto(false);
      navigate("/"); // Redireciona para a Home
    }
  };

  const navLinks = [
    { name: "Início", href: "#inicio", isRoute: false },
    { name: "Cultos", href: "#cultos", isRoute: false },
    { name: "Ministérios", href: "#ministerios", isRoute: false },
    { name: "Quem Somos", href: "#sobre", isRoute: false },
    { name: "Eventos", href: "#eventos", isRoute: false },
    { name: "Doações", href: "/doacoes", isRoute: true },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass h-20 flex items-center border-b border-white/5">
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={logoIgreja} 
            alt="Logo Famílias Church" 
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-destaque object-cover" 
          />
          <span className="font-display text-2xl md:text-3xl font-bold tracking-tight hidden sm:block">
            FAMÍLIAS CHURCH
          </span>
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden lg:flex items-center gap-8">
          <ul className="flex gap-6 text-[11px] font-bold tracking-[0.2em] uppercase text-white/70">
            {navLinks.map((link) => (
              <li key={link.name}>
                {link.isRoute ? (
                  <Link to={link.href} className="hover:text-destaque transition-colors">
                    {link.name}
                  </Link>
                ) : (
                  <a href={link.href} className="hover:text-destaque transition-colors">
                    {link.name}
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4 pl-4 border-l border-white/10 relative">
            <button className="text-destaque hover:scale-110 transition-transform">
              <Bell size={20} />
            </button>
            
            {/* BOTÃO PERFIL */}
            <button 
              onClick={() => setMenuAberto(!menuAberto)}
              className="border-2 border-destaque rounded-full p-0.5 overflow-hidden w-9 h-9"
            >
              <img 
                src={fotoApostolo} 
                className="w-full h-full object-cover rounded-full" 
                alt="Perfil" 
              />
            </button>

            {/* DROPDOWN PERFIL */}
            {menuAberto && (
              <div className="absolute right-0 top-12 w-64 glass p-6 rounded-[2rem] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200 z-50">
                <p className="text-[10px] uppercase font-black text-destaque tracking-widest mb-1">{userRole}</p>
                <p className="font-display text-xl leading-none mb-4">{userName}</p>
                
                <div className="space-y-2 border-t border-white/5 pt-4">
                  {["Dev", "Apóstolo", "Tesoureira"].includes(userRole) && (
                    <Link 
                      to="/admin" 
                      onClick={() => setMenuAberto(false)}
                      className="flex items-center gap-3 text-xs uppercase font-bold hover:text-destaque transition-colors"
                    >
                      <Shield size={14} /> Painel Administrativo
                    </Link>
                  )}
                  {/* BOTÃO SAIR ATUALIZADO */}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-xs uppercase font-bold hover:text-red-400 transition-colors w-full text-left"
                  >
                    <LogOut size={14} /> Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* BOTÃO MOBILE */}
        <button className="lg:hidden text-destaque" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* MENU MOBILE */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full glass flex flex-col items-center py-10 gap-6 lg:hidden animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            link.isRoute ? (
              <Link
                key={link.name}
                to={link.href}
                className="text-lg font-bold uppercase tracking-widest"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                className="text-lg font-bold uppercase tracking-widest"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            )
          ))}
        </div>
      )}
    </header>
  );
}