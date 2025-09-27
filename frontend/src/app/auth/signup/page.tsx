"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }, // 👈 still store in raw_user_meta_data
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    // 👇 Insert into profiles table (returning minimal = don’t try to fetch the row back)
    if (data.user) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert([{ id: data.user.id, role }]);

      if (insertError) {
        console.error("Profile insert error:", insertError.message);
        setError("Signup succeeded but profile insert failed");
        return;
      }
    }

    router.push("/dashboard"); // Go to dashboard if everything is fine
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">
          Signup
        </h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="w-full p-3 mb-6 border rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="teacher">Teacher</option>
          <option value="hod">Department Head</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700"
        >
          Signup
        </button>
      </form>
    </div>
  );
}
