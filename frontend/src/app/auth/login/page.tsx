"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { role } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    return;
  }

  if (data.user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
      setError("Login succeeded but profile lookup failed");
      return;
    }

    if (profile.role === "teacher") router.push("/dashboard/teacher");
    else if (profile.role === "hod") router.push("/dashboard/hod");
    else router.push("/dashboard");
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md border dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600 dark:text-indigo-400">
          Login
        </h2>
        {error && <p className="text-red-500 dark:text-red-400 mb-3 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white p-3 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Login
        </button>

        <div className="mt-4 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Don't have an account?{" "}
            <a
              href="/auth/signup"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium hover:underline"
            >
              Sign up here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
