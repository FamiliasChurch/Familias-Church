import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  TrendingUp, Users, Heart, DollarSign, 
  ChevronRight, Calendar, ShieldCheck, LogOut 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [autorizado, setAutorizado] = useState(false);
  const [senha, setSenha] = useState("");
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [totalFinancas, setTotalFinancas] = useState(0);
  const [countDizimos, setCountDizimos] = useState(0);

  useEffect(() => {
  if (!autorizado) return;

  // VIGIA 1: Escuta Pedidos de Oração em tempo real
  const qPedidos = query(collection(db, "pedidos_oracao"), orderBy("data", "desc"));
  const unsubPedidos = onSnapshot(qPedidos, (snap) => {
    setPedidos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });

  // VIGIA 2: Escuta a Tesouraria (Dízimos) em tempo real
  const qDizimos = collection(db, "registros_dizimos");
  const unsubDizimos = onSnapshot(qDizimos, (snap) => {
    // Aqui a mágica acontece: sempre que alguém doa, o snap muda e o JS resoma tudo
    const soma = snap.docs.reduce((acc, d) => acc + Number(d.data().valor || 0), 0);
    setTotalFinancas(soma);
    setCountDizimos(snap.size);
  });

  // Limpeza: desliga os vigias quando sair da página (boa prática de engenharia)
  return () => {
    unsubPedidos();
    unsubDizimos();
  };
}, [autorizado]);

  if (!autorizado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="glass p-12 space-y-8 text-center max-w-md w-full rounded-[3rem] border border-white/5 shadow-glow">
          <div className="w-20 h-20 bg-destaque/10 rounded-full flex items-center justify-center mx-auto border border-destaque/20">
            <ShieldCheck className="text-destaque" size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-5xl text-destaque uppercase tracking-tight leading-none">Área Restrita</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em]">Tesouraria & Liderança</p>
          </div>
          <input
            type="password"
            className="glass w-full p-5 rounded-2xl outline-none focus:border-destaque/50 text-center text-white text-xl tracking-[0.5em]"
            placeholder="••••••"
            onChange={(e) => setSenha(e.target.value)}
          />
          <button
            className="w-full bg-white text-primaria py-4 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-lg"
            onClick={() => senha === "123" ? setAutorizado(true) : alert("Acesso Negado")}
          >
            Entrar no Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white font-body p-6 pt-32">
      <div className="container mx-auto space-y-10">
        
        {/* HEADER DO DASHBOARD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <h1 className="font-display text-7xl md:text-8xl tracking-tight leading-none text-gradient">Dashboard</h1>
            <p className="text-white/40 uppercase tracking-[0.4em] text-[10px] font-bold">Gestão Famílias Church v1.0</p>
          </div>
          <div className="flex gap-4">
             <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-destaque">Apóstolo J. Roberto</p>
                <p className="text-[10px] text-white/30 uppercase">Sede Fazenda Rio Grande</p>
             </div>
             <button onClick={() => setAutorizado(false)} className="glass p-4 rounded-full hover:text-red-400 transition-colors">
                <LogOut size={20} />
             </button>
          </div>
        </div>

        {/* CARDS DE MÉTRICAS (FINANÇAS E MEMBRESIA) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-10 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <DollarSign size={80} />
            </div>
            <p className="text-[10px] font-bold text-destaque uppercase tracking-[0.2em] mb-2">Total Semeado</p>
            <h3 className="text-5xl font-black tabular-nums tracking-tighter">
              R$ {totalFinancas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-white/30 mt-4 flex items-center gap-2">
              <TrendingUp size={12} className="text-green-400" /> {countDizimos} registros este mês
            </p>
          </div>

          <div className="glass p-10 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform text-blue-400">
              <Heart size={80} />
            </div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-2">Pedidos de Oração</p>
            <h3 className="text-5xl font-black tabular-nums tracking-tighter">{pedidos.length}</h3>
            <p className="text-[10px] text-white/30 mt-4 uppercase tracking-widest italic">Aguardando Intercessão</p>
          </div>

          <div className="glass p-10 rounded-[3rem] relative overflow-hidden group border-2 border-white/5">
             <Calendar className="text-destaque mb-6" size={32} />
             <h4 className="text-xl font-bold mb-2 uppercase tracking-tighter">Próximo Culto</h4>
             <p className="text-white/50 text-sm">Domingo às 19:00 - Celebração da Família</p>
             <Link to="/" className="inline-flex items-center gap-2 mt-6 text-destaque text-[10px] font-bold uppercase tracking-widest hover:gap-4 transition-all">
               Ver Site Público <ChevronRight size={14} />
             </Link>
          </div>
        </div>

        {/* SEÇÃO DE INTERAÇÃO: PEDIDOS DE ORAÇÃO */}
        <div className="space-y-8 pt-10">
          <div className="flex items-center gap-4">
            <Users className="text-destaque" />
            <h2 className="font-display text-6xl tracking-tight">O Clamor da <span className="text-destaque">Igreja</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pedidos.map((p) => (
              <div key={p.id} className="glass p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-destaque/30 transition-all group border border-white/5">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <span className="bg-white/5 px-3 py-1 rounded-full text-[9px] font-bold uppercase text-destaque tracking-widest">Pendente</span>
                    <p className="text-[10px] text-white/20 font-bold">{p.data?.toDate().toLocaleDateString('pt-BR')}</p>
                  </div>
                  <p className="text-lg leading-relaxed text-white/90 font-light italic tracking-wide">
                    "{p.conteudo}"
                  </p>
                </div>
                
                <button
                  onClick={async () => { if(window.confirm("Confirmar Oração?")) await deleteDoc(doc(db, "pedidos_oracao", p.id)) }}
                  className="mt-10 w-full bg-white/5 hover:bg-destaque hover:text-primaria py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
                >
                  Marcar como Orado
                </button>
              </div>
            ))}
            {pedidos.length === 0 && (
              <div className="col-span-full py-20 text-center glass rounded-[3rem] border-dashed border-2 border-white/5">
                <p className="text-white/20 uppercase tracking-[0.5em] text-sm italic">Todos os pedidos estão no altar</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}