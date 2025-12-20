"use server";

import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";
import { revalidatePath } from "next/cache";
// Configuración de Supabase Admin (para leer tokens seguros)
// Asegúrate de que estas variables estén en tu .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function agendarTurno(slugNegocio: string, datosCliente: any, fechaHoraIso: string) {
  try {
    // 1. Buscar el negocio y sus tokens en Supabase
    const { data: negocio } = await supabase
      .from("negocios")
      .select("*")
      .eq("slug", slugNegocio)
      .single();

    if (!negocio || !negocio.google_refresh_token) {
      return { success: false, error: "El negocio no tiene Google Calendar conectado." };
    }

    // 2. Configurar cliente de Google OAuth2
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    // Le pasamos el refresh token para que Google genere un access token nuevo automáticamente
    auth.setCredentials({
      refresh_token: negocio.google_refresh_token,
    });

    const calendar = google.calendar({ version: "v3", auth });

    // 3. Preparar fechas (Duración por defecto: 1 hora)
    const inicio = new Date(fechaHoraIso);
    const fin = new Date(inicio.getTime() + 60 * 60 * 1000); // +1 hora (ajustar si necesario)

    // 4. Crear el evento en Google Calendar
    const eventoGoogle = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: `Turno: ${datosCliente.nombre}`,
        description: `Servicio solicitado desde UnitPro System.\nCliente: ${datosCliente.nombre}\nTel: ${datosCliente.telefono}\nEmail: ${datosCliente.email}`,
        start: { 
            dateTime: inicio.toISOString() 
        },
        end: { 
            dateTime: fin.toISOString() 
        },
        
        // --- MEJORA: INVITACIÓN AL CLIENTE ---
        // Esto envía el correo de invitación de Google al cliente si tiene email
        attendees: datosCliente.email ? [{ email: datosCliente.email }] : [],

        // --- MEJORA: RECORDATORIOS ---
        // Configuración de alertas (Email 24hs antes, Popup 30 min antes)
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      },
    });

    // 5. Guardar en Supabase (Espejo local para historial)
    const { error: dbError } = await supabase.from("turnos").insert({
      negocio_id: negocio.id,
      cliente_nombre: datosCliente.nombre,
      cliente_email: datosCliente.email || "No especificado",
      fecha_inicio: inicio.toISOString(),
      fecha_fin: fin.toISOString(),
      google_event_id: eventoGoogle.data.id,
      estado: "confirmado"
    });

    if (dbError) {
        console.error("Error guardando turno en DB local:", dbError);
        // No retornamos error aquí porque en Google ya se agendó, solo logueamos
    }

    return { success: true, eventId: eventoGoogle.data.id };

  } catch (error: any) {
    console.error("Error al agendar en Server Action:", error);
    return { success: false, error: error.message || "Error desconocido al agendar" };
  }

}
export async function cancelarTurno(turnoId: string) {
  try {
    // A. Buscar datos del turno y el token del negocio
    const { data: turno, error } = await supabase
      .from("turnos")
      .select(`
        google_event_id,
        negocios (google_refresh_token)
      `)
      .eq("id", turnoId)
      .single();

    if (error || !turno) return { success: false, error: "Turno no encontrado." };

    // @ts-ignore
    const refreshToken = turno.negocios?.google_refresh_token;
    
    // B. Borrar de Google Calendar (si existe)
    if (refreshToken && turno.google_event_id) {
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID, 
        process.env.GOOGLE_CLIENT_SECRET
      );
      auth.setCredentials({ refresh_token: refreshToken });
      const calendar = google.calendar({ version: "v3", auth });

      try {
        await calendar.events.delete({
          calendarId: "primary",
          eventId: turno.google_event_id,
          sendUpdates: "all", // Manda email de cancelación al cliente
        });
      } catch (e: any) {
        // Ignoramos si ya no existe (404/410)
        if (e.code !== 404 && e.code !== 410) console.error("Error Google:", e.message);
      }
    }

    // C. Borrar de Supabase
    const { error: dbError } = await supabase.from("turnos").delete().eq("id", turnoId);
    if (dbError) return { success: false, error: dbError.message };

    // D. Actualizar pantalla automáticamente
    revalidatePath("/dashboard"); 

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}