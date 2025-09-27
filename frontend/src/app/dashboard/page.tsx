"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardRedirect() {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (role === "teacher") router.replace("/dashboard/teacher");
      else if (role === "hod") router.replace("/dashboard/hod");
      else router.replace("/auth/login"); // fallback if role missing
    }
  }, [role, loading, router]);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

  return null; // redirects once role is known
}
