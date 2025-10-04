import { AuthProvider } from "@/context/AuthContext";
import LiveblocksClientProvider from "@/components/LiveblocksClientProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LiveblocksClientProvider>
        <div className="min-h-screen">{children}</div>
      </LiveblocksClientProvider>
    </AuthProvider>
  );
}
