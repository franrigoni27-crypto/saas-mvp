import { createClient } from "@/lib/supabase/server"; // Asegúrate de tener tu cliente de servidor configurado
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

// Si no tienes configurado @/lib/supabase/server, avísame y te paso el código de ese archivo.
// Por defecto en Next.js 14 con Supabase suele estar ahí o en utils/supabase/server.ts

export default async function PortfolioIndexPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { slug } = params;

  // 1. Obtener Negocio y sus Items de Portfolio
  // Usamos una sola consulta con JOIN para ser eficientes
  const { data: negocio } = await supabase
    .from("negocios")
    .select("*, portfolio_items(*)")
    .eq("slug", slug)
    .single();

  if (!negocio) return notFound();

  // 2. Extraer estilos de la configuración existente (JSON)
  // Esto asegura coherencia visual sin duplicar configuraciones
  const config = negocio.config_web || {};
  const primaryColor = config.colors?.primary || '#000000';
  const fontFamily = config.appearance?.font === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)';

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily }}>
      
      {/* HEADER SIMPLE */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center">
        <Link 
            href={`/${slug}`} 
            className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: primaryColor }}
        >
            <ArrowLeft size={16} /> Volver al Inicio
        </Link>
        <span className="font-bold text-lg tracking-tight">{negocio.nombre}</span>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <header className="mb-16 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-light text-stone-900 mb-4">
                Nuestros Proyectos
            </h1>
            <p className="text-lg text-stone-500">
                Una selección de trabajos realizados con dedicación y detalle.
            </p>
        </header>

        {/* GRILLA DE PROYECTOS (SQL DATA) */}
        {(!negocio.portfolio_items || negocio.portfolio_items.length === 0) ? (
            <div className="p-10 border border-dashed border-stone-300 rounded-xl text-center text-stone-400">
                Aún no hay proyectos cargados en este portfolio.
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {negocio.portfolio_items.map((item: any) => (
                    <Link 
                        key={item.id} 
                        href={`/${slug}/portfolio/${item.slug}`}
                        className="group block cursor-pointer"
                    >
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-stone-200 mb-5 relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                            {item.imagen_portada ? (
                                <img 
                                    src={item.imagen_portada} 
                                    alt={item.titulo} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400">Sin Imagen</div>
                            )}
                            
                            {/* Overlay Hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>

                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-stone-900 group-hover:text-purple-700 transition-colors mb-2">
                                    {item.titulo}
                                </h3>
                                <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed">
                                    {item.descripcion_corta}
                                </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 text-purple-600">
                                <ExternalLink size={20} />
                            </div>
                        </div>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-2 mt-4">
                                {item.tags.map((tag: string) => (
                                    <span key={tag} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-white border border-stone-200 rounded text-stone-500">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}