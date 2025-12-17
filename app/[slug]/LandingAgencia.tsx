"use client"; // Lo convertimos a cliente para que los botones y links funcionen suave
import { Building2, ArrowRight, LayoutDashboard } from "lucide-react";

export default function LandingAgencia({ initialData }: { initialData: any }) {
  // Recibimos los datos ya cargados desde el archivo principal
  const agency = initialData;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* Logo y Nombre */}
            <div className="flex items-center gap-3">
                {agency.logo_url ? (
                    <img src={agency.logo_url} className="h-10 w-auto object-contain" alt="Logo"/>
                ) : (
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Building2 size={20} />
                    </div>
                )}
                {/* Usamos nombre_agencia o name como fallback */}
                <span className="font-bold text-xl tracking-tight">{agency.nombre_agencia || agency.name || "Agencia Digital"}</span>
            </div>

            {/* Acciones Header */}
            <div className="flex items-center gap-4">
                {/* Link Inteligente al Dashboard (Solo visible si eres el dueño, pero lo dejamos público por ahora para facilitar tu acceso) */}
                <a 
                  href={`/${agency.slug}/dashboard`} 
                  className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mr-2"
                  title="Ir al panel de control"
                >
                    <LayoutDashboard size={16}/> Dashboard
                </a>

                <a href="#contact" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
                    Contactar
                </a>
            </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mb-8 border border-indigo-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-indigo-400"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Agencia Certificada
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-slate-900 leading-[1.1]">
            {agency.descripcion || "Transformamos negocios con soluciones digitales."}
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Especialistas en crear software y páginas web que ayudan a negocios locales a escalar y vender más.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                Solicitar Servicios <ArrowRight size={20}/>
            </button>
            <button className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center">
                Ver Portafolio
            </button>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="py-10 text-center text-slate-400 text-sm border-t border-slate-200 mt-20 bg-white">
        <p>© {new Date().getFullYear()} {agency.nombre_agencia || agency.name}. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}