import Topbar from "@/components/Topbar";

export default function HODDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <Topbar />
      <main className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-green-600">📊 HOD Dashboard</h1>
        <p className="mt-4 text-gray-700">
          Review and approve lesson plans submitted by teachers, and oversee content quality.
        </p>
      </main>
    </div>
  );
}
