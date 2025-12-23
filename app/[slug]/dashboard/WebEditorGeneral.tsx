"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Save, X, LayoutTemplate, Eye, Loader2, Monitor, Smartphone, ExternalLink, Palette, MousePointerClick, MapPin, Grid, Calendar } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";

// CONFIGURACIÓN DEFAULT PARA GENERAL (TURNOS)
const DEFAULT_CONFIG_GENERAL = {
  template: "general",
  booking: {
    modalTitle: "Reservar Turno",
    step1Title: "Selecciona el Servicio",
    option1Title: "Corte Estándar",
    option1Desc: "30 min",
    option2Title: "Corte Premium",
    option2Desc: "1 hora"
  },
  appearance: { font: 'sans', radius: 'medium' },
  colors: { primary: "#000000" },
  hero: { 
    titulo: "Tu Título Principal", 
    subtitulo: "Descripción breve del negocio.", 
    ctaTexto: "Reservar Turno", 
    mostrar: true,
    layout: "split"
  },
  beneficios: { 
    mostrar: true, 
    titulo: "Nuestros Servicios", 
    items: [{ titulo: "Servicio 1", desc: "Detalle..." }, { titulo: "Servicio 2", desc: "Detalle..." }]
  },
  footer: { mostrar: true, textoCopyright: "Derechos reservados" }
};

export default function WebEditorGeneral({ negocio, onClose, onSave }: any) {
  const supabase = createClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // REFERENCIAS
  const sectionsRefs: any = {
    design: useRef<HTMLDivElement>(null),
    booking: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
    appearance: useRef<HTMLDivElement>(null),
    identity: useRef<HTMLDivElement>(null),
    hero: useRef<HTMLDivElement>(null),
    beneficios: useRef<HTMLDivElement>(null),
  };

  const [config, setConfig] = useState({ ...DEFAULT_CONFIG_GENERAL, ...(negocio.config_web || {}) });
  const [dbFields, setDbFields] = useState({
    direccion: negocio.direccion || "",
    horarios: negocio.horarios || "",
    google_maps_link: negocio.google_maps_link || "" 
  });
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // --- LÓGICA DE MENSAJES Y GUARDADO (Idéntica a la original) ---
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
        config_web: { ...config, template: 'general' }, // Aseguramos que sea general
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
  const getSectionClass = (name: string) => `space-y-4 bg-white p-5 rounded-xl border transition-all duration-500 ${activeSection === name ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-1 ring-indigo-500' : 'border-zinc-200 shadow-sm'}`;
  const previewUrl = `/${negocio.slug}?editor=true`;

  return (
    <div className="fixed inset-0 z-[100] flex bg-zinc-100 font-sans h-screen w-screen overflow-hidden">
      {/* PREVIEW */}
      <div className="flex-1 flex flex-col h-full relative border-r border-zinc-300">
        <div className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shadow-sm z-10">
            <div className="flex items-center gap-2 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100 font-bold"><MousePointerClick size={14}/> Editando: Landing General</div>
            <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                <button onClick={() => setViewMode("desktop")} className={`p-2 rounded-md ${viewMode === "desktop" ? "bg-white shadow text-indigo-600" : "text-zinc-400"}`}><Monitor size={18} /></button>
                <button onClick={() => setViewMode("mobile")} className={`p-2 rounded-md ${viewMode === "mobile" ? "bg-white shadow text-indigo-600" : "text-zinc-400"}`}><Smartphone size={18} /></button>
            </div>
        </div>
        <div className="flex-1 bg-zinc-200/50 flex items-center justify-center p-8 overflow-hidden relative">
            <div className={`transition-all duration-500 bg-white shadow-2xl border border-zinc-300 overflow-hidden ${viewMode === "mobile" ? "w-[375px] h-[667px] rounded-[2.5rem] border-[8px] border-zinc-800 shadow-xl" : "w-full h-full rounded-lg shadow-lg"}`}>
                <iframe ref={iframeRef} src={previewUrl} className="w-full h-full bg-white" style={{ border: 'none' }} title="Preview" onLoad={() => { sendConfigUpdate(config); sendDbUpdate(dbFields); }} />
            </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className="w-[400px] bg-white shadow-2xl flex flex-col h-full z-20 border-l border-zinc-200">
        <div className="p-5 border-b border-zinc-200 flex justify-between items-center bg-white sticky top-0 z-10">
            <h2 className="font-bold text-lg text-zinc-900 flex items-center gap-2"><LayoutTemplate size={20} className="text-indigo-600"/> Editor General</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-zinc-50/30">
            
            {/* 1. INFORMACIÓN BÁSICA (Diseño General) */}
            <div ref={sectionsRefs.design} className={getSectionClass('design')}>
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <Grid size={24} className="text-indigo-600"/>
                    <div>
                        <p className="font-bold text-xs text-indigo-900 uppercase">Modo Turnos</p>
                        <p className="text-[10px] text-zinc-500">Optimizada para servicios diarios (Peluquerías, etc).</p>
                    </div>
                </div>
            </div>

            {/* 2. CONTACTO */}
            <div ref={sectionsRefs.contact} className={getSectionClass('contact')}>
                <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100"><MapPin size={16} className="text-blue-500" /> Contacto</h3>
                <input type="text" value={dbFields.direccion} onChange={(e) => updateDbField('direccion', e.target.value)} placeholder="Dirección" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white mb-2" />
                <input type="text" value={dbFields.google_maps_link} onChange={(e) => updateDbField('google_maps_link', e.target.value)} placeholder="Link Maps" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white mb-2" />
                <input type="text" value={dbFields.horarios} onChange={(e) => updateDbField('horarios', e.target.value)} placeholder="Horarios" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white" />
            </div>

            {/* 3. RESERVAS (LÓGICA GENERAL) */}
            <div ref={sectionsRefs.booking} className={getSectionClass('booking')}>
                <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100"><Calendar size={16} className="text-green-500" /> Configuración de Turnos</h3>
                <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Título Modal</label>
                    <input type="text" value={config.booking?.modalTitle || ""} onChange={(e) => updateConfigField('booking', 'modalTitle', e.target.value)} className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                </div>
                {/* Opciones A/B para turnos */}
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase">Opción 1</p>
                    <input type="text" value={config.booking?.option1Title || ""} onChange={(e) => updateConfigField('booking', 'option1Title', e.target.value)} placeholder="Título" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                    <input type="text" value={config.booking?.option1Desc || ""} onChange={(e) => updateConfigField('booking', 'option1Desc', e.target.value)} placeholder="Descripción" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                </div>
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase">Opción 2</p>
                    <input type="text" value={config.booking?.option2Title || ""} onChange={(e) => updateConfigField('booking', 'option2Title', e.target.value)} placeholder="Título" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                    <input type="text" value={config.booking?.option2Desc || ""} onChange={(e) => updateConfigField('booking', 'option2Desc', e.target.value)} placeholder="Descripción" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                </div>
            </div>

            {/* 4. HERO & BENEFICIOS (LÓGICA GENERAL) */}
            <div ref={sectionsRefs.hero} className={getSectionClass('hero')}>
                <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
                    <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Portada</h3>
                    <button onClick={() => updateConfigField('hero', 'mostrar', !config.hero?.mostrar)} className="text-zinc-400 hover:text-indigo-600"><Eye size={16}/></button>
                </div>
                {config.hero?.mostrar && (
                    <div className="space-y-4">
                        <input type="text" value={config.hero.titulo} onChange={(e) => updateConfigField('hero', 'titulo', e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Título"/>
                        <textarea rows={3} value={config.hero.subtitulo} onChange={(e) => updateConfigField('hero', 'subtitulo', e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Subtítulo"/>
                        <ImageUpload label="Imagen Fondo" value={config.hero.imagenUrl} onChange={(url) => updateConfigField('hero', 'imagenUrl', url)} />
                    </div>
                )}
            </div>

            <div ref={sectionsRefs.beneficios} className={getSectionClass('beneficios')}>
                 <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Servicios</h3>
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
                 <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Logo</h3>
                 <ImageUpload label="Logo" value={config.logoUrl} onChange={(url) => updateConfigField('root', 'logoUrl', url)} />
            </div>

        </div>

        <div className="p-5 border-t bg-white flex gap-3">
            <button onClick={onClose} className="px-6 py-3 text-zinc-500 font-bold hover:bg-zinc-100 rounded-xl text-sm">Cerrar</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl flex justify-center gap-2">
                {saving ? <Loader2 className="animate-spin"/> : <><Save size={18}/> Guardar</>}
            </button>
        </div>
      </div>
    </div>
  );
}