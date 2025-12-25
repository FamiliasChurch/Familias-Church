import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Search, Phone, Mail, Calendar } from "lucide-react";
export default function MembersList() {
    const [membros, setMembros] = useState([]);
    const [busca, setBusca] = useState("");
    useEffect(() => {
        // Escuta a coleção de usuários criada no passo anterior
        const q = query(collection(db, "usuarios"), orderBy("nome", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            setMembros(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);
    // Lógica de Busca por Nome ou Cargo
    const membrosFiltrados = membros.filter(m => m.nome.toLowerCase().includes(busca.toLowerCase()) ||
        m.cargo.toLowerCase().includes(busca.toLowerCase()));
    return (<div className="min-h-screen bg-background p-6 pt-32 font-body text-white">
      <div className="container mx-auto space-y-8">
        
        {/* HEADER DA PÁGINA */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <h1 className="font-display text-7xl tracking-tighter text-gradient leading-none">Membros</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-bold">Gestão Administrativa | Famílias Church</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18}/>
            <input type="text" placeholder="Buscar por nome ou cargo..." className="w-full glass p-4 pl-12 rounded-2xl outline-none focus:border-destaque/50" onChange={(e) => setBusca(e.target.value)}/>
          </div>
        </div>

        {/* TABELA DE MEMBROS (Estilo Glass) */}
        <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-destaque font-black">
              <tr>
                <th className="p-6">Membro</th>
                <th className="p-6">Informações</th>
                <th className="p-6">Contato</th>
                <th className="p-6 text-center">Cargo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {membrosFiltrados.map((m) => (<tr key={m.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-6 flex items-center gap-4">
                    <img src={m.foto} className="w-12 h-12 rounded-full border-2 border-white/10 object-cover" alt="Foto"/>
                    <div>
                      <p className="font-bold text-lg leading-none">{m.nome}</p>
                      <p className="text-[10px] text-white/40 uppercase mt-1">{m.sexo}</p>
                    </div>
                  </td>
                  <td className="p-6 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Calendar size={12} className="text-destaque"/>
                      <span>Nascimento: {new Date(m.nascimento).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="p-6 space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-destaque"/>
                      <span>{m.telefone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40">
                      <Mail size={12}/>
                      <span>{m.email}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${m.cargo === 'Apóstolo' || m.cargo === 'Dev'
                ? 'bg-destaque text-primaria'
                : 'bg-white/10 text-white/60'}`}>
                      {m.cargo}
                    </span>
                  </td>
                </tr>))}
            </tbody>
          </table>
          {membrosFiltrados.length === 0 && (<div className="p-20 text-center text-white/20 uppercase tracking-[0.5em] text-xs">
              Nenhum membro encontrado com este termo
            </div>)}
        </div>
      </div>
    </div>);
}
