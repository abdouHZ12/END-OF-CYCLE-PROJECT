import { ThemeModeProvider } from "@/components/theme/ThemeModeProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeModeProvider forcedMode="dark">
      {children}
    </ThemeModeProvider>
  );
}