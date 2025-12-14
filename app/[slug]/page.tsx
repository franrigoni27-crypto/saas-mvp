import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import LandingCliente from "./LandingCliente";
import LandingAgencia from "./LandingAgencia";

// NOTA: En Next.js 15+, params es una Promise<{ slug: string }>
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  
  // 1. OBLIGATORIO: Desempaquetar params con await
  const { slug } = await params;

  console.log("--- ROUTER MAESTRO ---");
  console.log("Slug buscado:", slug);

  // ---------------------------------------------------------
  // INTENTO A: Buscar en tabla de NEGOCIOS (Clientes finales)
  // ---------------------------------------------------------
  const { data: negocio } = await supabase
    .from("negocios")
    .select("*")
    .eq("slug", slug)
    .single();

  if (negocio) {
    console.log(">> Es un Negocio:", negocio.nombre);
    // Renderizamos la landing del cliente
    return <LandingCliente initialData={negocio} />;
  }

  // ---------------------------------------------------------
  // INTENTO B: Buscar en tabla de AGENCIAS (Tu SaaS)
  // ---------------------------------------------------------
  const { data: agencia } = await supabase
    .from("agencies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (agencia) {
    console.log(">> Es una Agencia:", agencia.name);
    // Renderizamos la landing de la agencia
    // Le pasamos los datos directo para que no tenga que volver a consultar
    return <LandingAgencia initialData={agencia} />;
  }

  // ---------------------------------------------------------
  // INTENTO C: No existe en ninguno -> Error 404
  // ---------------------------------------------------------
  console.log(">> No encontrado (404)");
  return notFound();
}