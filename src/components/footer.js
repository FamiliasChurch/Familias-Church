import { Instagram, Facebook, Youtube, MapPin, Phone, Church } from "lucide-react";
export default function Footer() {
    return (<footer className="bg-background border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* IDENTIDADE */}
        <div className="space-y-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Church className="text-destaque" size={32}/>
            <span className="font-display text-3xl font-bold">FAMÍLIAS CHURCH</span>
          </div>
          <p className="text-white/50 italic text-sm leading-relaxed">
            "Uma família para você pertencer. Restaurando vidas em Fazenda Rio Grande e Tijucas."
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <Instagram className="hover:text-destaque cursor-pointer"/>
            <Facebook className="hover:text-destaque cursor-pointer"/>
            <Youtube className="hover:text-destaque cursor-pointer"/>
          </div>
        </div>

        {/* CONTATO */}
        <div className="space-y-4 text-center md:text-left">
          <h3 className="font-bold text-destaque uppercase tracking-widest text-sm">Contato</h3>
          <div className="flex flex-col items-center md:items-start gap-3 text-white/60 text-sm">
            <div className="flex items-center gap-2"><MapPin size={16}/> Fazenda Rio Grande, PR</div>
            <div className="flex items-center gap-2"><Phone size={16}/> (41) 99999-9999</div>
          </div>
        </div>

        {/* MAPA (Responsivo) */}
        <div className="rounded-3xl overflow-hidden h-48 lg:h-full glass border border-white/5">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3598.677!2d-49.3039!3d-25.6156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dcf97424075133%3A0xb2490544f83e843c!2sR.%20Cassuarina%2C%20219%20-%20Eucaliptos%2C%20Fazenda%20Rio%20Grande%20-%20PR!5e0!3m2!1spt-BR!2sbr!4v1735011600000" className="w-full h-full grayscale invert opacity-30" loading="lazy"/>
        </div>
      </div>
      <div className="mt-16 text-center text-[10px] text-white/20 uppercase tracking-[0.3em]">
        © 2025 Famílias Church - Engenharia UniAmérica
      </div>
    </footer>);
}
