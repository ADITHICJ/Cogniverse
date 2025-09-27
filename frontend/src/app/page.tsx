export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-8">
      <h1 className="text-5xl font-extrabold text-indigo-600 mb-6">
        PrepSmart
      </h1>
      <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl">
        AI-Powered Collaborative Lesson Plan & Content Generator 🚀
      </p>

      <div className="flex gap-6">
        <a
          href="/auth/login"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Login
        </a>
        <a
          href="/auth/signup"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition"
        >
          Signup
        </a>
      </div>
    </main>
  );
}
