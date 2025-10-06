"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
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
              <h2 className="text-xl font-bold">PrepSmart</h2>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a
                className="text-sm font-medium hover:text-blue-600 transition-colors"
                href="#features"
              >
                Features
              </a>
              <a
                className="text-sm font-medium hover:text-blue-600 transition-colors"
                href="#pricing"
              >
                Pricing
              </a>
              <a
                className="text-sm font-medium hover:text-blue-600 transition-colors"
                href="#contact"
              >
                Contact
              </a>
            </nav>
            <div className="flex items-center gap-2">
              <a
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-600/10 dark:hover:bg-blue-600/20 transition-colors"
                href="/auth/login"
              >
                Login
              </a>
              <a
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-600/90 transition-colors"
                href="/auth/signup"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16">
          {/* Mobile-Optimized Hero Section */}
        <section className="relative py-16 sm:py-20 lg:py-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-purple-100 opacity-60"></div>
          <div className="mobile-container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight mb-6">
                AI-Powered Collaborative
                <span className="block text-blue-600 mt-2">Educational Platform</span>
              </h1>
              <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                Create engaging lesson plans and educational content effortlessly.
                Collaborate in real-time and streamline your workflow with PrepSmart 🚀
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <a
                  className="inline-flex items-center justify-center rounded-xl h-12 sm:h-14 px-6 sm:px-8 bg-blue-600 text-white text-base sm:text-lg font-semibold tracking-wide transition-all duration-200 hover:bg-blue-700 hover:scale-105 transform touch-manipulation shadow-lg hover:shadow-xl"
                  href="/auth/signup"
                >
                  Get Started Free
                </a>
                <a
                  className="inline-flex items-center justify-center rounded-xl h-12 sm:h-14 px-6 sm:px-8 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-base sm:text-lg font-semibold tracking-wide transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:scale-105 transform touch-manipulation border border-blue-200 dark:border-blue-800"
                  href="/auth/login"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile-Optimized Features Section */}
        <section
          id="features"
          className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900"
        >
          <div className="mobile-container">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                Key Features
              </h2>
              <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                PrepSmart offers a suite of powerful tools designed to enhance your
                teaching experience.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
              {/* AI Lesson Plan Generator */}
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 touch-manipulation hover:-translate-y-1">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 dark:bg-blue-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    AI Lesson Generator
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    Generate comprehensive lesson plans tailored to your curriculum
                    and student needs with AI.
                  </p>
                </div>
              </div>

              {/* Real-time Collaboration */}
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 touch-manipulation hover:-translate-y-1">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-50 dark:bg-green-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Real-time Collaboration
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    Collaborate with colleagues on lesson plans and content in
                    real-time with live cursors.
                  </p>
                </div>
              </div>

              {/* Template Library */}
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 touch-manipulation hover:-translate-y-1">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-50 dark:bg-purple-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Template Library
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    Access pre-designed templates for different subjects and grade
                    levels instantly.
                  </p>
                </div>
              </div>

              {/* Approval Workflow */}
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 touch-manipulation hover:-translate-y-1">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-50 dark:bg-orange-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Approval Workflow
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    Streamline your approval process with built-in workflow and
                    review tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl opacity-10"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-white">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Ready to Transform Your Teaching?
                </h2>
                <p className="text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
                  Join thousands of educators who are already creating amazing
                  lesson plans with PrepSmart.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-6 sm:px-8 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-200 text-sm sm:text-base touch-manipulation hover:scale-105"
                >
                  Get Started Now
                  <svg
                    className="ml-2 w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-blue-600/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                  fill="currentColor"
                ></path>
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                © 2024 PrepSmart. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                className="text-sm font-medium hover:text-blue-600 transition-colors"
                href="#"
              >
                Terms of Service
              </a>
              <a
                className="text-sm font-medium hover:text-blue-600 transition-colors"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="text-sm font-medium hover:text-blue-600 transition-colors"
                href="#contact"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
