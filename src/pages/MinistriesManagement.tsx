import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Shield, LayoutGrid, Info } from "lucide-react";

export default function MinistriesManagement({ userRole }: { userRole: string }) {
  const [ministerios, setMinisterios] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "ministerios_info"), (snap) => {
      setMinisterios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const podeGerir = ["Mídia", "Apóstolo", "Dev"].includes(userRole);

  const atualizarDescricao = async (id: string, novaDesc: string) => {
    await updateDoc(doc(db, "ministerios_info", id), { desc: novaDesc });
  };

  return (
    <div className="min-h-screen bg-background p-6 pt-32 text-white font-body">
      <div className="container mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h1 className="font-display text-7xl text-gradient tracking-tighter uppercase">Ministérios</h1>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.4em]">Gestão de Áreas e Lideranças</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ministerios.map(m => (
            <div key={m.id} className="glass p-10 rounded-[3.5rem] space-y-6 border border-white/5 relative group">
              <img src={m.img} className="w-full h-40 object-cover rounded-[2rem] opacity-30 group-hover:opacity-50 transition-opacity" alt={m.titulo} />
              
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-destaque">{m.titulo}</h3>
                <div className="w-12 h-1 bg-destaque/30" />
              </div>

              {podeGerir ? (
                <textarea 
                  defaultValue={m.desc} 
                  onBlur={(e) => atualizarDescricao(m.id, e.target.value)}
                  className="w-full glass p-4 rounded-2xl text-sm italic text-white/60 resize-none outline-none focus:border-destaque/50 h-32"
                />
              ) : (
                <p className="text-sm text-white/60 leading-relaxed italic">"{m.desc}"</p>
              )}

              <div className="flex items-center gap-2 pt-4">
                <Shield size={12} className="text-destaque" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Acesso Restrito ao Mídia</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}