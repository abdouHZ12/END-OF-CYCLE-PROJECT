import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Naftal — Système de Gestion des Sorties",
  description: "Employee Exit Request Management System",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
