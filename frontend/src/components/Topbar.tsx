"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabaseClient";
import { User, Menu, X, Bell } from "lucide-react";

export default function TopBar() {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      setIsMobileMenuOpen(false);
    };
    if (showProfileMenu || isMobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showProfileMenu, isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 safe-area-top">
        <div className="mobile-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <svg
                className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0"
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
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white cursor-pointer truncate">
                  PrepSmart
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
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
                Templates
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
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Notifications - Hidden on very small screens */}
              <Link 
                href="/dashboard/teacher/notifications"
                className="hidden sm:flex p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Link>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileMenu(!showProfileMenu);
                  }}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600 flex-shrink-0">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile picture"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    )}
                  </div>
                  {fullName && (
                    <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-20 truncate">
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
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {fullName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      href="/dashboard/teacher/notifications"
                      className="block sm:hidden px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Notifications
                    </Link>

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

              {/* Mobile menu button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="mobile-container py-4 space-y-2">
              <Link
                href="/dashboard/teacher"
                className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActiveRoute("/dashboard/teacher")
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🏠 Dashboard
              </Link>
              <Link
                href="/dashboard/teacher/content"
                className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActiveRoute("/dashboard/teacher/content")
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🤖 AI Content
              </Link>
              <Link
                href="/dashboard/teacher/templates"
                className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActiveRoute("/dashboard/teacher/templates")
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📚 Templates
              </Link>
              <Link
                href="/dashboard/teacher/drafts"
                className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActiveRoute("/dashboard/teacher/drafts")
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📝 My Drafts
              </Link>
              <Link
                href="/dashboard/teacher/shared"
                className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActiveRoute("/dashboard/teacher/shared")
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                👥 Shared
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
