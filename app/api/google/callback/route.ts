import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const slug = searchParams.get("state"); // Recuperamos el slug que enviamos en el "state"
  const error = searchParams.get("error");

  // 1. SI GOOGLE DEVUELVE ERROR (El usuario canceló)
  if (error) {
     return NextResponse.redirect(new URL(`/${slug}?error=google_denied`, request.url));
  }

  // 2. VALIDACIÓN BÁSICA
  if (!code || !slug) {
     return NextResponse.json({ error: "Faltan parámetros code o slug" }, { status: 400 });
  }

  // 3. HARDCODE: ESTA URL DEBE SER IDÉNTICA A LA DEL ARCHIVO AUTH
  const DOMINIO_REAL = "https://unitpro-system.vercel.app";
  const redirectUri = `${DOMINIO_REAL}/api/google/callback`;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  try {
    // 4. CANJEAR EL CÓDIGO POR TOKENS (Aquí solía fallar si la URL no coincidía)
    const { tokens } = await oauth2Client.getToken(code);
    
    // Debug en logs de Vercel
    console.log("Tokens recibidos de Google:", tokens ? "SÍ" : "NO");
    if (tokens.refresh_token) console.log("Refresh Token recibido: SÍ (¡Éxito!)");

    // 5. GUARDAR EN SUPABASE
    // Usamos un cliente directo para asegurar que funcione en el servidor
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Actualizamos el negocio usando el SLUG
    const { error: dbError } = await supabase
      .from("negocios")
      .update({
        google_calendar_connected: true,
        // Guardamos el refresh_token (CRÍTICO para crear eventos en el futuro sin pedir permiso)
        // Nota: Google solo lo envía si prompt="consent", que ya lo pusimos en auth.
        ...(tokens.refresh_token && { google_refresh_token: tokens.refresh_token }),
        // El access token caduca rápido, pero lo guardamos por si acaso
        google_access_token: tokens.access_token,
      })
      .eq("slug", slug);

    if (dbError) {
        console.error("Error guardando en Supabase:", dbError);
        throw dbError;
    }

    // 6. REDIRIGIR AL DASHBOARD CON ÉXITO
    // Agregamos google_connected=true para que el frontend pueda mostrar un mensaje de éxito o recargar
    return NextResponse.redirect(new URL(`/${slug}?google_connected=true`, request.url));

  } catch (err: any) {
    console.error("❌ ERROR EN CALLBACK:", err.message);
    // Redirigimos con el error para que el usuario sepa que falló
    return NextResponse.redirect(new URL(`/${slug}?error=auth_failed`, request.url));
  }
}