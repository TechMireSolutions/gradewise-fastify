import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers.jsx";
import { ThemeScript } from "@/components/ThemeProvider.jsx";
import SkipLink from "@/components/layout/SkipLink.jsx";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Gradewise AI - Intelligent Assessment Platform",
  description: "Automate question generation, evaluation, and explainable feedback using AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full antialiased ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans safe-area-x" suppressHydrationWarning>
        <SkipLink />
        <Providers>{children}</Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: "!bg-toast !text-foreground !border !border-toast-border backdrop-blur-md",
            style: {
              borderRadius: "12px",
              padding: "16px",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </body>
    </html>
  );
}
