import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Only allow admins
  if (!session || (session.user && (session.user as any).role !== "admin")) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Admin Dashboard</h1>
        <p className="mb-8 text-lg text-gray-700">
          Welcome, <span className="font-semibold">{session.user?.name || session.user?.email}</span>!<br />
          Here you can manage users, moderate content, and view reports.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/admin/users" className="block bg-blue-100 p-6 rounded shadow hover:bg-blue-200 transition">
            <h2 className="text-xl font-semibold mb-2">User Management</h2>
            <p>Ban, remove, or promote users. View user details.</p>
          </Link>
          <Link href="/admin/reports" className="block bg-blue-100 p-6 rounded shadow hover:bg-blue-200 transition">
            <h2 className="text-xl font-semibold mb-2">Reports & Moderation</h2>
            <p>Review reported content and moderate discussions.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
