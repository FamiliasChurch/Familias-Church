import { Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-destaque/30">
      {/* O Header fica fixo no topo de todas as páginas */}
      <Header />
      
      {/* O Outlet é onde as páginas (Home, Doações, Admin) serão renderizadas */}
      <main>
        <Outlet />
      </main>

      {/* O Footer fica no final de todas as páginas */}
      <Footer />
    </div>
  );
}