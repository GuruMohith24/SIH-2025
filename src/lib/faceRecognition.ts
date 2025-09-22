import * as faceapi from 'face-api.js';
import Student from '@/models/student';

/**
 * Initialize face-api.js models
 */
export async function initializeFaceApi() {
  try {
    // Load necessary models for face detection and recognition
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]);
    return true;
  } catch (error) {
    console.error('Failed to initialize face-api models:', error);
    return false;
  }
}

/**
 * Encode a face from an image for a student
 * @param studentId - The student's ID
 * @param image - HTML image element containing the student's face
 */
export async function encodeStudentFace(studentId: string, image: HTMLImageElement) {
  try {
    // Ensure face-api is initialized
    const initialized = await initializeFaceApi();
    if (!initialized) {
      throw new Error('Face API initialization failed');
    }

    // Detect face and extract descriptor
    const detection = await faceapi.detectSingleFace(image, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error('No face detected in the image');
    }

    // Convert Float32Array to regular array for storage
    const faceDescriptor = Array.from(detection.descriptor);

    // Update student record with face descriptor
    const student = await Student.findByIdAndUpdate(
      studentId,
      { $push: { faceDescriptors: faceDescriptor } },
      { new: true }
    );

    if (!student) {
      throw new Error('Student not found');
    }

    return {
      success: true,
      message: 'Face encoded successfully',
      studentId: student._id
    };
  } catch (error) {
    console.error('Error encoding student face:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to encode face'
    };
  }
}

/**
 * Recognize students from a class photo
 * @param classId - The class ID
 * @param image - HTML image element or canvas with the class photo
 * @param distanceThreshold - Threshold for face matching (lower is stricter)
 */
export async function recognizeStudentsFromClassPhoto(
  classId: string,
  image: HTMLImageElement | HTMLCanvasElement,
  distanceThreshold = 0.6
) {
  try {
    // Ensure face-api is initialized
    const initialized = await initializeFaceApi();
    if (!initialized) {
      throw new Error('Face API initialization failed');
    }

    // Get all students in the class who have face descriptors
    const students = await Student.find({
      class: classId,
      faceDescriptors: { $exists: true, $ne: [] }
    });

    if (students.length === 0) {
      throw new Error('No students with face data found for this class');
    }

    // Detect all faces in the class photo
    const results = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    const recognizedStudents: string[] = [];

    // For each detected face, try to match with known students
    for (const detection of results) {
      let bestMatch: { studentId: string; distance: number } | null = null;

      for (const student of students) {
        // Compare with all face descriptors stored for the student
        for (const descriptor of student.faceDescriptors || []) {
          // Convert stored array back to Float32Array
          const faceDescriptor = new Float32Array(descriptor);
          
          // Calculate distance between face descriptors
          const distance = faceapi.euclideanDistance(detection.descriptor, faceDescriptor);

          // Update best match if this is closer than current best
          if ((!bestMatch || distance < bestMatch.distance) && distance < distanceThreshold) {
            bestMatch = { studentId: student._id.toString(), distance };
          }
        }
      }

      // If we found a good match, add the student ID
      if (bestMatch) {
        recognizedStudents.push(bestMatch.studentId);
      }
    }

    // Remove duplicates (in case a student was matched multiple times)
    const uniqueRecognizedStudents = [...new Set(recognizedStudents)];

    return {
      success: true,
      recognized: uniqueRecognizedStudents,
      totalDetectedFaces: results.length
    };
  } catch (error) {
    console.error('Error recognizing students from class photo:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to recognize students',
      recognized: [],
      totalDetectedFaces: 0
    };
  }
}