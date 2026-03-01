import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = "https://nota-real.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Nota Real — O Extrato da Indignacao Fiscal",
    template: "%s | Nota Real",
  },
  description:
    "Voce acha que ganha R$ 5.000. A empresa paga R$ 7.700. O Estado captura R$ 2.700 antes de voce ver um centavo. " +
    "Nota Real revela o Socio Oculto, o Raio-X da NF-e e o impacto real da Reforma 2026.",
  keywords: [
    "impostos",
    "transparencia fiscal",
    "nota fiscal eletronica",
    "reforma tributaria 2026",
    "IBPT",
    "salario liquido",
    "socio oculto",
    "INSS",
    "IRPF",
    "carga tributaria",
  ],
  authors: [{ name: "Nota Real" }],
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "Nota Real",
    title: "Nota Real — O Extrato da Indignacao Fiscal",
    description:
      "Voce acha que ganha R$ 5.000. A empresa paga R$ 7.700. " +
      "Nota Real revela o Socio Oculto, a carga tributaria da NF-e e o impacto da Reforma 2026.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nota Real — Transparencia Fiscal",
      },
    ],
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nota Real — O Extrato da Indignacao Fiscal",
    description:
      "Voce acha que ganha R$ 5.000. A empresa paga R$ 7.700. " +
      "Nota Real revela o Socio Oculto e a carga tributaria invisivel.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
