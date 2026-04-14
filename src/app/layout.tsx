import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayPal Pay Later Tools",
  description: "PayPal Pay Later eligibility check and checkout demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#f5f5f5] min-h-screen antialiased">{children}</body>
    </html>
  );
}
