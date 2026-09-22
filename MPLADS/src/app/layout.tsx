import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B2545",
};

export const metadata: Metadata = {
  title: "NIDHI-RAKSHAK | AI Public Fund & Infrastructure Vigilance Platform",
  description: "NIDHI-RAKSHAK: Multi-Tier AI & Machine Learning Governance and Monitoring Platform",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable} scroll-smooth`}>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground overflow-x-hidden">
        <AuthProvider>
          <TooltipProvider>
            {children}
            {/* Google Translate Hidden Mount Container */}
            <div id="google_translate_element" aria-hidden="true" />
          </TooltipProvider>
        </AuthProvider>

        {/* Global Google Translate Initialization */}
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.googleTranslateElementInit = function() {
                if (window.google && window.google.translate) {
                  new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,hi,bn,te,mr,ta,gu,kn,ml,pa,or,as,ur,sa,mai,doi,bho,ne,kok,mni-Mtei,sd,lus',
                    autoDisplay: false
                  }, 'google_translate_element');
                }
              };
            `,
          }}
        />
        <Script
          id="google-translate-script"
          strategy="afterInteractive"
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        />
      </body>
    </html>
  );
}
