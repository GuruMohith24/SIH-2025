"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AttendanceSessionPage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const startSession = () => {
    if (!selectedClass || !selectedSubject) return;
    setIsLoading(true);
    const params = new URLSearchParams({
      classId: selectedClass,
      subject: selectedSubject
    });
    router.push(`/admin/attendance/capture?${params.toString()}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Start Attendance Session</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Class</label>
        <select
          className="w-full border rounded-md p-2"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select class</option>
          <option value="CSE-3A">CSE-3A</option>
          <option value="CSE-3B">CSE-3B</option>
          <option value="ECE-2A">ECE-2A</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Subject</label>
        <select
          className="w-full border rounded-md p-2"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">Select subject</option>
          <option value="DSA">DSA</option>
          <option value="OS">Operating Systems</option>
          <option value="DBMS">DBMS</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={startSession}
          disabled={!selectedClass || !selectedSubject || isLoading}
        >
          {isLoading ? "Starting..." : "Start with Class Photo"}
        </button>
        <button
          className="border px-4 py-2 rounded-md hover:bg-gray-50"
          onClick={() => router.push("/admin/attendance/qr")}
        >
          Open QR Fallback
        </button>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">Quick Tips:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Ensure good lighting for face recognition</li>
          <li>• Students should face the camera clearly</li>
          <li>• Use QR fallback for students not recognized</li>
        </ul>
      </div>
    </div>
  );
}



