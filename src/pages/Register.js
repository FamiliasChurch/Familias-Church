import { useState } from "react";
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
export default function Register({ netlifyUser }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        await setDoc(doc(db, "usuarios", netlifyUser.id), {
            nome: fd.get("nome"),
            nascimento: fd.get("nascimento"),
            sexo: fd.get("sexo"),
            telefone: fd.get("telefone"),
            email: netlifyUser.email,
            cargo: "Congregado", // Cargo inicial padrão
            foto: "https://www.w3schools.com/howto/img_avatar.png"
        });
        setLoading(false);
        navigate("/");
    };
    return (<div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <form onSubmit={handleSubmit} className="glass p-12 rounded-[3rem] max-w-lg w-full space-y-6">
        <h2 className="font-display text-5xl text-destaque text-center">Completar Cadastro</h2>
        <div className="space-y-4">
          <input name="nome" placeholder="Nome Completo" required className="w-full glass p-4 rounded-2xl outline-none focus:border-destaque/50"/>
          <div className="grid grid-cols-2 gap-4">
            <input name="nascimento" type="date" required className="glass p-4 rounded-2xl outline-none focus:border-destaque/50"/>
            <select name="sexo" className="glass p-4 rounded-2xl outline-none focus:border-destaque/50">
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>
          <input name="telefone" placeholder="Telefone (WhatsApp)" required className="w-full glass p-4 rounded-2xl outline-none focus:border-destaque/50"/>
        </div>
        <button disabled={loading} className="w-full bg-white text-primaria py-4 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform">
          {loading ? "Salvando..." : "Finalizar Cadastro"}
        </button>
      </form>
    </div>);
}
