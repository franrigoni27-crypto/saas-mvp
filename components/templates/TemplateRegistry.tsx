"use client";
import { useBusinessLogic } from "./logic/useBusinessLogic";
import GeneralLanding from "./layout/GeneralLanding";       
import SpecializedLanding from "./layout/specialized/SpecializedLanding"; 

const TEMPLATES: any = {
  'general': GeneralLanding,
  'specialized': SpecializedLanding
};

export default function TemplateRenderer({ initialData }: any) {
  const logic = useBusinessLogic(initialData);
  const templateName = logic.negocio.config_web?.template || 'general';
  
  const SelectedTemplate = TEMPLATES[templateName] || GeneralLanding;

  return <SelectedTemplate logic={logic} />;
}