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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col text-gray-900 bg-[#fbfbfd]">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
