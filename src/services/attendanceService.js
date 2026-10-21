/**
 * Attendance Service for CampusConnect
 * Real-time roll-call sessions, duplicate session protection, and dynamic attendance analytics.
 */

import {
  getDocuments,
  addDocument,
  updateDocument,
  subscribeToCollection,
} from "./storeManager";

export const attendanceService = {
  /**
   * Subscribe to attendance sessions for a class
   */
  subscribeSessions(classId, callback) {
    return subscribeToCollection("attendanceSessions", (items) => {
      const filtered = classId ? items.filter((s) => s.classId === classId) : items;
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      callback(filtered);
    });
  },

  async getSessions(classId = null) {
    const items = await getDocuments("attendanceSessions");
    const filtered = classId ? items.filter((s) => s.classId === classId) : items;
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getRecordsForSession(sessionId) {
    const records = await getDocuments("attendanceRecords");
    return records.filter((r) => r.sessionId === sessionId);
  },

  /**
   * Save an entire attendance session and individual student status records
   * Validates duplicate session prevention for same date, class, and subject
   */
  async recordAttendanceSession(sessionMetadata, studentRecords) {
    const { classId, subjectId, date, teacherId } = sessionMetadata;

    // Check duplicate session
    const existingSessions = await getDocuments("attendanceSessions");
    const duplicate = existingSessions.find(
      (s) => s.classId === classId && s.subjectId === subjectId && s.date === date
    );

    if (duplicate) {
      throw new Error(
        `Attendance for this class, subject, and date (${date}) has already been recorded.`
      );
    }

    let present = 0;
    let absent = 0;
    let late = 0;

    studentRecords.forEach((r) => {
      if (r.status === "present") present++;
      else if (r.status === "absent") absent++;
      else if (r.status === "late") late++;
    });

    // 1. Create Session Document
    const session = await addDocument("attendanceSessions", {
      ...sessionMetadata,
      totalStudents: studentRecords.length,
      presentCount: present,
      absentCount: absent,
      lateCount: late,
      createdAt: new Date().toISOString(),
    });

    // 2. Add Student Records
    for (const record of studentRecords) {
      await addDocument("attendanceRecords", {
        sessionId: session.id,
        classId,
        subjectId,
        subjectName: sessionMetadata.subjectName,
        teacherId,
        studentId: record.studentId,
        studentName: record.studentName,
        rollNumber: record.rollNumber,
        date,
        status: record.status, // 'present' | 'absent' | 'late'
        remarks: record.remarks || "",
      });
    }

    return session;
  },

  /**
   * Get attendance summary for a specific student across all subjects
   */
  async getStudentAttendanceAnalytics(studentId) {
    const allRecords = await getDocuments("attendanceRecords");
    const studentRecords = allRecords.filter((r) => r.studentId === studentId);

    // Group by subject
    const subjectMap = {};

    studentRecords.forEach((rec) => {
      const subId = rec.subjectId;
      if (!subjectMap[subId]) {
        subjectMap[subId] = {
          subjectId: subId,
          subjectName: rec.subjectName || "Subject",
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
        };
      }
      subjectMap[subId].total += 1;
      if (rec.status === "present") subjectMap[subId].present += 1;
      else if (rec.status === "absent") subjectMap[subId].absent += 1;
      else if (rec.status === "late") subjectMap[subId].late += 1;
    });

    const subjectBreakdown = Object.values(subjectMap).map((sub) => {
      // Treating late as 0.5 or present with flag; standard formula: (present + late) / total
      const effectivePresent = sub.present + sub.late;
      const percentage = sub.total > 0 ? Math.round((effectivePresent / sub.total) * 100) : 100;
      return {
        ...sub,
        percentage,
      };
    });

    const totalHeld = studentRecords.length;
    const totalAttended = studentRecords.filter((r) => r.status === "present" || r.status === "late").length;
    const totalAbsent = studentRecords.filter((r) => r.status === "absent").length;
    const overallPercentage = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 100;

    return {
      totalHeld,
      totalAttended,
      totalAbsent,
      overallPercentage,
      subjectBreakdown,
      history: studentRecords.sort((a, b) => new Date(b.date) - new Date(a.date)),
    };
  },
};
