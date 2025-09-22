"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Student from "@/models/student";

//  Dynamically import Scanner (avoids SSR errors on Vercel)
const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false }
);

export default function QRFallbackPage() {
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [scannedStudent, setScannedStudent] = useState<{
    id: string;
    name: string;
    class: string;
    rollNumber: number;
  } | null>(null);
  const [attendanceMarked, setAttendanceMarked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState<boolean>(true);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // Available classes and subjects
  const classes = ["CSE-3A", "CSE-3B", "ECE-2A"];
  const subjects = ["DSA", "Operating Systems", "DBMS"];

  // Reset attendance marked state after a delay
  useEffect(() => {
    if (attendanceMarked) {
      const timer = setTimeout(() => {
        setAttendanceMarked(false);
        setScannedStudent(null);
        setScannerActive(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [attendanceMarked]);

  // Handle QR code scan
  const handleScan = async (result: string) => {
    if (!result || !scannerActive || !selectedClass || !selectedSubject) return;

    try {
      setScannerActive(false);
      setError(null);
      setLastResult(result);

      // Find student by QR code ID
      const student = await Student.findOne({ qrCodeId: result });

      if (!student) {
        throw new Error("No student found with this QR code");
      }

      if (student.class !== selectedClass) {
        throw new Error(
          `Student ${student.name} (Roll ${student.rollNumber}) is not in class ${selectedClass}`
        );
      }

      setScannedStudent({
        id: student._id.toString(),
        name: student.name,
        class: student.class,
        rollNumber: student.rollNumber,
      });

      // Mark attendance via API
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          subject: selectedSubject,
          studentIds: [student._id.toString()],
          type: "qr_code",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to mark attendance");
      }

      // Broadcast attendance event
      const bc = new BroadcastChannel("attendance-events");
      bc.postMessage({
        classId: selectedClass,
        subject: selectedSubject,
        present: [student._id.toString()],
        at: Date.now(),
        attendanceId: data.attendanceId,
      });
      bc.close();

      setAttendanceMarked(true);
    } catch (err) {
      console.error("Error processing QR scan:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process QR code"
      );
      setScannerActive(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">QR Code Attendance</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Class</label>
          <select
            className="w-full border rounded-md p-2"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select class</option>
            {classes.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
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
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}

      {attendanceMarked && scannedStudent && (
        <div className="p-3 bg-green-50 text-green-700 rounded-md">
          <p>Attendance marked for:</p>
          <p className="font-medium">
            {scannedStudent.name} (Roll: {scannedStudent.rollNumber})
          </p>
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
        <Scanner
          onDecode={handleScan}
          onError={(err) => {
            console.error("QR scanner error:", err);
            setError(
              "QR scanner error: Please ensure camera permissions are granted"
            );
          }}
          constraints={{ facingMode: "environment" }}
          containerStyle={{ width: "100%" }}
        />
      </div>

      {scannedStudent && (
        <div className="p-3 bg-blue-50 rounded-md">
          <h3 className="font-medium">Scanned Student</h3>
          <p>Name: {scannedStudent.name}</p>
          <p>Class: {scannedStudent.class}</p>
          <p>Roll Number: {scannedStudent.rollNumber}</p>
        </div>
      )}

      <div className="text-sm text-gray-600">
        Last scan: {lastResult ?? "—"}
      </div>
      <div className="text-xs text-gray-500">
        {scannerActive ? "Scanner active" : "Processing scan..."}
      </div>
    </div>
  );
}


