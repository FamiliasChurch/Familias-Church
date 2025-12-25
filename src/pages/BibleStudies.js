import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { BookOpen, PenTool, Calendar, Send, Sparkles, Share2 } from "lucide-react";
export default function BibleStudies({ userRole, userName }) {
    const [estudos, setEstudos] = useState([]);
    const [loading, setLoading] = useState(false);
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
    const handlePost = async (e) => {
        e.preventDefault();
        if (!titulo || !conteudo)
            return;
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
        }
        catch (err) {
            console.error("Erro ao publicar:", err);
        }
        finally {
            setLoading(false);
        }
    };
    const podePostar = ["Pastor", "Apóstolo", "Dev"].includes(userRole);
    return (<div className="min-h-screen bg-background p-6 pt-32 text-white font-body">
      <div className="container mx-auto space-y-20">

        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destaque/10 border border-destaque/20 text-destaque text-[10px] font-black uppercase tracking-[0.3em]">
            <Sparkles size={12}/> Alimento Espiritual
          </div>
          <h1 className="font-display text-7xl md:text-9xl tracking-tighter text-gradient leading-[0.8]">Estudos &<br />Devocionais</h1>
        </div>

        {podePostar && (<section className="max-w-3xl mx-auto transform hover:scale-[1.01] transition-transform">
            <div className="glass p-12 rounded-[4rem] border border-destaque/20 shadow-glow space-y-10">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <PenTool className="text-destaque" size={28}/>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Liberar uma Palavra</h2>
              </div>

              <form onSubmit={handlePost} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-white/30 ml-2">Título da Mensagem</p>
                    <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: A Graça que nos Sustenta" className="glass p-5 rounded-2xl outline-none focus:border-destaque/50 w-full text-lg" required/>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-white/30 ml-2">Categoria</p>
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="glass p-5 rounded-2xl outline-none focus:border-destaque/50 w-full text-white/60 appearance-none">
                      <option value="Devocional">Devocional Diário</option>
                      <option value="Estudo">Estudo Bíblico</option>
                      <option value="Palavra">Palavra Profética</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-white/30 ml-2">Conteúdo da Revelação</p>
                  <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} placeholder="O que o Espírito diz à igreja hoje?" rows={8} className="w-full glass p-8 rounded-[2.5rem] outline-none focus:border-destaque/50 resize-none leading-relaxed" required/>
                </div>

                <button disabled={loading} className="w-full bg-destaque text-primaria py-5 rounded-full font-black uppercase text-sm tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-4 shadow-xl">
                  {loading ? (<div className="h-5 w-5 border-2 border-primaria/30 border-t-primaria rounded-full animate-spin"/>) : (<> <Send size={18}/> PUBLICAR NO FEED </>)}
                </button>
              </form>
            </div>
          </section>)}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {estudos.map((estudo) => (<article key={estudo.id} className="glass p-12 rounded-[4rem] border border-white/5 flex flex-col justify-between group hover:bg-white/[0.02] transition-all">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-destaque/10 flex items-center justify-center">
                      <BookOpen size={20} className="text-destaque"/>
                    </div>
                    <span className="bg-white/5 text-white/40 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5">
                      {estudo.categoria}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold">
                    <Calendar size={12}/>
                    {estudo.data ? estudo.data.toDate().toLocaleDateString('pt-BR') : 'Postando...'}
                  </div>
                </div>

                <h3 className="text-4xl font-black leading-none tracking-tighter group-hover:text-destaque transition-colors uppercase">
                  {estudo.titulo}
                </h3>

                <p className="text-white/50 leading-relaxed text-lg line-clamp-5 font-light italic">
                  "{estudo.conteudo}"
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-destaque flex items-center justify-center text-primaria font-black text-[10px]">
                    {estudo.autor?.substring(0, 1)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-destaque leading-none">{estudo.autor}</p>
                    <p className="text-[8px] text-white/20 uppercase tracking-tighter">Autor da Mensagem</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="text-white/20 hover:text-white transition-colors"><Share2 size={16}/></button>
                  <button className="text-destaque text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                    Ler Estudo Completo
                  </button>
                </div>
              </div>
            </article>))}
        </section>

      </div>
    </div>);
}
