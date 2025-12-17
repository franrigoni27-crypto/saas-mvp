import { createClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import DashboardAgencia from "./DashboardAgencia";
import DashboardCliente from "./DashboardCliente";

// Este archivo actúa como el "Router" de GoHighLevel.
// Decide qué mostrar según el SLUG de la URL.
export default async function DashboardPage({ params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const supabase = createClient();

  // 1. Buscamos si el SLUG pertenece a una AGENCIA
  const { data: agencia } = await supabase
    .from("agencies")
    .select("id")
    .eq("slug", params.slug)
    .single();

  if (agencia) {
    return <DashboardAgencia />;
  }

  // 2. Si no es agencia, buscamos si es un NEGOCIO (Cliente)
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("slug", params.slug)
    .single();

  if (negocio) {
    return <DashboardCliente />;
  }

  // 3. Si no existe ni agencia ni negocio con ese nombre
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-slate-400">No encontramos ninguna cuenta con el slug: <span className="text-yellow-400">{params.slug}</span></p>
        <a href="/" className="mt-8 px-6 py-3 bg-indigo-600 rounded-full hover:bg-indigo-500 transition">Volver al Inicio</a>
    </div>
  );
}