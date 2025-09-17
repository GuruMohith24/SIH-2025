import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

async function fetchUsers() {
  const res = await fetch("/api/admin/users", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user && (session.user as any).role !== "admin")) {
    redirect("/login");
  }

  // Fetch users from API
  let users: any[] = [];
  try {
    users = await fetchUsers();
  } catch (e) {
    // fallback: show empty
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-blue-800">User Management</h1>
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b">
                <td className="p-2">{user.name || "-"}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2 capitalize">{user.role}</td>
                <td className="p-2 flex gap-2">
                  {/* Ban/Remove/Promote actions will be implemented later */}
                  <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs">Ban</button>
                  <button className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs">Remove</button>
                  {user.role !== "admin" && (
                    <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">Promote</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
