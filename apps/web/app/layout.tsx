import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProviders } from "../src/bootstrap/app-providers";

export const metadata: Metadata = {
  title: "SeniorEase",
  description:
    "Plataforma de acessibilidade para idosos: simples, clara e previsivel.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Nao bloqueia o zoom do usuario (acessibilidade / WCAG 1.4.4).
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
