"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { recognizeStudentsFromClassPhoto } from "@/lib/faceRecognition";
import Student from "@/models/student";

export default function CapturePage() {
  const params = useSearchParams();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [presentIds, setPresentIds] = useState<string[]>([]);
  const [recognizedStudents, setRecognizedStudents] = useState<Array<{ _id: string; name: string; rollNumber: number }>>([]);
  const [detectionStats, setDetectionStats] = useState<{ detected: number; recognized: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (err) {
        setReady(false);
        setCameraError("Could not access camera. Please ensure camera permissions are granted.");
        console.error("Camera access error:", err);
      }
    })();
    return () => {
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks();
      tracks?.forEach((t) => t.stop());
    };
  }, []);

  const takeSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current || !classId || !subject) return;
    
    setError(null);
    setProcessing(true);
    setPresentIds([]);
    setRecognizedStudents([]);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not access canvas context");
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to base64 for API
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Call face recognition API
      const recognitionResponse = await fetch('/api/faces/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          imageData
        })
      });
      
      const recognitionData = await recognitionResponse.json();
      
      if (!recognitionResponse.ok) {
        throw new Error(recognitionData.error || "Face recognition failed");
      }
      
      // Store recognized student IDs
      setPresentIds(recognitionData.recognized);
      setDetectionStats({
        detected: recognitionData.totalDetectedFaces,
        recognized: recognitionData.recognized.length
      });
      
      // Set recognized students
      setRecognizedStudents(recognitionData.students || []);
      
      // Mark attendance using the new API
      const attendanceResponse = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          subject,
          studentIds: recognitionData.recognized,
          method: 'face_recognition',
          markedBy: 'teacher' // This should come from session
        })
      });
      
      const attendanceData = await attendanceResponse.json();
      if (!attendanceResponse.ok) {
        throw new Error(attendanceData.error || "Failed to save attendance");
      }
      
      // Publish to dashboard via BroadcastChannel
      const bc = new BroadcastChannel("attendance-events");
      bc.postMessage({ 
        classId, 
        subject, 
        present: result.recognized, 
        at: Date.now(),
        attendanceId: data.attendanceId
      });
      bc.close();
      
    } catch (err) {
      console.error('Error during attendance capture:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during attendance capture');
    } finally {
      setProcessing(false);
    }
  };

  const classId = params.get("classId") || "";
  const subject = params.get("subject") || "";

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Class Photo Capture</h1>
      <div className="text-sm text-gray-600">{classId} · {subject}</div>

      {cameraError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">
          {cameraError}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 items-start">
        <div className="aspect-video bg-black rounded overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        </div>
        <div className="aspect-video bg-gray-50 rounded overflow-hidden border">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </div>

      {detectionStats && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-md">
          <p>Faces detected: {detectionStats.detected}</p>
          <p>Students recognized: {detectionStats.recognized}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button 
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md disabled:opacity-50" 
          onClick={takeSnapshot} 
          disabled={!ready || processing}
        >
          {processing ? "Processing…" : "Capture Photo"}
        </button>
        <button 
          className="border px-4 py-2 rounded-md" 
          onClick={() => window.location.href = "/admin/attendance/qr"}
        >
          Open QR Fallback
        </button>
      </div>

      {!!recognizedStudents.length && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Recognized Students</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {recognizedStudents.map((student) => (
              <div key={student._id} className="p-2 bg-gray-100 rounded">
                <div className="font-medium">{student.name}</div>
                <div className="text-sm text-gray-600">Roll: {student.rollNumber}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


