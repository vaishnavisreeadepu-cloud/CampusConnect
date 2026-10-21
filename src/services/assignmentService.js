/**
 * Assignment & Submission Service for CampusConnect
 * Real-time coursework, assignment delivery, student submission, and grading workflow.
 */

import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  uploadFileToStorage,
} from "./storeManager";

export const assignmentService = {
  /**
   * Subscribe to assignments for a class
   */
  subscribeAssignments(classId, callback) {
    return subscribeToCollection("assignments", (items) => {
      const filtered = classId ? items.filter((a) => a.classId === classId) : items;
      filtered.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
      callback(filtered);
    });
  },

  async getAssignments(classId = null) {
    const items = await getDocuments("assignments");
    const filtered = classId ? items.filter((a) => a.classId === classId) : items;
    return filtered.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  },

  async createAssignment(data, attachmentFile = null) {
    let attachment = null;
    if (attachmentFile instanceof File) {
      attachment = await uploadFileToStorage("assignments", attachmentFile);
    }

    return await addDocument("assignments", {
      ...data,
      fileUrl: attachment ? attachment.url : (data.fileUrl || null),
      fileName: attachment ? attachment.name : (data.fileName || null),
      status: data.status || "published",
      createdAt: new Date().toISOString(),
    });
  },

  async deleteAssignment(id) {
    return await deleteDocument("assignments", id);
  },

  // --- Submissions ---
  subscribeSubmissions(assignmentId, callback) {
    return subscribeToCollection("submissions", (items) => {
      const filtered = assignmentId ? items.filter((s) => s.assignmentId === assignmentId) : items;
      callback(filtered);
    });
  },

  async getSubmissionsForAssignment(assignmentId) {
    const items = await getDocuments("submissions");
    return items.filter((s) => s.assignmentId === assignmentId);
  },

  async getStudentSubmissions(studentId) {
    const items = await getDocuments("submissions");
    return items.filter((s) => s.studentId === studentId);
  },

  /**
   * Student submits work
   */
  async submitAssignment(assignmentId, student, textContent, file = null) {
    // Check if already submitted
    const existing = await this.getSubmissionsForAssignment(assignmentId);
    const prev = existing.find((s) => s.studentId === student.uid || s.studentId === student.id);

    let fileInfo = null;
    if (file instanceof File) {
      fileInfo = await uploadFileToStorage(`submissions/${assignmentId}`, file);
    }

    const assignments = await getDocuments("assignments");
    const assignment = assignments.find((a) => a.id === assignmentId);
    const isLate = assignment && new Date() > new Date(assignment.dueDate);

    const submissionData = {
      assignmentId,
      studentId: student.uid || student.id,
      studentName: student.fullName,
      studentRoll: student.rollNumber || "N/A",
      classId: student.classId,
      textContent: textContent || "",
      fileUrl: fileInfo ? fileInfo.url : (prev?.fileUrl || null),
      fileName: fileInfo ? fileInfo.name : (prev?.fileName || null),
      submittedAt: new Date().toISOString(),
      status: isLate ? "late" : "submitted",
    };

    if (prev) {
      return await updateDocument("submissions", prev.id, submissionData);
    } else {
      return await addDocument("submissions", submissionData);
    }
  },

  /**
   * Teacher grades submission
   */
  async gradeSubmission(submissionId, marks, feedback, teacherId) {
    const updates = {
      marksAwarded: Number(marks),
      feedback: feedback || "No written remarks.",
      gradedBy: teacherId,
      status: "graded",
      gradedAt: new Date().toISOString(),
    };
    return await updateDocument("submissions", submissionId, updates);
  },
};
