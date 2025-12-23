"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { getAvailability, createAppointment } from "@/app/actions/google-calendar"; // Asegúrate que la ruta a 'actions' sea correcta según tu proyecto

export const useBusinessLogic = (initialData: any) => {
  const supabase = createClient();
  
  // --- ESTADOS DE DATOS ---
  const [negocio, setNegocio] = useState<any>(initialData);
  const [eventLink, setEventLink] = useState(""); 

  // --- MODALES ---
  const [modals, setModals] = useState({
    lead: false,     // Presupuesto
    booking: false,  // Turnos
    feedback: false  // Reseñas
  });

  // --- ESTADOS DE AGENDAMIENTO ---
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    service: "",
    date: "",
    time: "",
    clientName: "",
    clientPhone: "",
    clientEmail: ""
  });
  const [busySlots, setBusySlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mostrarGracias, setMostrarGracias] = useState(false);

  // --- ESTADOS DE FEEDBACK Y LEAD ---
  const [nombreCliente, setNombreCliente] = useState("");
  const [feedbackComentario, setFeedbackComentario] = useState("");
  const [ratingSeleccionado, setRatingSeleccionado] = useState(0);

  // --- SINCRONIZACIÓN CON DASHBOARD (IFRAME) ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_CONFIG" && event.data?.payload) {
        setNegocio((prev: any) => ({ ...prev, config_web: event.data.payload }));
      }
      if (event.data?.type === "UPDATE_DB" && event.data?.payload) {
        setNegocio((prev: any) => ({ ...prev, ...event.data.payload }));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // --- LÓGICA DE HORARIOS ---
  const getBusinessHours = () => {
    if (!negocio.horarios) return { start: 9, end: 18 }; 
    try {
        const times = negocio.horarios.match(/(\d{2}):(\d{2})/g);
        if (times && times.length >= 2) {
            const startHour = parseInt(times[0].split(':')[0]);
            const endHour = parseInt(times[1].split(':')[0]);
            return { start: startHour, end: endHour };
        }
    } catch(e) {}
    return { start: 9, end: 18 }; 
  };

  const handleDateChange = async (date: string) => {
    setBookingData(prev => ({ ...prev, date, time: "" }));
    setLoadingSlots(true);
    
    try {
        const res = await getAvailability(negocio.slug, date);
        if (res.success) {
            setBusySlots((res as any).busySlots);
        } else {
            console.error("Error servidor:", res.error);
        }
    } catch (error) {
        console.error("Error conexión:", error);
    } finally {
        setLoadingSlots(false);
    }
  };

  const generateTimeSlots = () => {
    if (!bookingData.date) return [];
    const { start, end } = getBusinessHours();
    const slots = [];
    for (let hour = start; hour < end; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        const slotDate = new Date(`${bookingData.date}T${timeString}:00`);
        
        const isBusy = busySlots.some((busy: any) => {
            const busyStart = new Date(busy.start);
            const busyEnd = new Date(busy.end);
            return slotDate >= busyStart && slotDate < busyEnd;
        });

        slots.push({ time: timeString, available: !isBusy });
    }
    return slots;
  };

  // --- ACCIONES (HANDLERS) ---
  
  const handleConfirmBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEnviando(true);
    
    const res = await createAppointment(negocio.slug, bookingData);
    
    setEnviando(false);
    if (res.success) {
        setModals(prev => ({ ...prev, booking: false }));
        if ((res as any).eventLink) setEventLink((res as any).eventLink); 
        
        setMostrarGracias(true);
        setBookingStep(1);
        setBookingData({ service: "", date: "", time: "", clientName: "", clientPhone: "", clientEmail: "" });
    } else {
        alert("Error al agendar: " + res.error);
    }
  };

  const handleEnviarFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingSeleccionado === 0) return alert("Selecciona una puntuación");
    setEnviando(true);

    const { error } = await supabase.from("resenas").insert([{
        negocio_id: negocio.id,
        puntuacion: ratingSeleccionado,
        comentario: feedbackComentario,
        nombre_cliente: nombreCliente || "Anónimo"
    }]);

    setEnviando(false);

    if (!error) {
        setModals(prev => ({ ...prev, feedback: false }));
        if (ratingSeleccionado >= 4 && negocio.google_maps_link) {
            if(window.confirm("¡Gracias! ¿Te gustaría dejar tu opinión en Google Maps?")) {
                window.open(negocio.google_maps_link, '_blank');
            }
        } else {
            alert("¡Gracias por tu opinión!");
        }
        setFeedbackComentario("");
        setRatingSeleccionado(0);
        setNombreCliente("");
    } else {
        alert("Error: " + error.message);
    }
  };

  const handleConsultarLead = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setEnviando(true);
    await supabase.from("leads").insert([{ negocio_id: negocio.id, nombre_cliente: nombreCliente, telefono_cliente: "No especificado", estado: "nuevo" }]);
    window.open(`https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(`Hola, soy ${nombreCliente}...`)}`, '_blank');
    setEnviando(false); 
    setModals(prev => ({ ...prev, lead: false }));
    setNombreCliente("");
  };

  // RETORNAMOS TODO ORGANIZADO PARA QUE LA PLANTILLA LO USE FÁCILMENTE
  return {
    negocio,
    ui: {
        modals,
        setModals,
        bookingStep,
        setBookingStep,
        loadingSlots,
        enviando,
        mostrarGracias,
        setMostrarGracias,
        eventLink,
        ratingSeleccionado, 
        setRatingSeleccionado
    },
    forms: {
        bookingData,
        setBookingData,
        nombreCliente,
        setNombreCliente,
        feedbackComentario,
        setFeedbackComentario
    },
    actions: {
        handleDateChange,
        generateTimeSlots,
        handleConfirmBooking,
        handleEnviarFeedback,
        handleConsultarLead
    }
  };
};