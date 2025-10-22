import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/index.css";
import "@/App.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Owlboard - Collaborative Whiteboard",
  description: "Tu pizarra colaborativa para equipos creativos y educativos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
