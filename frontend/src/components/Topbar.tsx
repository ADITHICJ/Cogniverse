"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabaseClient";
import { User } from "lucide-react";

export default function TopBar() {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // Periodic refresh for profile updates
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        loadUserProfile();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowProfileMenu(false);
    };
    if (showProfileMenu) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showProfileMenu]);

  const loadUserProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, profile_picture")
        .eq("id", user.id)
        .single();

      if (profile) {
        const profilePictureUrl = profile.profile_picture
          ? `${profile.profile_picture}?t=${Date.now()}`
          : null;
        setProfilePicture(profilePictureUrl);
        setFullName(profile.full_name || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const isActiveRoute = (route: string) => {
    if (route === '/dashboard/teacher' && pathname === '/dashboard/teacher') {
      return true;
    }
    if (route !== '/dashboard/teacher' && pathname?.startsWith(route)) {
      return true;
    }
    return false;
  };

  const getLinkClassName = (route: string) => {
    return isActiveRoute(route)
      ? "text-blue-600 font-semibold"
      : "hover:text-blue-600 text-gray-600 dark:text-gray-300";
  };

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
              />
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
              className={getLinkClassName("/dashboard/teacher")}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/teacher/content"
              className={getLinkClassName("/dashboard/teacher/content")}
            >
              AI Content
            </Link>
            <Link
              href="/dashboard/teacher/templates"
              className={getLinkClassName("/dashboard/teacher/templates")}
            >
              Template Library
            </Link>
            <Link
              href="/dashboard/teacher/drafts"
              className={getLinkClassName("/dashboard/teacher/drafts")}
            >
              My Drafts
            </Link>
            <Link
              href="/dashboard/teacher/shared"
              className={getLinkClassName("/dashboard/teacher/shared")}
            >
              Shared
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

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile picture"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                {fullName && (
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {fullName.split(" ")[0]}
                  </span>
                )}
              </button>

              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {fullName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Edit Profile
                  </Link>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
