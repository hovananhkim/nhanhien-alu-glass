import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { CartProvider } from "@/components/ui/CartContext";

export const metadata: Metadata = {
  title: {
    template: "%s | NhanHien Furniture",
    default: "NhanHien Furniture – Handcrafted Premium Furniture",
  },
  description:
    "Premium handcrafted furniture for homes, hotels and offices. B2B bulk orders and custom manufacturing. Located in Ahmedabad, Gujarat.",
  keywords: [
    "furniture",
    "handcrafted",
    "custom furniture",
    "bulk furniture",
    "B2B furniture",
    "Ahmedabad",
    "Gujarat",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    siteName: "NhanHien Fine Furniture",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('craftura-theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&p)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="grain-overlay">
        <ThemeProvider>
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
