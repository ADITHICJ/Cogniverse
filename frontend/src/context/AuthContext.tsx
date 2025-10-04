"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

interface AuthContextType {
  user: any;
  role: string | null;
  loading: boolean;
  profileComplete: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  profileComplete: false,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const logout = async () => {
    try {
      console.log('🔓 Logging out user...');
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setProfileComplete(false);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth session error:', error);
        }

        if (session?.user) {
          console.log('✅ Session restored for user:', session.user.email);
          setUser(session.user);

          // ✅ fetch role and profile info from profiles table
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role, full_name, profile_picture")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            // If it's just "no rows returned" (PGRST116), don't treat as a fatal error
            if (profileError.code === "PGRST116") {
              console.log("📋 No profile found yet during session restore, new user needs setup.");
            } else {
              console.error("❌ Error fetching profile on session restore:", profileError.message, profileError.code);
            }
            
            setRole(null);
            setProfileComplete(false);
            if (!pathname?.startsWith('/auth/')) {
              router.push('/auth/profile-setup');
            }
            return;
          } else if (!profile) {
            console.log("📋 Profile not found during session restore, redirecting to setup");
            setRole(null);
            setProfileComplete(false);
            if (!pathname?.startsWith('/auth/')) {
              router.push('/auth/profile-setup');
            }
            return;
          }

          if (profile) {
            setRole(profile?.role || null);
            
            // Check if profile is complete (has role and full_name)
            const isComplete = !!(profile?.role && profile?.full_name);
            setProfileComplete(isComplete);

            // Redirect to profile setup if incomplete and not already on auth pages
            if (!isComplete && !pathname?.startsWith('/auth/')) {
              router.push('/auth/profile-setup');
            }
          }
        } else {
          console.log('❌ No active session found');
          setUser(null);
          setRole(null);
          setProfileComplete(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
        setRole(null);
        setProfileComplete(false);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // ✅ listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email || 'no user');
      
      if (session?.user) {
        setUser(session.user);

        supabase
          .from("profiles")
          .select("role, full_name, profile_picture")
          .eq("id", session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              // If it's just "no rows returned" (PGRST116), don't treat as a fatal error
              if (error.code === "PGRST116") {
                console.log("📋 No profile found yet, new user needs setup.");
              } else {
                console.error("❌ Error fetching profile:", error.message, error.code);
              }
              
              setRole(null);
              setProfileComplete(false);
              if (!pathname?.startsWith('/auth/')) {
                router.push('/auth/profile-setup');
              }
              return;
            } else if (!data) {
              console.log("📋 Profile not found, redirecting to setup");
              setRole(null);
              setProfileComplete(false);
              if (!pathname?.startsWith('/auth/')) {
                router.push('/auth/profile-setup');
              }
              return;
            }
            
            if (data) {
              setRole(data?.role || null);
              
              // Check if profile is complete
              const isComplete = !!(data?.role && data?.full_name);
              setProfileComplete(isComplete);

              // Redirect to profile setup if incomplete and not on auth pages
              if (!isComplete && !pathname?.startsWith('/auth/')) {
                router.push('/auth/profile-setup');
              }
            }
          });
      } else {
        setUser(null);
        setRole(null);
        setProfileComplete(false);
      }
      
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, profileComplete, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
