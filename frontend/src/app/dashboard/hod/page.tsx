"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DepartmentHeadDashboard() {
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    teamMembers: 0,
    pendingSubmissions: 0,
    approvedDrafts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchPendingSubmissions = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/submissions');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch submissions: ${response.status}`);
        }

        const submissions = await response.json();
        setPendingSubmissions(submissions.slice(0, 4)); // Show only first 4 for dashboard
      } catch (err) {
        console.error("❌ Error fetching submissions:", err);
        setPendingSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const response = await fetch('/api/hod-stats');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`);
        }

        const statsData = await response.json();
        setStats(statsData);
      } catch (err) {
        console.error("❌ Error fetching stats:", err);
        setStats({
          teamMembers: 0,
          pendingSubmissions: 0,
          approvedDrafts: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchPendingSubmissions();
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
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
              <Link href="/dashboard/hod">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer">
                  PrepSmart
                </h1>
              </Link>
            </div>

            {/* Search + Actions */}
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  🔍
                </span>
                <input
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none w-64"
                  placeholder="Search..."
                  type="text"
                />
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <span className="text-gray-600 dark:text-gray-400">🔔</span>
              </button>
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{
                  backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCMZy4jj9QdPjydYwdIDj09Ikl5e9by9BkIyiLznrvqM1MRAL57ZVFRyEj_nONQcWILIIUGHYbVLDY2LROqUwriut269hXoa7kIsHCJZnopqI65BQb8BPVw0-VypkAJWyK20CxEB1OHdkwlINaTxmSwLvRnd0qibj4AdghzPT4eIXIYElksSaENES-ahORFknDC9ejMQPBYdq80YQUF1vpDtzq7T_XAunh409Z0RD2gBn_scDNu9DMGLroXg6UzAKq9Ge63JNC7__k")`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex-1 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Department Head Dashboard
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Welcome back, get a quick overview of your department.
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { 
                  label: "Pending Submissions", 
                  value: statsLoading ? "..." : stats.pendingSubmissions.toString(),
                  color: "text-yellow-600"
                },
                { 
                  label: "Approved Drafts", 
                  value: statsLoading ? "..." : stats.approvedDrafts.toString(),
                  color: "text-green-600"
                },
                { 
                  label: "Team Members", 
                  value: statsLoading ? "..." : stats.teamMembers.toString(),
                  color: "text-blue-600"
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col gap-2"
                >
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>
                  <p className={`text-3xl font-bold ${item.color || 'text-gray-900 dark:text-white'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Pending Approvals */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Pending Drafts Summary
                  </h3>
                  <Link 
                    href="/dashboard/hod/review"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">Loading drafts...</span>
                    </div>
                  ) : pendingSubmissions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No pending submissions</p>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          {[
                            "Draft Title",
                            "Submitted By",
                            "Submitted At",
                            "Status",
                            "",
                          ].map((col, idx) => (
                            <th
                              key={idx}
                              className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pendingSubmissions.map((submission) => (
                          <tr
                            key={submission.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="py-4 px-4 text-sm text-gray-800 dark:text-gray-200">
                              {submission.drafts?.title || "Untitled"}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                              {submission.profiles?.full_name || "Unknown User"}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                              {new Date(submission.submitted_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                                Pending
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <Link
                                href={`/dashboard/hod/review/${submission.id}`}
                                className="text-blue-600 hover:underline text-sm font-semibold"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Team Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Team Activity
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      icon: "✏️",
                      color: "text-blue-600",
                      text: "Alice Johnson updated the Marketing Campaign Template",
                      time: "2 hours ago",
                    },
                    {
                      icon: "✓",
                      color: "text-green-500",
                      text: "Bob Williams submitted the Sales Presentation Template",
                      time: "4 hours ago",
                    },
                    {
                      icon: "🚀",
                      color: "text-purple-500",
                      text: "Charlie Davis started a new collaboration",
                      time: "6 hours ago",
                    },
                    {
                      icon: "💬",
                      color: "text-red-500",
                      text: "Ethan Foster commented on a template",
                      time: "10 hours ago",
                    },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 pt-1">
                        <span className={`text-xl ${activity.color}`}>
                          {activity.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {activity.text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reports */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Overview Reports
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Chart 1 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                    Template Approval Trends
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      +15%
                    </p>
                    <p className="text-sm font-medium text-green-500">
                      vs last month
                    </p>
                  </div>
                  <div className="mt-4 h-48">
                    <svg
                      fill="none"
                      height="100%"
                      preserveAspectRatio="none"
                      viewBox="0 0 472 150"
                      width="100%"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient
                          id="chart-gradient"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#2563eb"
                            stopOpacity="0.2"
                          />
                          <stop
                            offset="100%"
                            stopColor="#2563eb"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V150H0Z"
                        fill="url(#chart-gradient)"
                      />
                      <path
                        d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                        stroke="#2563eb"
                        strokeLinecap="round"
                        strokeWidth="3"
                      />
                    </svg>
                  </div>
                </div>

                {/* Chart 2 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                    Submission Trends
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      -5%
                    </p>
                    <p className="text-sm font-medium text-red-500">
                      vs last month
                    </p>
                  </div>
                  <div className="mt-4 h-48 flex items-end gap-4">
                    {["Jan", "Feb", "Mar"].map((month, idx) => {
                      const heights = ["60%", "20%", "60%"];
                      return (
                        <div
                          key={month}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div
                            className="w-full bg-blue-600/20 rounded-t-lg"
                            style={{ height: heights[idx] }}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {month}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}