"use client";
import { Phone, Clock, MapPin, Calendar as CalendarIcon, Star, CheckCircle } from "lucide-react";
import { SafeHTML } from "../../ui/SafeHTML";        
import { Footer } from "../../blocks/Footer";        
import SharedModals from "../../ui/SharedModals";

export default function GeneralLanding({ logic }: any) {
  const { negocio, ui } = logic;
  const config = negocio?.config_web || {};
  
  // Helpers
  const handleEditClick = (e: React.MouseEvent, section: string) => {
    // Lógica para enviar mensaje al editor (si aplica)
    const isEditor = typeof window !== 'undefined' && window.location.search.includes('editor=true');
    if(isEditor) { e.preventDefault(); e.stopPropagation(); window.parent.postMessage({ type: "FOCUS_SECTION", section }, "*"); }
  };

  const brandColor = negocio.color_principal || "#000000";

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      
      {/* 1. HEADER FUNCIONAL (Dirección y Horarios visibles rápido) */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
             {config.logoUrl ? (
                <img src={config.logoUrl} className="h-10 object-contain" alt="Logo" />
             ) : (
                <span className="font-bold text-xl tracking-tight">{negocio.nombre}</span>
             )}
             <button 
                onClick={() => ui.setModals((p:any) => ({...p, booking: true}))}
                className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-zinc-800 transition-all flex items-center gap-2"
                style={{ backgroundColor: brandColor }}
             >
                <CalendarIcon size={16}/> Reservar
             </button>
        </div>
      </div>

      {/* 2. HERO "AL GRANO" */}
      <section className="bg-white pb-12 pt-8 px-4 text-center border-b border-zinc-100" onClick={(e) => handleEditClick(e, 'hero')}>
         <div className="max-w-2xl mx-auto space-y-4">
            <SafeHTML as="h1" html={config.hero?.titulo || "Tu Estilo, Nuestro Arte"} className="text-4xl font-extrabold tracking-tight" />
            <SafeHTML as="p" html={config.hero?.subtitulo || "Reserva tu turno en segundos."} className="text-zinc-500 text-lg" />
            
            {/* Información rápida de contacto */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-500 pt-2">
                {negocio.direccion && <span className="flex items-center gap-1"><MapPin size={14}/> {negocio.direccion}</span>}
                {negocio.horarios && <span className="flex items-center gap-1"><Clock size={14}/> {negocio.horarios}</span>}
            </div>
         </div>
      </section>

      {/* 3. GRILLA DE SERVICIOS (El núcleo del negocio) */}
      {config.beneficios?.mostrar && (
          <section className="py-12 px-4 max-w-5xl mx-auto" onClick={(e) => handleEditClick(e, 'beneficios')}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle size={20} className="text-zinc-400"/> Servicios Disponibles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {config.beneficios?.items?.map((item:any, i:number) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => ui.setModals((p:any) => ({...p, booking: true}))}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{item.titulo}</h3>
                            <ArrowRightIcon className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" size={18}/>
                        </div>
                        <p className="text-sm text-zinc-500">{item.desc}</p>
                    </div>
                ))}
            </div>
          </section>
      )}

      {/* 4. CTA FINAL / RESEÑAS */}
      <section className="text-center py-10">
         <button onClick={() => ui.setModals((p:any) => ({...p, feedback: true}))} className="text-zinc-400 hover:text-zinc-900 text-sm font-medium flex items-center justify-center gap-2 mx-auto">
            <Star size={16}/> Dejar una opinión
         </button>
      </section>

      <Footer data={config.footer} negocioNombre={negocio.nombre} />
      
      {/* 5. MODALES COMPARTIDOS (Aquí ocurre la magia) */}
      <SharedModals logic={logic} />
    </div>
  );
}

const ArrowRightIcon = ({className, size}: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
)