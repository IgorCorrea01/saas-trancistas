import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Provedores } from "@/componentes/provedores/Provedores";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TrançaFlow • Sistema de Orçamento e Agendamento para Trancistas",
  description:
    "Transforme pedidos de orçamento em atendimentos. Receba pedidos com fotos, monte orçamentos profissionais, cobre sinal e organize sua agenda em um só lugar.",
  keywords: [
    "sistema para trancista",
    "sistema de orçamento para trancista",
    "agenda para trancista",
    "formulário para clientes de tranças",
    "agendamento para trancista",
    "catálogo de tranças",
    "gestão para trancistas",
  ],
  authors: [{ name: "TrançaFlow" }],
  openGraph: {
    title: "TrançaFlow • Sistema de Orçamento e Agendamento para Trancistas",
    description:
      "Transforme pedidos de orçamento em atendimentos. Receba pedidos com fotos, defina seu orçamento e organize sua agenda sem complicações.",
    type: "website",
    locale: "pt_BR",
    siteName: "TrançaFlow",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TrançaFlow",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#9f1239",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground font-sans flex flex-col antialiased">
        <Provedores>{children}</Provedores>
      </body>
    </html>
  );
}
