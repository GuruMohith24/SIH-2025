"use client";

import { useEffect, useRef, useState } from "react";
import { encodeStudentFace } from "@/lib/faceRecognition";
import Student from "@/models/student";
import { QRCode } from "react-qr-code";

export default function EnrollmentPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{
    name: string;
    class: string;
    rollNumber: string;
  }>({ name: "", class: "", rollNumber: "" });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeId, setQrCodeId] = useState<string | null>(null);

  // Available classes
  const classes = ["CSE-3A", "CSE-3B", "ECE-2A"];

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError("Could not access camera. Please ensure camera permissions are granted.");
      }
    })();
    return () => {
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks();
      tracks?.forEach((t) => t.stop());
    };
  }, []);

  // Create student if not exists
  const createStudentIfNotExists = async () => {
    try {
      const { name, class: className, rollNumber } = studentInfo;
      
      // Validate input
      if (!name || !className || !rollNumber) {
        throw new Error("Please fill in all student details");
      }

      // Check if student exists
      let student = await Student.findOne({ rollNumber: parseInt(rollNumber) });
      
      if (!student) {
        // Create new student
        student = new Student({
          name,
          class: className,
          rollNumber: parseInt(rollNumber)
        });
        await student.save();
      }

      return student._id.toString();
    } catch (err) {
      throw err;
    }
  };

  // Capture image from webcam
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to image data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);
  };

  // Enroll student face
  const enrollStudentFace = async () => {
    if (!capturedImage || !studentId) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      // Create image element from captured image
      const img = new Image();
      img.src = capturedImage;
      
      // Wait for image to load
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load captured image"));
      });
      
      // Upload face data to backend
      const response = await fetch('/api/faces/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          imageData: capturedImage
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to upload face data");
      }
      
      setSuccess(true);
    } catch (err) {
      console.error('Error enrolling student face:', err);
      setError(err instanceof Error ? err.message : 'Failed to enroll student face');
    } finally {
      setProcessing(false);
    }
  };

  // Generate QR code for student
  const generateQRCode = async () => {
    if (!studentId) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/students/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR code');
      }
      
      setQrCodeId(data.qrCodeId);
      setShowQRCode(true);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setProcessing(false);
    }
  };

  // Handle enrollment process
  const handleEnrollment = async () => {
    setError(null);
    setSuccess(false);
    
    try {
      // Create student if not exists
      const id = await createStudentIfNotExists();
      setStudentId(id);
      
      // Capture image
      captureImage();
    } catch (err) {
      console.error('Error during enrollment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process enrollment');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Student Enrollment</h1>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-50 text-green-700 rounded-md">
          Student face enrolled successfully!
        </div>
      )}

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Student Name</label>
            <input 
              className="border rounded-md p-2 w-full"
              value={studentInfo.name}
              onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
              placeholder="Enter student name"
              disabled={studentId}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Roll Number</label>
            <input 
              type="number"
              className="border rounded-md p-2 w-full"
              value={studentInfo.rollNumber}
              onChange={(e) => setStudentInfo({...studentInfo, rollNumber: e.target.value})}
              placeholder="Enter roll number"
              disabled={studentId}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Class</label>
          <select
            className="border rounded-md p-2 w-full"
            value={studentInfo.class}
            onChange={(e) => setStudentInfo({...studentInfo, class: e.target.value})}
            disabled={studentId}
          >
            <option value="">Select class</option>
            {classes.map((className) => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {!capturedImage ? (
          <>
            <div className="aspect-video bg-black rounded overflow-hidden relative">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <canvas ref={canvasRef} className="absolute inset-0 hidden" />
            </div>
            <button 
              className="w-full bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              disabled={!ready || !studentInfo.name || !studentInfo.class || !studentInfo.rollNumber}
              onClick={handleEnrollment}
            >
              Start Enrollment
            </button>
          </>
        ) : (
          <>
            <div className="aspect-video bg-gray-100 rounded overflow-hidden">
              <img src={capturedImage} alt="Captured student face" className="w-full h-full object-cover" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <button 
                className="w-full bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                disabled={processing}
                onClick={enrollStudentFace}
              >
                {processing ? "Processing..." : "Enroll Face"}
              </button>
              <button 
                className="w-full border px-4 py-2 rounded-md disabled:opacity-50"
                onClick={() => {
                  setCapturedImage(null);
                  setStudentId(null);
                  setShowQRCode(false);
                  setQrCodeId(null);
                }}
              >
                Retry
              </button>
            </div>
          </>
        )}
      </div>

      {success && !showQRCode && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Additional Options</h2>
          <button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            disabled={processing}
            onClick={generateQRCode}
          >
            {processing ? "Generating..." : "Generate QR Code"}
          </button>
        </div>
      )}

      {showQRCode && qrCodeId && (
        <div className="space-y-4 p-6 bg-gray-50 rounded-lg text-center">
          <h2 className="text-lg font-semibold">Student QR Code</h2>
          <div className="flex justify-center">
            <QRCode value={qrCodeId} size={200} />
          </div>
          <p className="text-sm text-gray-600">
            Print this QR code for the student to use for attendance
          </p>
          <button 
            className="w-full border px-4 py-2 rounded-md"
            onClick={() => {
              setShowQRCode(false);
              setCapturedImage(null);
              setStudentId(null);
              setQrCodeId(null);
            }}
          >
            Enroll Another Student
          </button>
        </div>
      )}
    </div>
  );
}



