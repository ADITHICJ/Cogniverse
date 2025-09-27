import "./globals.css";
import LiveblocksClientProvider from "@/components/LiveblocksClientProvider";

export const metadata = {
  title: "PrepSmart",
  description: "AI-Powered Collaborative Lesson Plan Generator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900">
        <LiveblocksClientProvider>
          {children}
        </LiveblocksClientProvider>
      </body>
    </html>
  );
}
