import React from "react";
import Link from "next/link";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                fill="currentColor"
              ></path>
            </svg>
            <Link href="/dashboard/teacher">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer">
                PrepSmart
              </h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard/teacher"
              className="text-blue-600 font-semibold"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/teacher/content"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              AI Content
            </Link>
            <Link
              href="/dashboard/teacher/templates"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              Template Library
            </Link>
            <Link
              href="/dashboard/teacher/drafts"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              My Drafts
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <Link href="/dashboard/teacher/notifications">
                <svg
                  className="h-5 w-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zM12 2v20"
                  />
                </svg>
              </Link>
            </button>

            {/* Profile */}
            <div className="relative">
              <Link href="/dashboard/teacher/profile">
                <img
                  alt="User profile picture"
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 cursor-pointer"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
