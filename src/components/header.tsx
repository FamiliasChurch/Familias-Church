import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Bell, LogOut, Shield, UserPlus, Search } from "lucide-react";
import logoIgreja from "../assets/logo.jpg"; 
import fotoApostolo from "../assets/Ap.jpg";

export default function Header({ userRole, userName }: { userRole: string, userName: string }) {
  const [isOpen, setIsOpen] = useState(false); // Menu Mobile
  const [menuAberto, setMenuAberto] = useState(false); // Dropdown Perfil
  const navigate = useNavigate();

  const abrirLogin = () => {
    // @ts-ignore
    window.netlifyIdentity.open(); 
    setMenuAberto(false);
  };

  const handleLogout = () => {
    // @ts-ignore
    const netlifyIdentity = window.netlifyIdentity;
    if (netlifyIdentity) {
      netlifyIdentity.logout();
      setMenuAberto(false);
      navigate("/");
    }
  };

  const navLinks = [
    { name: "Início", href: "/#inicio", isRoute: true },
    { name: "Cultos", href: "/#cultos", isRoute: true },
    { name: "Ministérios", href: "/#ministerios", isRoute: true },
    { name: "Quem Somos", href: "/#sobre", isRoute: true },
    { name: "Eventos", href: "/#eventos", isRoute: true },
    { name: "Doações", href: "/doacoes", isRoute: true },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass h-20 flex items-center border-b border-white/5">
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logoIgreja} className="w-10 h-10 rounded-full border-2 border-destaque object-cover" alt="Logo" />
          <span className="font-display text-2xl font-bold hidden sm:block uppercase tracking-tighter">FAMÍLIAS CHURCH</span>
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden lg:flex items-center gap-8">
          <ul className="flex gap-6 text-[11px] font-bold uppercase tracking-widest text-white/70">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link to={link.href} className="hover:text-destaque transition-colors">{link.name}</Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4 pl-4 border-l border-white/10 relative">
            <button className="text-destaque hover:scale-110 transition-transform"><Bell size={20} /></button>
            
            {/* BOTÃO PERFIL DINÂMICO */}
            <button 
              onClick={() => setMenuAberto(!menuAberto)} 
              className="border-2 border-destaque rounded-full p-0.5 w-10 h-10 overflow-hidden hover:shadow-[0_0_15px_rgba(var(--destaque-rgb),0.3)] transition-all"
            >
              <img 
                src={userName === "Convidado" ? "https://www.w3schools.com/howto/img_avatar.png" : fotoApostolo} 
                className="w-full h-full object-cover rounded-full" 
                alt="Perfil"
              />
            </button>

            {/* DROPDOWN */}
            {menuAberto && (
              <div className="absolute right-0 top-14 w-64 glass p-6 rounded-[2.5rem] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200 z-50">
                {userName === "Convidado" ? (
                  <div className="text-center space-y-4">
                    <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Acesso Restrito</p>
                    <button 
                      onClick={abrirLogin}
                      className="w-full bg-destaque text-black py-4 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all"
                    >
                      <UserPlus size={14} /> Entrar / Cadastrar
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] uppercase font-black text-destaque tracking-widest mb-1">{userRole}</p>
                    <p className="font-display text-xl leading-none mb-4 truncate">{userName}</p>
                    <div className="space-y-3 border-t border-white/5 pt-4">
                      {["Dev", "Apóstolo", "Tesoureira"].includes(userRole) && (
                        <Link to="/admin" onClick={() => setMenuAberto(false)} className="flex items-center gap-3 text-xs font-bold hover:text-destaque uppercase">
                          <Shield size={14} /> Painel Administrativo
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex items-center gap-3 text-xs font-bold hover:text-red-400 uppercase w-full text-left transition-colors">
                        <LogOut size={14} /> Sair do Sistema
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* MOBILE TRIGGER */}
        <button className="lg:hidden text-destaque" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full glass py-10 flex flex-col items-center gap-6 lg:hidden animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.href} onClick={() => setIsOpen(false)} className="text-lg font-bold uppercase tracking-widest hover:text-destaque">
              {link.name}
            </Link>
          ))}
          <button onClick={abrirLogin} className="mt-4 text-destaque uppercase font-black text-xs tracking-widest">
            {userName === "Convidado" ? "Entrar na Conta" : `Logado como ${userName}`}
          </button>
        </div>
      )}
    </header>
  );
}