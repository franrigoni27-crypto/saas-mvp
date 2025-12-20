import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createServerClient, type CookieOptions } from "@supabase/ssr"; // <--- CAMBIO AQUÍ
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const slug = searchParams.get("state");

  if (!code || !slug) return NextResponse.redirect(new URL("/", request.url));

  const cookieStore = await cookies(); // <--- En Next 16 esto lleva await

  // Crear cliente de Supabase compatible con Next 16
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  // ⚠️ TU URL REAL DE VERCEL (Hardcoded para evitar errores)
  const DOMINIO_REAL = "https://TU-PROYECTO.vercel.app";
  const redirectUri = `${DOMINIO_REAL}/api/google/callback`;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    await supabase
      .from("negocios")
      .update({
        google_refresh_token: tokens.refresh_token,
        google_email: userInfo.data.email,
        google_calendar_connected: true
      })
      .eq("slug", slug);

    return NextResponse.redirect(new URL(`/${slug}?google_connected=true`, request.url));
  } catch (error) {
    console.error("Error Auth:", error);
    return NextResponse.redirect(new URL(`/${slug}?error=auth_failed`, request.url));
  }
}