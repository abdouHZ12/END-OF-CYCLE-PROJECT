import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeModeProvider } from "@/components/theme/ThemeModeProvider";
import MuiRegistry from "@/components/theme/MuiRegistry";

export const metadata: Metadata = {
  title: "Naftal — Système de Gestion des Sorties",
  description: "Employee Exit Request Management System",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="naftal-theme-init" strategy="beforeInteractive">
          {`try{var m=localStorage.getItem('naftal.theme');if(m==='light'||m==='dark'){document.documentElement.dataset.theme=m;}}catch(e){}`}
        </Script>
        <MuiRegistry>
          <ThemeModeProvider>{children}</ThemeModeProvider>
        </MuiRegistry>
      </body>
    </html>
  );
}