import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "HealthCare - Virtual Health Platform | Connect with Providers Online",
  description: "Secure virtual healthcare platform connecting patients with certified providers. Book appointments, video consultations, and manage health records. HIPAA compliant and available 24/7.",
  keywords: ["healthcare", "telemedicine", "virtual consultation", "online doctor", "health records", "medical appointments"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
