import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: "Ajaia Docs | Lightweight Collaborative Document Editor",
  description: "Fast, elegant document creation, rich text editing, file handling, and sharing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark antialiased">
      <body className="min-h-full flex flex-col text-[#f3f4f6] bg-[#0f1115] selection:bg-indigo-500/30 selection:text-white">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
