import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import LandingCliente from "./LandingCliente";

// NOTA: En Next.js 15+, params es una Promise<{ slug: string }>
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();

  // 1. AHORA ES OBLIGATORIO: Esperar (await) a que params se resuelva
  const { slug } = await params;

  // Debug logs usando la variable ya extraída 'slug'
  console.log("--- DEBUG START ---");
  console.log("Slug buscado en URL:", slug);

  const { data: negocio, error } = await supabase
    .from("negocios")
    .select("*")
    .eq("slug", slug) // Usamos la variable 'slug' limpia
    .single();

  // 2. Imprimir si hubo error o si trajo datos
  console.log("Error de Supabase:", error);
  console.log("Negocio encontrado:", negocio);
  console.log("--- DEBUG END ---");

  if (error || !negocio) {
    return notFound();
  }

  return <LandingCliente initialData={negocio} />;
}