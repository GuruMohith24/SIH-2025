// src/app/dashboard/page.tsx

// We don't even need 'force-dynamic' anymore if we do this
import { headers } from "next/headers"; // <-- IMPORT THE HEADERS FUNCTION
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SignOutButton from "./SignOutButton";

export default async function DashboardPage() {
  // --- THE NEW FIX ---
  // By calling a dynamic function like headers(), we are telling Next.js
  // that this page MUST be re-rendered fresh on every single request.
  // This prevents any server-side caching of the page's output.
  headers();
  // --------------------

  const session = await getServerSession(authOptions);
  
  // You can keep this log for debugging
  console.log("--- FINAL SERVER SESSION CHECK ---", session?.user?.email);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
      <p className="mt-4 text-xl">
        Hello, <span className="font-semibold">{session.user?.name || session.user?.email}</span>!
      </p>

      {/* ... the rest of your JSX ... */}
      <div className="mt-8 rounded-md bg-gray-100 p-4">
        <h2 className="text-lg font-semibold">Your Session Details:</h2>
        <pre className="mt-2 overflow-x-auto rounded bg-gray-200 p-2 text-sm">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
      
      <SignOutButton />
    </div>
  );
}