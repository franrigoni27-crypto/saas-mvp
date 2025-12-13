"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Building2, Store, Users, LogOut, Loader2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

// --- CAMBIA ESTO POR TU EMAIL REAL ---
const SUPER_ADMIN_EMAIL = "franrigoni27@gmail.com"; // O el que uses

export default function SuperAdminDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [stats, setStats] = useState({ agencias: 0, negocios: 0, ingresos: 0 });
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  async function checkSuperAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Seguridad Frontend (El middleware protege, pero esto es doble capa)
    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
      router.push("/login");
      return;
    }

    // Cargar datos globales
    // NOTA: Esto requiere que las políticas RLS permitan al Super Admin hacer SELECT
    const { data: agenciasData } = await supabase.from("agencies").select("*, negocios(count)");
    const { count: negociosCount } = await supabase.from("negocios").select("*", { count: 'exact', head: true });

    if (agenciasData) {
        setAgencies(agenciasData);
        setStats({
            agencias: agenciasData.length,
            negocios: negociosCount || 0,
            ingresos: agenciasData.length * 29 // Ejemplo: $29 por agencia
        });
    }
    setLoading(false);
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg"><Building2 size={20}/></div>
                <h1 className="font-bold text-lg">Panel Maestro</h1>
            </div>
            <button onClick={() => supabase.auth.signOut().then(() => router.push("/login"))} className="text-slate-400 hover:text-white flex gap-2 text-sm font-medium transition-colors">
                <LogOut size={18}/> Salir
            </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <KpiCard title="Agencias Activas" value={stats.agencias} icon={<Building2 className="text-blue-400"/>} />
            <KpiCard title="Negocios Totales" value={stats.negocios} icon={<Store className="text-emerald-400"/>} />
            <KpiCard title="MRR Estimado" value={`$${stats.ingresos}k`} icon={<TrendingUp className="text-purple-400"/>} />
        </div>

        {/* Tabla de Agencias */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="font-bold text-xl">Agencias Registradas</h2>
                <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400">Total: {agencies.length}</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-800/50 text-slate-200 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Nombre Agencia</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4 text-center">Clientes</th>
                            <th className="px-6 py-4">Fecha Alta</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {agencies.map((agency) => (
                            <tr key={agency.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{agency.nombre_agencia}</td>
                                <td className="px-6 py-4"><span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs border border-blue-800">{agency.plan}</span></td>
                                <td className="px-6 py-4 text-center font-mono">{agency.negocios[0]?.count || 0}</td>
                                <td className="px-6 py-4">{new Date(agency.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-400 hover:underline text-xs">Administrar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ title, value, icon }: any) {
    return (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white">{value}</h3>
            </div>
            <div className="p-3 bg-slate-800 rounded-xl">{icon}</div>
        </div>
    )
}