"use server";

import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

// Cliente Supabase con permisos de admin (Service Role) para leer tokens
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// 1. CONSULTAR DISPONIBILIDAD (Busy Slots)
export async function getAvailability(slug: string, dateStr: string) {
  try {
    // A. Obtener credenciales del negocio
    const { data: negocio } = await supabase.from("negocios").select("*").eq("slug", slug).single();
    if (!negocio?.google_calendar_connected) return { error: "Negocio no conectado a Google" };

    // B. Autenticar con Google
    const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    auth.setCredentials({ refresh_token: negocio.google_refresh_token, access_token: negocio.google_access_token });

    // C. Definir rango de tiempo (El día completo seleccionado)
    const startOfDay = new Date(`${dateStr}T00:00:00`);
    const endOfDay = new Date(`${dateStr}T23:59:59`);

    const calendar = google.calendar({ version: "v3", auth });
    
    // D. Pedir eventos a Google
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    // E. Retornar solo los intervalos ocupados
    const busySlots = response.data.items?.map(event => ({
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date
    })) || [];

    return { success: true, busySlots };

  } catch (error: any) {
    console.error("Error fetching availability:", error);
    return { success: false, error: error.message };
  }
}

// 2. CREAR EL TURNO (Agendar)
export async function createAppointment(slug: string, bookingData: any) {
  try {
    const { service, date, time, clientName, clientPhone, clientEmail } = bookingData;
    
    // A. Obtener negocio
    const { data: negocio } = await supabase.from("negocios").select("*").eq("slug", slug).single();
    
    // B. Configurar Google
    const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    auth.setCredentials({ refresh_token: negocio.google_refresh_token });
    const calendar = google.calendar({ version: "v3", auth });

    // C. Calcular Inicio y Fin (Asumimos 1 hora de duración por defecto)
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 Hora

    // D. Insertar en Google Calendar
    const googleEvent = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: `Turno: ${clientName} (${service})`,
        description: `Servicio: ${service}\nCliente: ${clientName}\nTel: ${clientPhone}\nEmail: ${clientEmail}`,
        start: { dateTime: startDateTime.toISOString() },
        end: { dateTime: endDateTime.toISOString() },
      }
    });

    // E. Guardar en Supabase (Para el Dashboard)
    const { error: dbError } = await supabase.from("turnos").insert({
      negocio_id: negocio.id,
      cliente_nombre: clientName,
      cliente_email: clientEmail,
      servicio: service,
      fecha_inicio: startDateTime.toISOString(),
      fecha_fin: endDateTime.toISOString(),
      google_event_id: googleEvent.data.id,
      estado: "confirmado"
    });

    // F. También guardamos como Lead si es nuevo (Opcional pero recomendado)
    await supabase.from("leads").insert({
        negocio_id: negocio.id,
        nombre_cliente: clientName,
        telefono_cliente: clientPhone,
        estado: "cliente" // Ya reservó, es cliente
    });

    if (dbError) throw dbError;
    return { success: true };

  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return { success: false, error: error.message };
  }
}