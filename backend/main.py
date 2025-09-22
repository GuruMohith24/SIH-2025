from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
import sqlite3
import face_recognition
import numpy as np
import cv2
import qrcode
import io
from datetime import date

app = FastAPI()

# ---------- Database Setup ----------
def init_db():
    conn = sqlite3.connect("attendance.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    roll_no TEXT,
                    face_encoding BLOB,
                    qr_code TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS attendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER,
                    date TEXT,
                    status TEXT,
                    FOREIGN KEY(student_id) REFERENCES students(id))''')
    conn.commit()
    conn.close()

init_db()

# ---------- Register Student ----------
@app.post("/register_student/")
async def register_student(name: str = Form(...), roll_no: str = Form(...), file: UploadFile = None):
    image = face_recognition.load_image_file(file.file)
    encodings = face_recognition.face_encodings(image)

    if len(encodings) == 0:
        return JSONResponse(content={"error": "No face detected"}, status_code=400)

    encoding = encodings[0].tobytes()

    # Generate QR Code
    qr_img = qrcode.make(roll_no)
    buf = io.BytesIO()
    qr_img.save(buf, format="PNG")
    qr_code_data = buf.getvalue()

    conn = sqlite3.connect("attendance.db")
    c = conn.cursor()
    c.execute("INSERT INTO students (name, roll_no, face_encoding, qr_code) VALUES (?, ?, ?, ?)",
              (name, roll_no, encoding, qr_code_data))
    conn.commit()
    conn.close()

    return {"message": f"Student {name} registered successfully"}

# ---------- Face Recognition Attendance ----------
@app.post("/attendance/face/")
async def mark_attendance_face(file: UploadFile):
    image = face_recognition.load_image_file(file.file)
    unknown_encodings = face_recognition.face_encodings(image)

    conn = sqlite3.connect("attendance.db")
    c = conn.cursor()
    c.execute("SELECT id, name, face_encoding FROM students")
    students = c.fetchall()

    present_students = []
    for student_id, name, enc in students:
        known_encoding = np.frombuffer(enc, dtype=np.float64)

        for unknown in unknown_encodings:
            result = face_recognition.compare_faces([known_encoding], unknown)
            if result[0]:
                today = str(date.today())
                c.execute("INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)",
                          (student_id, today, "Present"))
                present_students.append(name)
                break

    conn.commit()
    conn.close()
    return {"present_students": present_students}

# ---------- QR Code Attendance ----------
@app.post("/attendance/qr/")
async def mark_attendance_qr(roll_no: str = Form(...)):
    conn = sqlite3.connect("attendance.db")
    c = conn.cursor()
    c.execute("SELECT id FROM students WHERE roll_no=?", (roll_no,))
    student = c.fetchone()

    if student:
        student_id = student[0]
        today = str(date.today())
        c.execute("INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)",
                  (student_id, today, "Present"))
        conn.commit()
        conn.close()
        return {"message": f"Attendance marked for {roll_no}"}
    else:
        return JSONResponse(content={"error": "Student not found"}, status_code=404)
