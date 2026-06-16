import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "Gradewise AI - Intelligent Assessment Platform",
  description: "Automate question generation, evaluation, and explainable feedback using AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100" suppressHydrationWarning>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1f2937",
              color: "#fff",
              borderRadius: "12px",
              padding: "16px",
            },
          }}
        />
      </body>
    </html>
  );
}
