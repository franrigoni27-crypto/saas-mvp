"use client";
import { createClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { SafeHTML } from "@/components/ui/SafeHTML"; // Asegúrate de que esta ruta sea correcta

export default async function ProjectDetailPage({ params }: { params: { slug: string, projectSlug: string } }) {
  const supabase = createClient();
  const { slug, projectSlug } = params;

  // 1. Obtener Negocio
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre, config_web")
    .eq("slug", slug)
    .single();

  if (!negocio) return notFound();

  // 2. Obtener el Proyecto Específico
  // Filtramos por negocio_id para seguridad (evitar ver proyectos de otros)
  const { data: proyecto } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("negocio_id", negocio.id)
    .eq("slug", projectSlug)
    .single();

  if (!proyecto) return notFound();

  // Estilos dinámicos
  const config = negocio.config_web || {};
  const fontFamily = config.appearance?.font === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)';

  return (
    <div className="min-h-screen bg-white pb-20" style={{ fontFamily }}>
        
        {/* NAVEGACIÓN */}
        <div className="max-w-5xl mx-auto px-6 py-8">
            <Link 
                href={`/${slug}/portfolio`} 
                className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-8 text-sm font-medium"
            >
                <ArrowLeft size={16}/> Volver al Portfolio
            </Link>
        </div>

        <article className="max-w-5xl mx-auto px-6 animate-in fade-in duration-700">
            {/* ENCABEZADO PROYECTO */}
            <header className="text-center max-w-3xl mx-auto mb-12">
                <div className="flex justify-center gap-2 mb-6">
                    {proyecto.tags?.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold uppercase tracking-wide">
                            {tag}
                        </span>
                    ))}
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-medium text-stone-900 mb-6 leading-tight">
                    {proyecto.titulo}
                </h1>
                <p className="text-xl text-stone-500 font-light leading-relaxed">
                    {proyecto.descripcion_corta}
                </p>
            </header>

            {/* IMAGEN PRINCIPAL */}
            <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-2xl mb-16 bg-stone-100">
                <img 
                    src={proyecto.imagen_portada} 
                    alt={proyecto.titulo} 
                    className="w-full h-full object-cover"
                />
            </div>

            {/* CONTENIDO (HTML RICO) */}
            <div className="grid md:grid-cols-12 gap-12">
                <div className="md:col-span-8 prose prose-stone prose-lg">
                    {/* Renderizamos el contenido HTML guardado en BD */}
                    <SafeHTML html={proyecto.contenido_html || "<p>Sin descripción detallada.</p>"} />
                </div>
                
                {/* SIDEBAR DE DETALLES */}
                <aside className="md:col-span-4 space-y-8">
                    <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                        <h3 className="font-bold text-stone-900 mb-4 uppercase text-xs tracking-widest border-b border-stone-200 pb-2">Detalles</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3 text-stone-600">
                                <Calendar size={16} className="text-stone-400"/>
                                <span>Publicado: {new Date(proyecto.created_at).toLocaleDateString()}</span>
                            </li>
                            <li className="flex items-center gap-3 text-stone-600">
                                <Tag size={16} className="text-stone-400"/>
                                <span>Categoría: {proyecto.tags?.[0] || 'General'}</span>
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>
            
            {/* GALERÍA EXTRA (Si existe) */}
            {proyecto.galeria && proyecto.galeria.length > 0 && (
                <div className="mt-20 pt-10 border-t border-stone-100">
                    <h3 className="text-2xl font-serif mb-8 text-center">Galería del Proyecto</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {proyecto.galeria.map((img: string, i: number) => (
                            <img key={i} src={img} className="rounded-xl w-full h-auto object-cover hover:opacity-95 transition-opacity cursor-pointer" />
                        ))}
                    </div>
                </div>
            )}

        </article>
    </div>
  );
}