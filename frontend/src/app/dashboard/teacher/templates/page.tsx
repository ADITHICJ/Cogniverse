"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import TopBar from "@/components/Topbar";
// TopBar Component (inline for consistency)
<TopBar/>

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase.from("templates").select("*");
      if (error) console.error("Error fetching templates:", error);
      else setTemplates(data);
    };
    fetchTemplates();
  }, []);

  // ✅ Edit handler
  const handleEdit = (id: string) => {
    router.push(`/dashboard/teacher/templates/${id}`);
  };

  // ✅ Use Template handler
  const handleUseTemplate = (id: string) => {
    localStorage.setItem("selectedTemplateId", id); // store for auto-select
    router.push("/dashboard/teacher/content"); // redirect
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 font-display text-gray-800 dark:text-gray-200 flex flex-col min-h-screen">
      <TopBar />

      {/* Main */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-1/4 xl:w-1/5">
            <div className="sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Filters
              </h2>
              <div className="space-y-4">
                {["Subject", "Grade"].map((label, idx) => (
                  <div key={idx}>
                    <label
                      htmlFor={label.toLowerCase().replace(" ", "-")}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {label}
                    </label>
                    <select
                      id={label.toLowerCase().replace(" ", "-")}
                      name={label.toLowerCase().replace(" ", "-")}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm rounded-lg"
                    >
                      <option>All {label}s</option>
                      {label === "Subject" && (
                        <>
                          <option>Math</option>
                          <option>Science</option>
                          <option>History</option>
                          <option>English</option>
                        </>
                      )}
                      {label === "Grade" && (
                        <>
                          <option>9th</option>
                          <option>10th</option>
                          <option>11th</option>
                          <option>12th</option>
                        </>
                      )}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  📑 My Templates
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Explore and apply templates to streamline your lesson planning.
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard/teacher/templates/create")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>New Template</span>
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  type="text"
                  placeholder="Search templates by keyword, subject, etc..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                />
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="group relative bg-white dark:bg-gray-900/50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-800"
                >
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {tpl.title}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                      {tpl.content}
                    </p>

                    {(tpl.subject || tpl.grade) && (
                      <div className="mb-4 flex gap-2 flex-wrap">
                        {tpl.subject && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {tpl.subject}
                          </span>
                        )}
                        {tpl.grade && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {tpl.grade}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(tpl.id)} // ✅ Edit
                        className="flex-1 text-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUseTemplate(tpl.id)} // ✅ Use Template
                        className="flex-1 text-center px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
