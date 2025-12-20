import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  // ⚠️ REEMPLAZA ESTO CON TU URL DE VERCEL EXACTA ⚠️
  // Asegúrate de que empiece con HTTPS y termine en /api/google/callback
  const DOMINIO_REAL = "https://TU-PROYECTO.vercel.app"; 
  const redirectUri = `${DOMINIO_REAL}/api/google/callback`;

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
    prompt: "consent"
  });

  return NextResponse.redirect(url);
}