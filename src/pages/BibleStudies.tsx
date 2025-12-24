import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { BookOpen, PenTool, Calendar, User, Tag, Send } from "lucide-react";

export default function BibleStudies({ userRole, userName }: { userRole: string, userName: string }) {
  const [estudos, setEstudos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados do Formulário
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("Devocional");

  useEffect(() => {
    const q = query(collection(db, "estudos_biblicos"), orderBy("data", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEstudos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !conteudo) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, "estudos_biblicos"), {
        titulo,
        conteudo,
        categoria,
        autor: userName,
        data: serverTimestamp(),
      });
      setTitulo("");
      setConteudo("");
      alert("Palavra publicada com sucesso!");
    } catch (err) {
      alert("Erro ao publicar estudo.");
    } finally {
      setLoading(false);
    }
  };

  // Verifica se o cargo atual permite postar
  const podePostar = ["Pastor", "Apóstolo", "Dev"].includes(userRole);

  return (
    <div className="min-h-screen bg-background p-6 pt-32 text-white font-body">
      <div className="container mx-auto space-y-16">
        
        {/* HEADER */}
        <div className="text-center space-y-4">
          <h1 className="font-display text-7xl md:text-8xl tracking-tighter text-gradient leading-none">Estudos & <br/>Devocionais</h1>
          <p className="text-white/40 uppercase tracking-[0.4em] text-[10px] font-bold italic">Alimento diário para a Família Church</p>
        </div>

        {/* ÁREA DE CRIAÇÃO (SÓ PARA LIDERANÇA) */}
        {podePostar && (
          <section className="max-w-4xl mx-auto">
            <div className="glass p-10 rounded-[3rem] border border-destaque/20 space-y-8">
              <div className="flex items-center gap-4">
                <PenTool className="text-destaque" />
                <h2 className="text-2xl font-bold uppercase tracking-widest">Nova Publicação</h2>
              </div>
              
              <form onSubmit={handlePost} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <input 
                    value={titulo} 
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Título do Estudo" 
                    className="glass p-4 rounded-2xl outline-none focus:border-destaque/50 w-full" 
                    required 
                  />
                  <select 
                    value={categoria} 
                    onChange={(e) => setCategoria(e.target.value)}
                    className="glass p-4 rounded-2xl outline-none focus:border-destaque/50 w-full text-white/60"
                  >
                    <option value="Devocional">Devocional Diário</option>
                    <option value="Estudo">Estudo Bíblico Profundo</option>
                    <option value="Palavra">Palavra Profética</option>
                  </select>
                </div>
                
                <textarea 
                  value={conteudo} 
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Escreva a mensagem aqui..." 
                  rows={6}
                  className="w-full glass p-6 rounded-3xl outline-none focus:border-destaque/50 resize-none"
                  required
                />

                <button 
                  disabled={loading}
                  className="w-full bg-white text-primaria py-4 rounded-full font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                >
                  <Send size={16} /> {loading ? "PUBLICANDO..." : "PUBLICAR NO FEED"}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* FEED DE CONTEÚDO */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {estudos.map((estudo) => (
            <article key={estudo.id} className="glass p-10 rounded-[3rem] border border-white/5 flex flex-col justify-between group hover:border-destaque/30 transition-all">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="bg-destaque/10 text-destaque px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {estudo.categoria}
                  </span>
                  <div className="flex items-center gap-2 text-white/30 text-[10px]">
                    <Calendar size={12} />
                    {estudo.data?.toDate().toLocaleDateString('pt-BR')}
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold leading-tight group-hover:text-destaque transition-colors">
                  {estudo.titulo}
                </h3>
                
                <p className="text-white/60 leading-relaxed line-clamp-4 italic">
                  {estudo.conteudo}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white/40">
                  <User size={14} className="text-destaque" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{estudo.autor}</span>
                </div>
                <button className="text-destaque text-[10px] font-black uppercase tracking-widest hover:underline">
                  Ler Completo
                </button>
              </div>
            </article>
          ))}
        </section>

      </div>
    </div>
  );
}