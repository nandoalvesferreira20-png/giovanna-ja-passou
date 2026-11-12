import type { Metadata, Viewport } from "next";
import { StudyProvider } from "@/hooks/use-study";
import { Shell } from "@/components/study-app";
import "./globals.css";
export const viewport: Viewport = {
  themeColor: "#fcfafc",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export const metadata: Metadata = {
  title: "Giovanna Já Passou! | Seu cantinho de estudos",
  description:
    "Você estuda, você aprende, você arrasa. Uma plataforma de estudos feita com carinho para Giovanna.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <StudyProvider>
          <Shell>{children}</Shell>
        </StudyProvider>
      </body>
    </html>
  );
}
