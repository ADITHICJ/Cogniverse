"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase.from("templates").select("*");
      if (error) console.error("Error fetching templates:", error);
      else setTemplates(data);
    };
    fetchTemplates();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">📑 My Templates</h1>
        <Link
          href="/dashboard/teacher/templates/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          ➕ New Template
        </Link>
      </div>

      <ul className="space-y-3">
        {templates.map((tpl) => (
          <li key={tpl.id} className="border p-4 rounded-lg bg-white shadow">
            <h2 className="font-semibold">{tpl.title}</h2>
            <p className="text-sm text-gray-600 line-clamp-2">{tpl.content}</p>
            <div className="mt-2 flex gap-2">
              <Link
                href={`/dashboard/teacher/templates/${tpl.id}`}
                className="text-indigo-600 hover:underline"
              >
                Edit
              </Link>
              <Link
                href={`/dashboard/teacher/content?template_id=${tpl.id}`}
                className="text-green-600 hover:underline"
              >
                Use in Generator
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
