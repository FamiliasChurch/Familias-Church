import { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Heart, Copy, Check, Upload, MapPin, Clock } from "lucide-react";
import Hooter from "../components/header";
import Feader from "../components/footer";


export default function Donations() {
  const [tab, setTab] = useState<'oferta' | 'dizimo'>('oferta');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Chave Pix da Igreja (CNPJ)
  const pixChave = "00.000.000/0001-00";

  const handleCopy = () => {
    navigator.clipboard.writeText(pixChave);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDizimo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await addDoc(collection(db, "registros_dizimos"), {
        valor: formData.get("valor"),
        data: serverTimestamp(),
        tipo: "Dízimo",
        status: "Pendente Verificação"
      });
      alert("Dízimo registrado! Por favor, guarde seu comprovante.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      alert("Erro ao registrar dízimo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen">
      <div className="min-h-screen bg-background text-white font-body selection:bg-destaque/30 pt-28">
        <main className="container mx-auto px-6 pb-24">

          {/* HERO DA PÁGINA */}
          <div className="text-center space-y-4 mb-20">
            <h1 className="font-display text-8xl md:text-[10rem] tracking-tighter uppercase">CONTRIBUA</h1>
            <p className="text-destaque italic text-xl">"Cada um contribua segundo propôs no seu coração"</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">

            {/* CARD 1: SOLIDÁRIO */}
            <div className="glass p-12 rounded-[3rem] space-y-8 border-t-4 border-destaque">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl">❤️</div>
              <div className="space-y-4">
                <h2 className="text-4xl font-bold">Alimentos e Roupas</h2>
                <p className="text-white/60">Recebemos doações físicas em nossa sede para auxiliar famílias da região de Fazenda Rio Grande.</p>
              </div>

              <div className="glass p-6 rounded-2xl space-y-4 text-sm border-white/5">
                <div className="flex items-start gap-3">
                  <MapPin className="text-destaque shrink-0" size={20} />
                  <p>Rua Cassuarina, 219 - Eucaliptos<br />Fazenda Rio Grande - PR</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-destaque shrink-0" size={20} />
                  <p>Quintas às 20h e Domingos às 19h</p>
                </div>
              </div>
            </div>

            {/* CARD 2: FINANCEIRO (PIX) */}
            <div className="glass p-12 rounded-[3rem] space-y-8 border-t-4 border-white/20">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl">🕊️</div>
              <h2 className="text-4xl font-bold">Semeie</h2>

              {/* TOGGLE SWITCH */}
              <div className="flex p-1 bg-white/5 rounded-full">
                <button
                  onClick={() => setTab('oferta')}
                  className={`flex-1 py-3 rounded-full font-bold transition-all ${tab === 'oferta' ? 'bg-destaque text-primaria' : 'hover:text-destaque'}`}
                >
                  Oferta
                </button>
                <button
                  onClick={() => setTab('dizimo')}
                  className={`flex-1 py-3 rounded-full font-bold transition-all ${tab === 'dizimo' ? 'bg-destaque text-primaria' : 'hover:text-destaque'}`}
                >
                  Dízimo
                </button>
              </div>

              {/* CONTEÚDO PIX */}
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-white/50 text-center italic">
                  {tab === 'oferta'
                    ? "Para ofertas, não é necessária identificação. Deus abençoe!"
                    : "Para dízimos, preencha todas as informações abaixo."}
                </p>

                <div className="glass p-8 rounded-[2rem] text-center space-y-4 border-dashed border-2 border-white/10">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/40">Chave Pix (CNPJ)</span>
                  <div className="text-2xl md:text-3xl font-mono font-bold text-destaque break-all">{pixChave}</div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 mx-auto bg-white/5 hover:bg-white/10 px-6 py-2 rounded-full transition-all"
                  >
                    {copied ? <Check className="text-green-400" size={18} /> : <Copy size={18} />}
                    <span className="font-bold text-sm">{copied ? "Copiado!" : "Copiar Chave"}</span>
                  </button>
                </div>

                {/* FORMULÁRIO DE DÍZIMO (MODIFICADO) */}
                {tab === 'dizimo' && (
                  <form onSubmit={handleDizimo} className="space-y-6 pt-6">

                    {/* CAMPO NOME - OBRIGATÓRIO */}
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold uppercase ml-4 text-white/40 tracking-widest">Seu Nome Completo</label>
                      <input
                        name="nome"
                        type="text"
                        required
                        placeholder="Nome Completo"
                        className="w-full glass p-4 rounded-2xl outline-none focus:border-destaque/50 text-lg text-white"
                      />
                    </div>

                    {/* CAMPO VALOR - OBRIGATÓRIO */}
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold uppercase ml-4 text-white/40 tracking-widest">Valor da Contribuição</label>
                      <input
                        name="valor"
                        type="number"
                        step="0.01"
                        required
                        placeholder="R$ 0,00"
                        className="w-full glass p-4 rounded-2xl outline-none focus:border-destaque/50 text-xl font-bold text-destaque"
                      />
                    </div>

                    {/* CAMPO COMPROVANTE - OBRIGATÓRIO */}
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold uppercase ml-4 text-white/40 tracking-widest">Anexar Comprovante (Foto/PDF)</label>
                      <div className="relative group">
                        <input
                          name="comprovante"
                          type="file"
                          required
                          accept="image/*,application/pdf"
                          className="w-full glass p-4 rounded-2xl outline-none focus:border-destaque/50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-destaque file:text-primaria cursor-pointer"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-white text-primaria py-5 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 shadow-glow"
                    >
                      {loading ? "PROCESSANDO REGISTRO..." : "REGISTRAR NO ALTAR"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
        <footer />
      </div>
    </div>
  );
}