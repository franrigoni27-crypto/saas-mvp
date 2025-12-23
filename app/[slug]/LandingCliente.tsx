"use client";
import TemplateRenderer from "@/components/templates/TemplateRegistry";

// Este archivo ahora actúa solo como un envoltorio transparente
export default function LandingCliente({ initialData }: { initialData: any }) {
  return <TemplateRenderer initialData={initialData} />;
}