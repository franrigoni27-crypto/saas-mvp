import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const slug = requestUrl.searchParams.get("state"); // Google devuelve el 'state' que enviamos (el slug)

  if (code) {
    // 1. Crear el cliente de Supabase usando la librería nueva (SSR)
    const supabase = await createClient();

    // 2. Intercambiar el código temporal por una sesión real
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 3. Si todo salió bien, redirigir al dashboard del slug correcto
      // Notificamos con ?google_connected=true para mostrar el mensaje de éxito
      return NextResponse.redirect(`${requestUrl.origin}/${slug}/dashboard?google_connected=true`);
    }
  }

  // Si algo falla, volver al login
  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth`);
}