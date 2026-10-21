/**
 * College Academic Management Service
 * Manages Departments, Classes, Subjects, Timetable, Enquiries, and College Settings.
 */

import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  getLocalCollection,
  setLocalCollection,
} from "./storeManager";

export const collegeService = {
  // --- Settings ---
  async getSettings() {
    const settings = await getDocuments("settings");
    return settings[0] || getLocalCollection("settings");
  },

  async updateSettings(data) {
    const current = await this.getSettings();
    if (current && current.id) {
      return await updateDocument("settings", current.id, data);
    } else {
      setLocalCollection("settings", data);
      return data;
    }
  },

  // --- Departments ---
  async getDepartments() {
    return await getDocuments("departments");
  },

  async createDepartment(dept) {
    return await addDocument("departments", dept);
  },

  async updateDepartment(id, updates) {
    return await updateDocument("departments", id, updates);
  },

  async deleteDepartment(id) {
    return await deleteDocument("departments", id);
  },

  // --- Classes ---
  async getClasses() {
    return await getDocuments("classes");
  },

  async createClass(cls) {
    return await addDocument("classes", cls);
  },

  async updateClass(id, updates) {
    return await updateDocument("classes", id, updates);
  },

  async deleteClass(id) {
    return await deleteDocument("classes", id);
  },

  // --- Subjects ---
  async getSubjects() {
    return await getDocuments("subjects");
  },

  async createSubject(subject) {
    return await addDocument("subjects", subject);
  },

  async updateSubject(id, updates) {
    return await updateDocument("subjects", id, updates);
  },

  async deleteSubject(id) {
    return await deleteDocument("subjects", id);
  },

  // --- Timetable & Conflict Detection ---
  async getTimetable(classId = null) {
    const list = await getDocuments("timetable");
    return classId ? list.filter((t) => t.classId === classId) : list;
  },

  async createTimetableEntry(entry) {
    // Conflict Detection: verify if teacher or classroom is double-booked
    const existing = await getDocuments("timetable");
    
    const teacherConflict = existing.find(
      (e) =>
        e.dayOfWeek === entry.dayOfWeek &&
        e.timeSlot === entry.timeSlot &&
        e.teacherId === entry.teacherId &&
        e.classId !== entry.classId
    );
    if (teacherConflict) {
      throw new Error(
        `Teacher Conflict: ${entry.teacherName || "Teacher"} is already scheduled for ${teacherConflict.subjectName} at ${entry.timeSlot} on ${entry.dayOfWeek}.`
      );
    }

    const roomConflict = existing.find(
      (e) =>
        e.dayOfWeek === entry.dayOfWeek &&
        e.timeSlot === entry.timeSlot &&
        e.roomNumber === entry.roomNumber &&
        e.classId !== entry.classId
    );
    if (roomConflict) {
      throw new Error(
        `Room Conflict: Room ${entry.roomNumber} is already occupied by ${roomConflict.subjectName} during ${entry.timeSlot}.`
      );
    }

    return await addDocument("timetable", entry);
  },

  async deleteTimetableEntry(id) {
    return await deleteDocument("timetable", id);
  },

  // --- Admission Enquiries ---
  async getEnquiries() {
    return await getDocuments("enquiries");
  },

  async submitEnquiry(enquiryData) {
    return await addDocument("enquiries", {
      ...enquiryData,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  },

  async updateEnquiryStatus(id, status) {
    return await updateDocument("enquiries", id, { status });
  },

  async deleteEnquiry(id) {
    return await deleteDocument("enquiries", id);
  },
};
