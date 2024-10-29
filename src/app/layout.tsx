import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { SessionProvider } from "@/components/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MissPunch - Time Record Management",
  description: "Manage compensable time records efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="day">
      <body className={inter.className}>
        <SessionProvider>
          <div className="relative min-h-screen flex flex-col">
            <Header />
            <div className="flex-1">{children}</div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
