"use client";
import React from "react";

interface SafeHTMLProps {
  html: string;
  className?: string;
  as?: React.ElementType;
}

// Fíjate que dice "export const", NO "export default"
export const SafeHTML = ({ html, className = "", as: Component = "div" }: SafeHTMLProps) => {
  if (!html) return null;
  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};