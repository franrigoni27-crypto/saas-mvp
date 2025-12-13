import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server"; // Usamos el cliente server
import { Building2, ArrowRight } from "lucide-react";

export default async function AgencyPublicPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  
  // Buscar agencia por slug
  const { data: agency } = await supabase
    .from("agencies")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!agency) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {agency.logo_url ? (
                    <img src={agency.logo_url} className="h-10 w-auto" alt="Logo"/>
                ) : (
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Building2/></div>
                )}
                <span className="font-bold text-xl">{agency.nombre_agencia}</span>
            </div>
            <a href="#contact" className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition-all">
                Contactar
            </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 tracking-tight">{agency.descripcion || "Soluciones Digitales"}</h1>
        <p className="text-xl text-slate-500 mb-10">
            Somos una agencia certificada especializada en ayudar a negocios locales a crecer.
        </p>
        <div className="flex justify-center gap-4">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-2">
                Solicitar Servicios <ArrowRight size={20}/>
            </button>
        </div>
      </section>

      {/* Aquí podrías añadir un grid con los "Negocios" de esta agencia si quieres mostrarlos como portafolio */}
    </div>
  );
}