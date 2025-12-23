"use client";
import { ArrowRight, MapPin, Instagram } from "lucide-react";
import { SafeHTML } from "../../../ui/SafeHTML";
import { Footer } from "../../../blocks/Footer";         // Subimos 4 niveles
import SharedModals from "../../../ui/SharedModals";

export default function SpecializedLanding({ logic }: any) {
  const { negocio, ui } = logic;
  const config = negocio?.config_web || {};
  
  const handleEditClick = (e: React.MouseEvent, section: string) => {
    const isEditor = typeof window !== 'undefined' && window.location.search.includes('editor=true');
    if(isEditor) { e.preventDefault(); e.stopPropagation(); window.parent.postMessage({ type: "FOCUS_SECTION", section }, "*"); }
  };

  const heroImage = config.hero?.imagenUrl || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600";

  return (
    <div className="min-h-screen bg-stone-50 font-serif text-stone-900">
      
      {/* 1. HERO INMERSIVO (Full Screen) */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden" onClick={(e) => handleEditClick(e, 'hero')}>
          <div className="absolute inset-0 z-0">
             <img src={heroImage} className="w-full h-full object-cover opacity-90" alt="Hero"/>
             <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          <div className="relative z-10 text-center text-white px-6 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
              <p className="text-sm md:text-base tracking-[0.2em] uppercase mb-4 opacity-90 font-sans">
                  {negocio.nombre}
              </p>
              <SafeHTML as="h1" html={config.hero?.titulo || "Diseño Interior"} className="text-5xl md:text-7xl font-light mb-6 leading-tight" />
              <SafeHTML as="p" html={config.hero?.subtitulo || "Transformamos espacios en experiencias."} className="text-lg md:text-xl font-light opacity-90 mb-10 font-sans" />
              
              <button 
                onClick={() => ui.setModals((p:any) => ({...p, booking: true}))}
                className="bg-white text-stone-900 px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-stone-200 transition-colors font-sans"
              >
                Agendar Reunión
              </button>
          </div>
      </section>

      {/* 2. INTRODUCCIÓN / METODOLOGÍA */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-8 italic">"El diseño es inteligencia visible."</h2>
          <div className="w-20 h-0.5 bg-stone-300 mx-auto mb-8"></div>
          <p className="text-stone-600 leading-relaxed font-sans">
              Nos especializamos en crear entornos que no solo se ven bien, sino que se sienten bien. 
              Cada proyecto comienza con una consulta detallada para entender tus necesidades.
          </p>
      </section>

      {/* 3. SERVICIOS COMO "ÁREAS DE EXPERIENCIA" */}
      {config.beneficios?.mostrar && (
          <section className="py-20 bg-white" onClick={(e) => handleEditClick(e, 'beneficios')}>
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-12">
                    {config.beneficios?.items?.map((item:any, i:number) => (
                        <div key={i} className="space-y-4">
                            <span className="text-4xl text-stone-200 font-bold font-sans">0{i+1}</span>
                            <h3 className="text-xl font-medium tracking-wide uppercase">{item.titulo}</h3>
                            <p className="text-stone-500 font-sans text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
          </section>
      )}

      {/* 4. FOOTER MINIMALISTA */}
      <footer className="bg-stone-900 text-stone-400 py-16 px-6 text-center font-sans text-sm">
          <div className="mb-8 flex justify-center gap-6">
             {negocio.instagram && <Instagram size={20}/>}
             {negocio.direccion && <div className="flex items-center gap-2"><MapPin size={16}/> {negocio.direccion}</div>}
          </div>
          <p>© {new Date().getFullYear()} {negocio.nombre}. Todos los derechos reservados.</p>
      </footer>

      {/* 5. MODALES COMPARTIDOS */}
      <SharedModals logic={logic} />
    </div>
  );
}