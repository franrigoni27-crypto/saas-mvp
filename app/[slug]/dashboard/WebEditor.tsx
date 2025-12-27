"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase";
// Agregamos Calendar al import de iconos
import { Save, X, LayoutTemplate, Eye, Loader2, Monitor, Smartphone, ExternalLink, Palette, MousePointerClick, Layout, Layers, MapPin, Grid, Briefcase, Calendar } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";

const DEFAULT_CONFIG = {
  template: "general",
  // AGREGAMOS BOOKING AL DEFAULT CONFIG
  booking: {
    modalTitle: "Reservar Turno",
    step1Title: "Selecciona el Servicio",
    option1Title: "Servicio Estándar",
    option1Desc: "Duración: 1 hora",
    option2Title: "Servicio Premium",
    option2Desc: "Completo"
  },
  appearance: { font: 'sans', radius: 'medium' },
  colors: { primary: "#000000" },
  hero: { 
    titulo: "Tu Título Principal", 
    subtitulo: "Escribe aquí una descripción atractiva.", 
    ctaTexto: "Contactar", 
    mostrar: true,
    layout: "split", 
    parallax: false,
    overlayOpacity: 50
  },
  beneficios: { 
    mostrar: true, 
    titulo: "Nuestros Servicios", 
    items: [
      { titulo: "Servicio 1", desc: "Descripción breve." },
      { titulo: "Servicio 2", desc: "Descripción breve." },
      { titulo: "Servicio 3", desc: "Descripción breve." }
    ]
  },
  testimonios: { mostrar: false, titulo: "Opiniones", items: [] },
  footer: { mostrar: true, textoCopyright: "Derechos reservados" }
};

export default function WebEditor({ negocio, onClose, onSave }: any) {
  const supabase = createClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // REFERENCIAS
  const sectionsRefs: any = {
    design: useRef<HTMLDivElement>(null),
    booking: useRef<HTMLDivElement>(null), // <--- NUEVA REFERENCIA
    contact: useRef<HTMLDivElement>(null),
    appearance: useRef<HTMLDivElement>(null),
    identity: useRef<HTMLDivElement>(null),
    hero: useRef<HTMLDivElement>(null),
    beneficios: useRef<HTMLDivElement>(null),
    footer: useRef<HTMLDivElement>(null),
  };

  const [config, setConfig] = useState({ ...DEFAULT_CONFIG, ...(negocio.config_web || {}) });
  const templateMode = negocio.config_web?.template || 'general';
  const [dbFields, setDbFields] = useState({
    direccion: negocio.direccion || "",
    horarios: negocio.horarios || "",
    google_maps_link: negocio.google_maps_link || "" 
  });
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "FOCUS_SECTION") {
            const sectionName = event.data.section;
            const targetRef = sectionsRefs[sectionName];
            if (targetRef && targetRef.current) {
                targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setActiveSection(sectionName);
                setTimeout(() => setActiveSection(null), 2000); 
            }
        }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const sendConfigUpdate = (newConfig: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "UPDATE_CONFIG", payload: newConfig }, "*");
    }
  };
  const sendDbUpdate = (newDbFields: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "UPDATE_DB", payload: newDbFields }, "*");
    }
  };
  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("negocios").update({ 
        config_web: config,
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

  const previewUrl = `/${negocio.slug}?editor=true`; 
  const getSectionClass = (name: string) => `space-y-4 bg-white p-5 rounded-xl border transition-all duration-500 ${activeSection === name ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-1 ring-indigo-500' : 'border-zinc-200 shadow-sm'}`;

  return (
    <div className="fixed inset-0 z-[100] flex bg-zinc-100 font-sans h-screen w-screen overflow-hidden">
      
      {/* PREVIEW */}
      <div className="flex-1 flex flex-col h-full relative border-r border-zinc-300">
        <div className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shadow-sm z-10">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100 font-bold">
                    <MousePointerClick size={14}/> Click-to-Edit Activo
                </div>
            </div>
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
            <h2 className="font-bold text-lg text-zinc-900 flex items-center gap-2"><LayoutTemplate size={20} className="text-indigo-600"/> Editor</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-zinc-50/30">
            
            {/* 0. MODO DE DISEÑO */}
            <div ref={sectionsRefs.design} className={getSectionClass('design')}>
                <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100">
                    <LayoutTemplate size={16} className="text-indigo-500" /> Estructura
                </h3>
                
                {/* CARTEL INFORMATIVO */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${templateMode === 'general' ? 'bg-indigo-50 border-indigo-200' : 'bg-purple-50 border-purple-200'}`}>
                    {templateMode === 'general' ? <Grid className="text-indigo-600 mt-1" size={20}/> : <Briefcase className="text-purple-600 mt-1" size={20}/>}
                    <div>
                        <p className={`font-bold text-xs uppercase mb-1 ${templateMode === 'general' ? 'text-indigo-700' : 'text-purple-700'}`}>
                            {templateMode === 'general' ? 'Modo Turnos (General)' : 'Modo Citas (Especializado)'}
                        </p>
                        <p className="text-[11px] text-zinc-600 leading-relaxed">
                            {templateMode === 'general' 
                                ? "Configuración optimizada para servicios rápidos y selección de horarios estándar."
                                : "Configuración para profesionales que requieren agendar citas específicas."}
                        </p>
                    </div>
                </div>
            </div>

            {/* 1. CONTACTO */}
            <div ref={sectionsRefs.contact} className={getSectionClass('contact')}>
                <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100">
                    <MapPin size={16} className="text-blue-500" /> Información de Contacto
                </h3>
                <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Dirección</label>
                    <input type="text" value={dbFields.direccion} onChange={(e) => updateDbField('direccion', e.target.value)} className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Link Google Maps</label>
                    <div className="relative">
                        <input type="text" value={dbFields.google_maps_link} onChange={(e) => updateDbField('google_maps_link', e.target.value)} className="w-full p-2 pl-8 border border-zinc-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        <ExternalLink size={14} className="absolute left-2.5 top-2.5 text-zinc-400"/>
                    </div>
                </div>
                <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Horarios</label>
                    <input type="text" value={dbFields.horarios} onChange={(e) => updateDbField('horarios', e.target.value)} className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>

            {/* 2. RESERVAS / BOOKING */}
            <div ref={sectionsRefs.booking} className={getSectionClass('booking')}>
                <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100">
                    <Calendar size={16} className={templateMode === 'general' ? "text-green-500" : "text-purple-500"} /> 
                    {templateMode === 'general' ? "Configuración de Turnos" : "Configuración de Citas"}
                </h3>

                {templateMode === 'general' ? (
                    /* ================================================= */
                    /* LÓGICA 1: TURNOS GENERALES (Tu código original)   */
                    /* ================================================= */
                    <div className="space-y-4 animate-in fade-in">
                        <div>
                            <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Título del Modal</label>
                            <input type="text" value={config.booking?.modalTitle || ""} onChange={(e) => updateConfigField('booking', 'modalTitle', e.target.value)} placeholder="Agendar Turno" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Título Paso 1</label>
                            <input type="text" value={config.booking?.step1Title || ""} onChange={(e) => updateConfigField('booking', 'step1Title', e.target.value)} placeholder="Selecciona Servicio" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                        </div>
                        
                        {/* Opciones de Botones (Estándar/Premium) */}
                        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-3">
                            <p className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2"><MousePointerClick size={12}/> Opción A (Izquierda)</p>
                            <input type="text" value={config.booking?.option1Title || ""} onChange={(e) => updateConfigField('booking', 'option1Title', e.target.value)} placeholder="Ej: Servicio Estándar" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                            <input type="text" value={config.booking?.option1Desc || ""} onChange={(e) => updateConfigField('booking', 'option1Desc', e.target.value)} placeholder="Ej: 30 minutos" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                        </div>
                        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-3">
                            <p className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2"><MousePointerClick size={12}/> Opción B (Derecha)</p>
                            <input type="text" value={config.booking?.option2Title || ""} onChange={(e) => updateConfigField('booking', 'option2Title', e.target.value)} placeholder="Ej: Servicio Premium" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                            <input type="text" value={config.booking?.option2Desc || ""} onChange={(e) => updateConfigField('booking', 'option2Desc', e.target.value)} placeholder="Ej: Completo" className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"/>
                        </div>
                    </div>
                ) : (
                    /* ================================================= */
                    /* LÓGICA 2: CITAS ESPECIALIZADAS (Nueva lógica)     */
                    /* ================================================= */
                    <div className="space-y-4 animate-in fade-in">
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-center mb-4">
                            <p className="text-xs text-purple-800 font-medium">
                                El sistema de citas mostrará automáticamente tu calendario de disponibilidad.
                            </p>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Título Principal</label>
                            <input 
                                type="text" 
                                value={config.booking?.citaTitle || "Reserva tu Cita"} 
                                onChange={(e) => updateConfigField('booking', 'citaTitle', e.target.value)} 
                                className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Texto del Botón</label>
                            <input 
                                type="text" 
                                value={config.booking?.citaBtnText || "Ver Disponibilidad"} 
                                onChange={(e) => updateConfigField('booking', 'citaBtnText', e.target.value)} 
                                className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white"
                            />
                        </div>

                        {/* Aquí podrías agregar campos extra si la cita requiere "Motivo", "Elegir Profesional", etc. */}
                        <div className="pt-2 border-t border-dashed border-zinc-200">
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={config.booking?.requirePhone !== false} 
                                    onChange={(e) => updateConfigField('booking', 'requirePhone', e.target.checked)}
                                    className="rounded text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-xs text-zinc-600 font-medium">Solicitar Teléfono obligatoriamente</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. APARIENCIA */}
            <div ref={sectionsRefs.appearance} className={getSectionClass('appearance')}>
                <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100"><Palette size={16} className="text-purple-500" /> Apariencia</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Tipografía</label>
                        <select value={config.appearance?.font || 'sans'} onChange={(e) => updateConfigField('appearance', 'font', e.target.value)} className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white">
                            <option value="sans">Moderna</option>
                            <option value="serif">Elegante</option>
                            <option value="mono">Técnica</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase mb-1 block">Bordes</label>
                        <div className="flex gap-1">
                            {['none', 'medium', 'full'].map((mode) => (
                                <button key={mode} onClick={() => updateConfigField('appearance', 'radius', mode)} className={`flex-1 py-2 text-xs border rounded-lg ${config.appearance?.radius === mode ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold' : 'bg-white'}`}>{mode === 'none' ? 'Cuad' : mode === 'medium' ? 'Red' : 'Circ'}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. IDENTIDAD */}
            <div ref={sectionsRefs.identity} className={getSectionClass('identity')}>
                <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-zinc-100"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Identidad</h3>
                <ImageUpload label="Logo" value={config.logoUrl} onChange={(url) => updateConfigField('root', 'logoUrl', url)} />
            </div>

            {/* 5. HERO */}
            <div ref={sectionsRefs.hero} className={getSectionClass('hero')}>
                <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
                    <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Portada</h3>
                    <button onClick={() => updateConfigField('hero', 'mostrar', !config.hero?.mostrar)} className="text-zinc-400 hover:text-indigo-600"><Eye size={16}/></button>
                </div>
                {config.hero?.mostrar && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <input type="text" value={config.hero.titulo} onChange={(e) => updateConfigField('hero', 'titulo', e.target.value)} className="w-full p-2 border rounded text-sm"/>
                        <textarea rows={3} value={config.hero.subtitulo} onChange={(e) => updateConfigField('hero', 'subtitulo', e.target.value)} className="w-full p-2 border rounded text-sm"/>
                        <ImageUpload label="Imagen de Fondo" value={config.hero.imagenUrl} onChange={(url) => updateConfigField('hero', 'imagenUrl', url)} />
                    </div>
                )}
            </div>

            {/* 6. BENEFICIOS */}
            <div ref={sectionsRefs.beneficios} className={getSectionClass('beneficios')}>
                <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
                    <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wide flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {config.template === 'specialized' ? 'Expertise' : 'Servicios'}</h3>
                    <button onClick={() => updateConfigField('beneficios', 'mostrar', !config.beneficios?.mostrar)} className="text-zinc-400 hover:text-emerald-600"><Eye size={16}/></button>
                </div>
                {config.beneficios?.mostrar && (
                    <div className="space-y-4">
                        <input type="text" value={config.beneficios.titulo} onChange={(e) => updateConfigField('beneficios', 'titulo', e.target.value)} className="w-full p-2 border rounded text-sm font-bold"/>
                        {config.beneficios.items?.map((item: any, i: number) => (
                            <div key={i} className="p-2 border rounded bg-zinc-50">
                                <input value={item.titulo} onChange={(e) => updateArrayItem('beneficios', i, 'titulo', e.target.value)} className="w-full p-1 mb-1 border rounded text-xs"/>
                                <input value={item.desc} onChange={(e) => updateArrayItem('beneficios', i, 'desc', e.target.value)} className="w-full p-1 border rounded text-xs text-zinc-500"/>
                            </div>
                        ))}
                    </div>
                )}
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