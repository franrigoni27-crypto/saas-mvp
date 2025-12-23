"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Save, X, Briefcase, Loader2, Monitor, Smartphone, ExternalLink, Palette, Calendar, MapPin, UserCheck,Eye } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";

// CONFIGURACIÓN DEFAULT PARA ESPECIALIZADOS (CITAS)
const DEFAULT_CONFIG_SPECIALIZED = {
  template: "specialized",
  booking: {
    citaTitle: "Reserva tu Cita",
    citaBtnText: "Ver Disponibilidad",
    citaDesc: "Selecciona el día que prefieras para nuestra reunión."
  },
  appearance: { font: 'sans', radius: 'medium' },
  colors: { primary: "#7e22ce" }, // Morado por defecto
  hero: { 
    titulo: "Servicios Profesionales", 
    subtitulo: "Soluciones a medida para tus necesidades.", 
    ctaTexto: "Contactar Ahora", 
    mostrar: true
  },
  // Aquí usamos "Expertise" o "Servicios Especializados"
  beneficios: { 
    mostrar: true, 
    titulo: "Mis Especialidades", 
    items: [{ titulo: "Consultoría", desc: "Asesoramiento 1 a 1" }]
  },
  footer: { mostrar: true, textoCopyright: "Derechos reservados" }
};

export default function WebEditorSpecialized({ negocio, onClose, onSave }: any) {
  const supabase = createClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const sectionsRefs: any = {
    booking: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
    appearance: useRef<HTMLDivElement>(null),
    identity: useRef<HTMLDivElement>(null),
    hero: useRef<HTMLDivElement>(null),
    beneficios: useRef<HTMLDivElement>(null),
  };

  const [config, setConfig] = useState({ ...DEFAULT_CONFIG_SPECIALIZED, ...(negocio.config_web || {}) });
  const [dbFields, setDbFields] = useState({
    direccion: negocio.direccion || "",
    horarios: negocio.horarios || "",
    google_maps_link: negocio.google_maps_link || "" 
  });
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // --- LOGICA DE MENSAJES (Igual) ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "FOCUS_SECTION") {
            const sectionName = event.data.section;
            if (sectionsRefs[sectionName]?.current) {
                sectionsRefs[sectionName].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setActiveSection(sectionName);
                setTimeout(() => setActiveSection(null), 2000); 
            }
        }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const sendConfigUpdate = (newConfig: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) iframeRef.current.contentWindow.postMessage({ type: "UPDATE_CONFIG", payload: newConfig }, "*");
  };
  const sendDbUpdate = (newDbFields: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) iframeRef.current.contentWindow.postMessage({ type: "UPDATE_DB", payload: newDbFields }, "*");
  };
  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("negocios").update({ 
        config_web: { ...config, template: 'specialized' }, // Aseguramos specialized
        direccion: dbFields.direccion,
        horarios: dbFields.horarios,
        google_maps_link: dbFields.google_maps_link 
    }).eq("id", negocio.id);
    if (error) alert("Error: " + error.message);
    setSaving(false);
    if (onSave) onSave();
  };
  const updateConfigField = (section: string, field: string, value: any) => {
    setConfig((prev: any) => {
      let newConfig;
      if (section === 'root') newConfig = { ...prev, [field]: value };
      else newConfig = { ...prev, [section]: { ...prev[section], [field]: value } };
      sendConfigUpdate(newConfig);
      return newConfig;
    });
  };
  const updateArrayItem = (section: string, index: number, field: string, value: string) => {
    setConfig((prev: any) => {
        const currentItems = prev[section]?.items || [];
        const newItems = [...currentItems];
        if (!newItems[index]) newItems[index] = {}; 
        newItems[index] = { ...newItems[index], [field]: value };
        const newConfig = { ...prev, [section]: { ...prev[section], items: newItems } };
        sendConfigUpdate(newConfig);
        return newConfig;
    });
  };
  const updateDbField = (field: string, value: string) => {
      const newDb = { ...dbFields, [field]: value };
      setDbFields(newDb);
      sendDbUpdate(newDb);
  };
  
  const getSectionClass = (name: string) => `space-y-4 bg-white p-5 rounded-xl border transition-all duration-500 ${activeSection === name ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-500' : 'border-zinc-200 shadow-sm'}`;
  const previewUrl = `/${negocio.slug}?editor=true`;

  return (
    <div className="fixed inset-0 z-[100] flex bg-zinc-100 font-sans h-screen w-screen overflow-hidden">
      {/* PREVIEW */}
      <div className="flex-1 flex flex-col h-full relative border-r border-zinc-300">
        <div className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shadow-sm z-10">
            <div className="flex items-center gap-2 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-100 font-bold"><Briefcase size={14}/> Editando: Landing Especializada</div>
            <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                <button onClick={() => setViewMode("desktop")} className={`p-2 rounded-md ${viewMode === "desktop" ? "bg-white shadow text-purple-600" : "text-zinc-400"}`}><Monitor size={18} /></button>
                <button onClick={() => setViewMode("mobile")} className={`p-2 rounded-md ${viewMode === "mobile" ? "bg-white shadow text-purple-600" : "text-zinc-400"}`}><Smartphone size={18} /></button>
            </div>
        </div>
        <div className="flex-1 bg-zinc-200/50 flex items-center justify-center p-8 overflow-hidden relative">
            <div className={`transition-all duration-500 bg-white shadow-2xl border border-zinc-300 overflow-hidden ${viewMode === "mobile" ? "w-[375px] h-[667px] rounded-[2.5rem] border-[8px] border-zinc-800 shadow-xl" : "w-full h-full rounded-lg shadow-lg"}`}>
                <iframe ref={iframeRef} src={previewUrl} className="w-full h-full bg-white" style={{ border: 'none' }} title="Preview" onLoad={() => { sendConfigUpdate(config); sendDbUpdate(dbFields); }} />
            </div>
        </div>
      </div>

      {/* SIDEBAR ESPECIALIZADO */}
      <div className="w-[400px] bg-white shadow-2xl flex flex-col h-full z-20 border-l border-zinc-200">
        <div className="p-5 border-b border-zinc-200 flex justify-between items-center bg-white sticky top-0 z-10">
            <h2 className="font-bold text-lg text-purple-900 flex items-center gap-2"><Briefcase size={20} className="text-purple-600"/> Editor Pro</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-purple-50/30">
            
            {/* 1. INFORMACIÓN DE MODO */}
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-3">
                <UserCheck size={24} className="text-purple-600"/>
                <div>
                    <p className="font-bold text-xs text-purple-900 uppercase">Modo Citas</p>
                    <p className="text-[10px] text-zinc-500">Diseño para profesionales y consultores.</p>
                </div>
            </div>

            {/* 2. CONTACTO */}
            <div ref={sectionsRefs.contact} className={getSectionClass('contact')}>
                <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100"><MapPin size={16} className="text-blue-500" /> Contacto</h3>
                <input type="text" value={dbFields.direccion} onChange={(e) => updateDbField('direccion', e.target.value)} placeholder="Dirección de Oficina" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white mb-2" />
                <input type="text" value={dbFields.google_maps_link} onChange={(e) => updateDbField('google_maps_link', e.target.value)} placeholder="Link Maps" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white mb-2" />
                <input type="text" value={dbFields.horarios} onChange={(e) => updateDbField('horarios', e.target.value)} placeholder="Horarios de Atención" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white" />
            </div>

            {/* 3. LÓGICA DE CITAS (DIFERENTE A GENERAL) */}
            <div ref={sectionsRefs.booking} className={getSectionClass('booking')}>
                <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100"><Calendar size={16} className="text-purple-500" /> Configuración de Cita</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Título Sección Citas</label>
                        <input type="text" value={config.booking?.citaTitle || ""} onChange={(e) => updateConfigField('booking', 'citaTitle', e.target.value)} className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Descripción Corta</label>
                        <textarea rows={2} value={config.booking?.citaDesc || ""} onChange={(e) => updateConfigField('booking', 'citaDesc', e.target.value)} className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Texto Botón</label>
                        <input type="text" value={config.booking?.citaBtnText || ""} onChange={(e) => updateConfigField('booking', 'citaBtnText', e.target.value)} className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                    </div>
                </div>
            </div>

            {/* 4. HERO & ESPECIALIDADES (DIFERENTE NOMBRE) */}
            <div ref={sectionsRefs.hero} className={getSectionClass('hero')}>
                <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
                    <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Portada Profesional</h3>
                    <button onClick={() => updateConfigField('hero', 'mostrar', !config.hero?.mostrar)} className="text-zinc-400 hover:text-purple-600"><Eye size={16}/></button>
                </div>
                {config.hero?.mostrar && (
                    <div className="space-y-4">
                        <input type="text" value={config.hero.titulo} onChange={(e) => updateConfigField('hero', 'titulo', e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Tu Nombre o Profesión"/>
                        <textarea rows={3} value={config.hero.subtitulo} onChange={(e) => updateConfigField('hero', 'subtitulo', e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Eslogan personal"/>
                        <ImageUpload label="Foto de Perfil / Fondo" value={config.hero.imagenUrl} onChange={(url) => updateConfigField('hero', 'imagenUrl', url)} />
                    </div>
                )}
            </div>

            <div ref={sectionsRefs.beneficios} className={getSectionClass('beneficios')}>
                 <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Especialidades</h3>
                 {config.beneficios.items?.map((item: any, i: number) => (
                    <div key={i} className="p-2 border rounded bg-zinc-50 mb-2">
                        <input value={item.titulo} onChange={(e) => updateArrayItem('beneficios', i, 'titulo', e.target.value)} className="w-full p-1 mb-1 border rounded text-xs"/>
                        <input value={item.desc} onChange={(e) => updateArrayItem('beneficios', i, 'desc', e.target.value)} className="w-full p-1 border rounded text-xs text-zinc-500"/>
                    </div>
                 ))}
            </div>

            {/* 5. APARIENCIA E IDENTIDAD */}
            <div ref={sectionsRefs.appearance} className={getSectionClass('appearance')}>
                <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100"><Palette size={16} className="text-purple-500" /> Apariencia</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Fuente</label>
                        <select value={config.appearance?.font || 'sans'} onChange={(e) => updateConfigField('appearance', 'font', e.target.value)} className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white">
                            <option value="sans">Moderna</option>
                            <option value="serif">Elegante</option>
                        </select>
                    </div>
                </div>
            </div>
            <div ref={sectionsRefs.identity} className={getSectionClass('identity')}>
                 <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Marca Personal / Logo</h3>
                 <ImageUpload label="Logo" value={config.logoUrl} onChange={(url) => updateConfigField('root', 'logoUrl', url)} />
            </div>

        </div>

        <div className="p-5 border-t bg-white flex gap-3">
            <button onClick={onClose} className="px-6 py-3 text-zinc-500 font-bold hover:bg-zinc-100 rounded-xl text-sm">Cerrar</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex justify-center gap-2">
                {saving ? <Loader2 className="animate-spin"/> : <><Save size={18}/> Guardar Cambios</>}
            </button>
        </div>
      </div>
    </div>
  );
}