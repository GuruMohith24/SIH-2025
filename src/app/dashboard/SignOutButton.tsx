"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      onClick={() => signOut({ callbackUrl: "/login" })}
      type="button"
    >
      Sign Out
    </button>
  );
}
