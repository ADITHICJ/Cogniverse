"use client";

import React from "react";

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
        {/* Hero Section */}
        <section className="relative py-20 sm:py-32 flex items-center justify-center text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-purple-100 opacity-60"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl text-gray-900 dark:text-white">
                AI-Powered Collaborative Lesson Plan & Content Generator
              </h1>
              <p className="max-w-xl mx-auto text-lg text-gray-700 dark:text-gray-300">
                Create engaging lesson plans and educational content effortlessly.
                Collaborate in real-time and streamline your workflow with PrepSmart 🚀
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <a
                  className="inline-flex items-center justify-center rounded-lg h-12 px-6 bg-blue-600 text-white text-base font-bold tracking-wide transition-transform hover:scale-105 transform"
                  href="/auth/signup"
                >
                  Get Started
                </a>
                <a
                  className="inline-flex items-center justify-center rounded-lg h-12 px-6 bg-blue-600/20 dark:bg-blue-600/30 text-blue-600 text-base font-bold tracking-wide transition-transform hover:scale-105 transform"
                  href="/auth/login"
                >
                  Login
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-20 sm:py-24 bg-gray-50 dark:bg-gray-900"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
                Key Features
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                PrepSmart offers a suite of powerful tools designed to enhance your
                teaching experience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* AI Lesson Plan Generator */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    AI Lesson Plan Generator
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Generate comprehensive lesson plans tailored to your curriculum
                    and student needs.
                  </p>
                </div>
              </div>

              {/* Real-time Collaboration */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Real-time Collaboration
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Collaborate with colleagues on lesson plans and content in
                    real-time.
                  </p>
                </div>
              </div>

              {/* Template Library */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Template Library
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Access pre-designed templates for different subjects and grade
                    levels.
                  </p>
                </div>
              </div>

              {/* Approval Workflow */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Approval Workflow
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Streamline your approval process with built-in workflow tools.
                  </p>
                </div>
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
