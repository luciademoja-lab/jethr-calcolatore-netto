import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Da RAL a netto — calcolatore 2026",
  description:
    "Prototipo che proietta la retribuzione netta annuale e mensile a partire dalla RAL, mostrando ogni voce trattenuta dal lordo con la relativa fonte normativa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className="h-full antialiased">
      {/*
        Font di sistema anziché next/font/google: evita una dipendenza di rete
        in fase di build e rende il progetto compilabile anche offline.
      */}
      <body className="flex min-h-full flex-col bg-slate-100 text-slate-900">{children}</body>
    </html>
  );
}
