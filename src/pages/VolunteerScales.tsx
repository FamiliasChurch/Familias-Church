import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, orderBy, serverTimestamp } from "firebase/firestore";
import { Calendar, Users, UserPlus, Trash2, Clock, CheckCircle, Shield } from "lucide-react";

export default function VolunteerScales({ userRole }: { userRole: string }) {
  const [servos, setServos] = useState<any[]>([]);
  const [ministerios, setMinisterios] = useState<any[]>([]);
  const [escalas, setEscalas] = useState<any[]>([]);
  
  // Estados do Formulário
  const [dataCulto, setDataCulto] = useState("");
  const [minId, setMinId] = useState("");
  const [servosSelecionados, setServosSelecionados] = useState<string[]>([]);

  const podeGerenciar = ["Mídia", "Apóstolo", "Dev"].includes(userRole);

  useEffect(() => {
    // Busca Servos (Membros)
    const unsubServos = onSnapshot(collection(db, "usuarios"), (snap) => {
      setServos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Busca Ministérios
    const unsubMin = onSnapshot(collection(db, "ministerios_info"), (snap) => {
      setMinisterios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Busca Escalas Ativas
    const q = query(collection(db, "escalas_servos"), orderBy("dataCulto", "asc"));
    const unsubEscalas = onSnapshot(q, (snap) => {
      setEscalas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubServos(); unsubMin(); unsubEscalas(); };
  }, []);

  const salvarEscala = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataCulto || !minId || servosSelecionados.length === 0) return;

    await addDoc(collection(db, "escalas_servos"), {
      dataCulto,
      ministerio: ministerios.find(m => m.id === minId)?.titulo,
      servos: servosSelecionados,
      criadoEm: serverTimestamp()
    });

    setServosSelecionados([]);
    alert("Escala de Servos publicada!");
  };

  const toggleServo = (nome: string) => {
    setServosSelecionados(prev => 
      prev.includes(nome) ? prev.filter(s => s !== nome) : [...prev, nome]
    );
  };

  return (
    <div className="min-h-screen bg-background text-white p-6 pt-32 font-body">
      <div className="container mx-auto space-y-16">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <h1 className="font-display text-7xl md:text-8xl tracking-tighter text-gradient uppercase leading-none">Escalas</h1>
            <p className="text-white/40 uppercase tracking-[0.4em] text-[10px] font-bold">Serviço ao Altar • Famílias Church</p>
          </div>
          <div className="glass px-6 py-4 rounded-full flex items-center gap-4">
            <Shield className="text-destaque" size={20} />
            <p className="text-[10px] font-black uppercase tracking-widest">Acesso {userRole}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* FORMULÁRIO DE ESCALA (SÓ LIDERANÇA) */}
          {podeGerenciar && (
            <div className="lg:col-span-1 space-y-8">
              <div className="glass p-10 rounded-[3.5rem] border border-destaque/20 sticky top-32">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <UserPlus className="text-destaque" /> Escalar Servos
                </h2>
                
                <form onSubmit={salvarEscala} className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-white/30 ml-2">Data do Culto</p>
                    <input type="date" value={dataCulto} onChange={e => setDataCulto(e.target.value)}
                      className="glass w-full p-4 rounded-2xl outline-none focus:border-destaque/50 text-white/60" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-white/30 ml-2">Ministério</p>
                    <select value={minId} onChange={e => setMinId(e.target.value)}
                      className="glass w-full p-4 rounded-2xl outline-none focus:border-destaque/50 text-white/60 appearance-none">
                      <option value="">Selecione a Área...</option>
                      {ministerios.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-white/30 ml-2">Selecionar Servos ({servosSelecionados.length})</p>
                    <div className="glass p-4 rounded-2xl max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                      {servos.map(s => (
                        <div key={s.id} onClick={() => toggleServo(s.nome)}
                          className={`p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center ${
                            servosSelecionados.includes(s.nome) ? 'bg-destaque text-primaria' : 'hover:bg-white/5 text-white/40'
                          }`}>
                          <span className="text-xs font-bold uppercase">{s.nome}</span>
                          {servosSelecionados.includes(s.nome) && <CheckCircle size={14} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full bg-white text-primaria py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-glow">
                    Confirmar Escala
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* LISTA DE ESCALAS ATIVAS */}
          <div className={`${podeGerenciar ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-8`}>
            <div className="flex items-center gap-4 mb-4">
              <Clock className="text-destaque" />
              <h2 className="text-4xl font-black uppercase tracking-tighter">Próximos Cultos</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {escalas.map(escala => (
                <div key={escala.id} className="glass p-8 rounded-[3rem] border border-white/5 hover:border-destaque/20 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-destaque/10 px-4 py-2 rounded-2xl border border-destaque/20">
                      <p className="text-[10px] font-black text-destaque uppercase tracking-widest leading-none">
                        {new Date(escala.dataCulto).toLocaleDateString('pt-BR', { weekday: 'long' })}
                      </p>
                      <p className="text-xl font-black mt-1">
                        {new Date(escala.dataCulto).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                    {podeGerenciar && (
                      <button onClick={async () => await deleteDoc(doc(db, "escalas_servos", escala.id))}
                        className="p-3 rounded-full hover:bg-red-500/20 text-white/10 hover:text-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-2xl font-bold uppercase tracking-tighter text-gradient">{escala.ministerio}</h4>
                    <div className="flex flex-wrap gap-2">
                      {escala.servos.map((servo: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-full border border-white/5">
                          <div className="w-2 h-2 rounded-full bg-destaque" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{servo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
