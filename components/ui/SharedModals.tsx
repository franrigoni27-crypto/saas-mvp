"use client";
import { X, Calendar as CalendarIcon, Loader2, User, Phone, Mail, CheckCircle, MessageCircle, Star } from "lucide-react";

export default function SharedModals({ logic }: any) {
  const { ui, forms, actions, negocio } = logic;
  const { modals, setModals, bookingStep, loadingSlots, enviando, mostrarGracias, eventLink, ratingSeleccionado } = ui;
  const { bookingData, nombreCliente, feedbackComentario } = forms;

  // --- LÓGICA DE TEXTOS DINÁMICOS ---
  // Leemos la configuración o usamos un objeto vacío para evitar errores
  const config = negocio?.config_web || {};
  const template = config.template || 'general';

  // Definimos valores por defecto inteligentes según la plantilla activa
  // (Así el cliente no ve todo vacío la primera vez)
  const defaults = template === 'specialized' ? {
      modalTitle: "Agendar Reunión",
      step1Title: "Tipo de Consulta",
      option1Title: "Primera Consulta",
      option1Desc: "Evaluación inicial del proyecto",
      option2Title: "Proyecto Completo",
      option2Desc: "Planificación detallada"
  } : {
      modalTitle: "Reservar Turno",
      step1Title: "Selecciona el Servicio",
      option1Title: "Servicio Estándar",
      option1Desc: "Duración estimada: 1 hora",
      option2Title: "Servicio Premium",
      option2Desc: "Servicio completo y detallado"
  };

  // Fusionamos: Lo que escribió el usuario (config.booking) mata al default
  const texts = { ...defaults, ...config.booking };

  const ModalWrapper = ({ children, onClose }: any) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 rounded-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-zinc-600 rounded-full transition-all"><X size={20} /></button>
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. MODAL DE AGENDAMIENTO */}
      {modals.booking && (
        <ModalWrapper onClose={() => setModals((p:any) => ({...p, booking: false}))}>
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                    <CalendarIcon className="text-blue-600"/> {texts.modalTitle}
                </h3>
                <p className="text-zinc-500 text-sm">Paso {bookingStep} de 3</p>
                <div className="h-1 bg-zinc-100 rounded-full mt-2 w-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(bookingStep / 3) * 100}%` }}></div>
                </div>
            </div>

            {/* PASO 1: SELECCIÓN DE SERVICIO (AHORA ES DINÁMICO) */}
            {bookingStep === 1 && (
                <div className="space-y-3 animate-in fade-in">
                    <p className="font-bold text-zinc-700 mb-2">{texts.step1Title}:</p>
                    
                    {/* Botón Opción 1 */}
                    <button onClick={() => { forms.setBookingData({...bookingData, service: texts.option1Title}); ui.setBookingStep(2); }} className="w-full p-4 border border-zinc-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-left transition-all group">
                        <span className="font-bold block text-zinc-900 group-hover:text-blue-700">{texts.option1Title}</span>
                        <span className="text-xs text-zinc-500">{texts.option1Desc}</span>
                    </button>
                    
                    {/* Botón Opción 2 */}
                    <button onClick={() => { forms.setBookingData({...bookingData, service: texts.option2Title}); ui.setBookingStep(2); }} className="w-full p-4 border border-zinc-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-left transition-all group">
                        <span className="font-bold block text-zinc-900 group-hover:text-blue-700">{texts.option2Title}</span>
                        <span className="text-xs text-zinc-500">{texts.option2Desc}</span>
                    </button>
                </div>
            )}

            {/* PASO 2: FECHA (Sin cambios, funciona igual) */}
            {bookingStep === 2 && (
                <div className="space-y-4 animate-in fade-in">
                    <button onClick={() => ui.setBookingStep(1)} className="text-xs text-zinc-400 hover:text-zinc-600 mb-2">← Volver</button>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Elige el día</label>
                        <input type="date" min={new Date().toISOString().split('T')[0]} className="w-full p-3 border border-zinc-200 rounded-xl outline-none focus:border-blue-500"
                            onChange={(e) => actions.handleDateChange(e.target.value)}
                        />
                    </div>
                    {bookingData.date && (
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Horarios Disponibles</label>
                            {loadingSlots ? (
                                <div className="text-center py-4 text-zinc-400"><Loader2 className="animate-spin mx-auto"/> Buscando huecos...</div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                    {actions.generateTimeSlots().map((slot: any) => (
                                        <button key={slot.time} disabled={!slot.available}
                                            onClick={() => { forms.setBookingData({...bookingData, time: slot.time}); ui.setBookingStep(3); }}
                                            className={`py-2 text-sm rounded-lg border font-medium transition-all ${slot.available ? 'border-zinc-200 hover:border-blue-500 hover:bg-blue-50 text-zinc-700' : 'bg-zinc-100 text-zinc-300 cursor-not-allowed border-transparent'}`}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                    {actions.generateTimeSlots().length === 0 && <p className="col-span-3 text-center text-xs text-zinc-400 py-2">No hay horarios disponibles.</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* PASO 3: DATOS (Sin cambios) */}
            {bookingStep === 3 && (
                <form onSubmit={actions.handleConfirmBooking} className="space-y-4 animate-in fade-in">
                    <button type="button" onClick={() => ui.setBookingStep(2)} className="text-xs text-zinc-400 hover:text-zinc-600 mb-2">← Volver</button>
                    <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3 text-sm text-blue-800 border border-blue-100">
                        <CalendarIcon size={16}/> <span>{new Date(bookingData.date).toLocaleDateString()} a las <strong>{bookingData.time}hs</strong></span>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Nombre Completo</label>
                        <div className="relative"><User size={16} className="absolute left-3 top-3.5 text-zinc-400"/><input required type="text" placeholder="Juan Pérez" className="w-full pl-10 p-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => forms.setBookingData({...bookingData, clientName: e.target.value})}/></div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Teléfono</label>
                        <div className="relative"><Phone size={16} className="absolute left-3 top-3.5 text-zinc-400"/><input required type="tel" placeholder="+54 9..." className="w-full pl-10 p-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => forms.setBookingData({...bookingData, clientPhone: e.target.value})}/></div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Email</label>
                        <div className="relative"><Mail size={16} className="absolute left-3 top-3.5 text-zinc-400"/><input required type="email" placeholder="juan@mail.com" className="w-full pl-10 p-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => forms.setBookingData({...bookingData, clientEmail: e.target.value})}/></div>
                    </div>
                    <button type="submit" disabled={enviando} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2">
                        {enviando ? <Loader2 className="animate-spin"/> : "Confirmar Cita"}
                    </button>
                </form>
            )}
        </ModalWrapper>
      )}

      {/* MODAL DE ÉXITO */}
      {mostrarGracias && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md animate-in fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm animate-in zoom-in-95">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} /></div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">¡Confirmado!</h3>
                <p className="text-zinc-500 mb-6">Tu reserva se ha registrado correctamente.</p>
                {eventLink && (
                    <a href={eventLink} target="_blank" rel="noopener noreferrer" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mb-3 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">Ver en Google Calendar <CalendarIcon size={18}/></a>
                )}
                <button onClick={() => ui.setMostrarGracias(false)} className="mt-2 text-sm font-bold text-zinc-400 hover:text-zinc-600">Cerrar</button>
            </div>
        </div>
      )}

      {/* MODAL FEEDBACK Y LEAD (Igual que antes) */}
      {modals.feedback && (
        <ModalWrapper onClose={() => setModals((p:any) => ({...p, feedback: false}))}>
            <div className="text-center">
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Tu opinión nos importa</h3>
                <form onSubmit={actions.handleEnviarFeedback} className="space-y-4 mt-4">
                    <input type="text" placeholder="Tu Nombre" value={nombreCliente} onChange={e => forms.setNombreCliente(e.target.value)} className="w-full p-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 text-sm text-center"/>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => ui.setRatingSeleccionado(star)} className="transition-transform hover:scale-110 focus:outline-none">
                                <Star size={32} className={star <= ratingSeleccionado ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"} />
                            </button>
                        ))}
                    </div>
                    <textarea rows={3} placeholder="Comentario..." value={feedbackComentario} onChange={e => forms.setFeedbackComentario(e.target.value)} className="w-full p-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 text-sm resize-none"/>
                    <button type="submit" disabled={enviando} className="w-full bg-zinc-900 text-white font-bold py-3 rounded-xl hover:bg-zinc-800 transition-all flex justify-center gap-2">{enviando ? <Loader2 className="animate-spin"/> : "Enviar Reseña"}</button>
                </form>
            </div>
        </ModalWrapper>
      )}

      {modals.lead && (
        <ModalWrapper onClose={() => setModals((p:any) => ({...p, lead: false}))}>
            <h3 className="text-2xl font-bold mb-2">Consulta Rápida</h3>
            <p className="text-zinc-500 text-sm mb-6">Te contactaremos por WhatsApp.</p>
            <form onSubmit={actions.handleConsultarLead} className="space-y-4 mt-4">
                <input required type="text" placeholder="Tu Nombre" value={nombreCliente} onChange={e => forms.setNombreCliente(e.target.value)} className="w-full p-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"/>
                <button type="submit" disabled={enviando} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">{enviando ? <Loader2 className="animate-spin"/> : <><MessageCircle size={18}/> Enviar WhatsApp</>}</button>
            </form>
        </ModalWrapper>
      )}
    </>
  );
}