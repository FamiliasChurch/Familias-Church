import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { db, storage } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Copy, Check, Heart, Wallet, Upload, Loader2 } from "lucide-react";

interface ContextType {
  userRole: string;
  userName: string;
}

export default function Donations() {
  const { userName } = useOutletContext<ContextType>();
  const [tab, setTab] = useState<'oferta' | 'dizimo'>('oferta');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const pixChave = "00.000.000/0001-00";

  useEffect(() => {
    setShowForm(true);
  }, []);

  const copyPix = () => {
    navigator.clipboard.writeText(pixChave);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContribuição = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const nome = formData.get("nome") as string;
    const valor = formData.get("valor") as string;
    const arquivo = formData.get("comprovante") as File;

    // VALIDAÇÃO DINÂMICA: Comprovante obrigatório apenas para Dízimo
    if (tab === 'dizimo' && (!arquivo || arquivo.size === 0)) {
      alert("Para Dízimos, por favor anexe o comprovante para a conferência da Tesouraria.");
      setLoading(false);
      return;
    }

    try {
      let downloadURL = "";
      
      // Upload apenas se houver arquivo selecionado
      if (arquivo && arquivo.size > 0) {
        const storageRef = ref(storage, `comprovantes/${Date.now()}_${arquivo.name}`);
        await uploadBytes(storageRef, arquivo);
        downloadURL = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "registros_dizimos"), {
        nome,
        valor: Number(valor),
        data: serverTimestamp(),
        tipo: tab === 'dizimo' ? "Dízimo" : "Oferta",
        status: "Pendente",
        comprovanteUrl: downloadURL // Pode ser string vazia se for oferta sem anexo
      });

      alert("Sua semente foi registrada! Deus abençoe generosamente.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error("Erro no Firebase:", err);
      alert("Erro ao registrar. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`transition-all duration-1000 ${showForm ? 'opacity-100' : 'opacity-0'}`}>
      <main className="container mx-auto px-6 pt-32 pb-24 text-center">
        <div className="mb-8 animate-pulse">
          <p className="text-destaque font-black uppercase tracking-[0.3em] text-[10px]">
            Bem-vindo ao Altar, {userName}
          </p>
        </div>

        <h1 className="font-display text-6xl md:text-[8rem] tracking-tighter uppercase mb-16 leading-none">
          CONTRIBUA
        </h1>

        <div className="grid md:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          <div className="glass p-10 rounded-[3rem] space-y-8 border border-white/5 text-left">
            <div className="flex items-center gap-4 text-destaque">
              <Wallet size={32} />
              <h2 className="text-3xl font-black uppercase italic">PIX Oficial</h2>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Utilize nossa chave CNPJ para dízimos e ofertas. O comprovante deve ser enviado ao lado para conferência da tesouraria.
            </p>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex justify-between items-center group">
              <div>
                <p className="text-[10px] uppercase font-bold text-destaque mb-1">Chave CNPJ</p>
                <code className="text-xl font-mono">{pixChave}</code>
              </div>
              <button onClick={copyPix} className="p-4 bg-destaque text-black rounded-xl hover:scale-110 transition-transform">
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <div className="glass p-10 rounded-[3rem] space-y-8 border-t-4 border-destaque shadow-2xl">
            <div className="flex bg-white/5 p-1 rounded-full w-full">
              <button onClick={() => setTab('oferta')} className={`flex-1 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${tab === 'oferta' ? 'bg-destaque text-black' : 'hover:text-white'}`}>Oferta</button>
              <button onClick={() => setTab('dizimo')} className={`flex-1 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${tab === 'dizimo' ? 'bg-destaque text-black' : 'hover:text-white'}`}>Dízimo</button>
            </div>

            <form onSubmit={handleContribuição} className="space-y-4 text-left">
              <input name="nome" required placeholder="Nome do Doador" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-destaque outline-none" />
              <input name="valor" type="number" step="0.01" required placeholder="Valor (R$)" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-destaque outline-none" />
              
              <div className="relative group">
                <label className="text-[10px] uppercase font-bold ml-4 mb-2 block text-white/40">Comprovante {tab === 'dizimo' ? '(Obrigatório)' : '(Opcional)'}</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10">
                  <Upload size={24} className="text-destaque mb-2" />
                  <p className="text-xs text-white/40">Clique para enviar</p>
                  <input name="comprovante" type="file" className="hidden" accept="image/*,application/pdf" />
                </label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-destaque text-black font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <Heart size={18} />}
                {loading ? "Processando..." : "Confirmar Semente"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}