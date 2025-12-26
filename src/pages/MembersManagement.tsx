import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Users, UserCog, Search, Loader2 } from "lucide-react";

export default function MembersManagement() {
  const [membros, setMembros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

  const cargosDisponiveis = ["Membro", "Pastor", "Mídia", "Tesoureira", "Apóstolo"];

  // 1. BUSCA DE DADOS EM TEMPO REAL
  useEffect(() => {
    const q = query(collection(db, "contas_acesso"), orderBy("dataCadastro", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMembros(lista);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. LÓGICA DE FILTRAGEM (SEARCH)
  const membrosFiltrados = membros.filter(m =>
    m.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    m.email?.toLowerCase().includes(filtro.toLowerCase())
  );

  // 3. ATUALIZAÇÃO DE CARGO
  const alterarCargo = async (email: string, novoCargo: string) => {
    try {
      const userRef = doc(db, "contas_acesso", email);
      await updateDoc(userRef, { cargo: novoCargo });
    } catch (error) {
      alert("Erro ao alterar cargo. Verifique as regras de segurança do Firestore.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-destaque" size={40} />
        <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Carregando Membresia...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <Users className="text-destaque" size={40} />
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Gestão de Membros</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2">Hierarquia Famílias Church</p>
          </div>
        </div>

        {/* BARRA DE BUSCA - LOCALIZADA NO TOPO */}
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-destaque transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full glass py-4 pl-14 pr-6 rounded-full border border-white/10 outline-none focus:border-destaque/50 transition-all text-xs"
          />
        </div>
      </div>

      {/* LISTAGEM DE CARDS */}
      <div className="grid gap-6">
        {membrosFiltrados.length > 0 ? (
          membrosFiltrados.map((membro) => (
            <div 
              key={membro.id} 
              className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8 group hover:border-destaque/30 transition-all"
            >
              {/* INFO DO USUÁRIO */}
              <div className="text-left flex items-center gap-6 w-full lg:w-auto">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shrink-0">
                  <UserCog className={membro.cargo !== "Membro" ? "text-destaque" : "text-white/20"} size={32} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-destaque tracking-[0.2em] mb-1">{membro.cargo}</p>
                  <h3 className="text-2xl font-bold leading-none truncate max-w-[200px] md:max-w-none">{membro.nome}</h3>
                  <p className="text-xs text-white/40 mt-1">{membro.email}</p>
                </div>
              </div>

              {/* SELETOR DE CARGOS */}
              <div className="flex flex-wrap justify-center lg:justify-end gap-2">
                {cargosDisponiveis.map((cargo) => (
                  <button
                    key={cargo}
                    onClick={() => alterarCargo(membro.id, cargo)} // Usamos o ID do doc (email) para atualizar
                    className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                      membro.cargo === cargo
                        ? "bg-destaque text-black scale-105 shadow-[0_0_15px_rgba(var(--destaque-rgb),0.4)]"
                        : "bg-white/5 hover:bg-white/10 text-white/60"
                    }`}
                  >
                    {cargo}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-white/20 italic">Nenhum membro encontrado com "{filtro}"</p>
          </div>
        )}
      </div>
    </div>
  );
}