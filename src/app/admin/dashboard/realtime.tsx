'use client';

import { useEffect, useState } from "react";

type AttendanceEvent = {
  classId: string;
  subject: string;
  present: string[]; // studentIds
  at: number;
};

export default function RealtimeDashboard() {
  const [lastEvent, setLastEvent] = useState<AttendanceEvent | null>(null);

  useEffect(() => {
    const bc = new BroadcastChannel("attendance-events");
    const onMsg = (ev: MessageEvent<AttendanceEvent>) => {
      setLastEvent(ev.data);
    };
    bc.addEventListener("message", onMsg);
    return () => {
      bc.removeEventListener("message", onMsg);
      bc.close();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Real-time Classroom Dashboard</h1>
      {!lastEvent ? (
        <div className="text-gray-600">Waiting for an attendance session to publish results… Open the capture page and take a photo.</div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-700">{lastEvent.classId} · {lastEvent.subject} · {new Date(lastEvent.at).toLocaleTimeString()}</div>
          <div className="border rounded-md">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2">#</th>
                  <th className="p-2">Student ID</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {lastEvent.present.map((id, idx) => (
                  <tr key={id} className="border-b last:border-0">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{id}</td>
                    <td className="p-2 text-green-700">Present</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-sm text-gray-600">Marked present: {lastEvent.present.length}</div>
        </div>
      )}
    </div>
  );
}