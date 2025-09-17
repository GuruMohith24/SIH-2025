
'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

interface IStudent {
  _id: string;
  name: string;
  class: string;
  rollNumber: number;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<IStudent[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">All Students</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {students.map((student) => (
          <div key={student._id} className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">{student.name}</h2>
            <p className="text-gray-700 mb-2">Class: {student.class}</p>
            <p className="text-gray-700 mb-4">Roll No: {student.rollNumber}</p>
            <div style={{ background: 'white', padding: '16px' }}>
              <QRCode value={student._id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
