import React from 'react';

// TopBar Component (inline for artifact compatibility)
function TopBar() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">PrepSmart</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <a className="text-blue-600 font-semibold" href="#">Dashboard</a>
            <a className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors" href="#">AI Content</a>
            <a className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors" href="#">Template Library</a>
            <a className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors" href="#">My Drafts</a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zM12 2v20" />
              </svg>
            </button>
            <div className="relative">
              <button className="flex items-center space-x-2">
                <img 
                  alt="User profile picture" 
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* TopBar Component */}
      <TopBar />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>
          
          {/* Quick Actions */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <a className="group bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center" href="#">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Generate New Content</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create AI-powered content in seconds.</p>
              </a>

              <a className="group bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center" href="#">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">View Templates</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Browse our library of pre-built templates.</p>
              </a>

              <a className="group bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center" href="#">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">My Drafts</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Access and manage your saved drafts.</p>
              </a>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                <li className="p-4 flex items-center space-x-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Content: '5 Tips for Effective Study'</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Approved by Sarah</p>
                  </div>
                </li>

                <li className="p-4 flex items-center space-x-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Content: 'Mastering Math Concepts'</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Comment by Alex: 'Great work!'</p>
                  </div>
                </li>

                <li className="p-4 flex items-center space-x-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Content: 'Science Experiments for Kids'</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Collaboration update</p>
                  </div>
                </li>

                <li className="p-4 flex items-center space-x-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Content: 'A Guide to Historical Fiction'</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">New edit from Mike</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}