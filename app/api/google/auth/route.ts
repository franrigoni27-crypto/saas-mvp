import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  // 1. HARDCODE (Asegúrate que esta sea TU URL de Vercel exacta, sin / al final)
  const DOMINIO_REAL = "https://tu-proyecto.vercel.app"; 
  const redirectUri = `${DOMINIO_REAL}/api/google/callback`;

  // 🔍 LOG PARA VERCEL: Vamos a ver si esto se está ejecutando
  console.log("--- DEBUG GOOGLE AUTH ---");
  console.log("Slug:", slug);
  console.log("Redirect URI calculada:", redirectUri);
  console.log("Client ID (primeros 5):", process.env.GOOGLE_CLIENT_ID?.substring(0, 5));

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri 
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.email"
    ],
    state: slug || "",
    prompt: "consent",
    // ⚠️ TRUCO DE FUERZA BRUTA: Pasamos el redirect_uri AQUÍ TAMBIÉN
    // Esto obliga a la librería a incluir el parámetro si el constructor falló
    redirect_uri: redirectUri 
  });

  console.log("URL Final generada:", url); // <--- Aquí veremos si falta el parámetro

  return NextResponse.redirect(url);
}