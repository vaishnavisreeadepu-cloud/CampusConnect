/**
 * Announcement Service for CampusConnect
 * Real-time audience-targeted announcements with attachments and priorities
 */

import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  uploadFileToStorage,
} from "./storeManager";

export const announcementService = {
  /**
   * Subscribe to real-time announcements filtered by user audience
   */
  subscribeAnnouncements(currentUser, callback) {
    return subscribeToCollection("announcements", (items) => {
      // Sort by createdAt descending
      const sorted = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (!currentUser) {
        // Public sees only 'all' announcements
        callback(sorted.filter((a) => a.audience === "all"));
        return;
      }

      if (currentUser.role === "admin") {
        // Admins can see all announcements
        callback(sorted);
        return;
      }

      // Filter by audience
      const filtered = sorted.filter((a) => {
        if (a.audience === "all") return true;
        if (currentUser.role === "teacher" && a.audience === "teachers") return true;
        if (currentUser.role === "student" && a.audience === "students") return true;
        if (a.audience === currentUser.departmentId) return true;
        if (currentUser.role === "student" && a.audience === currentUser.classId) return true;
        if (currentUser.role === "teacher" && currentUser.assignedClasses?.includes(a.audience)) return true;
        return false;
      });

      callback(filtered);
    });
  },

  async getAnnouncements(currentUser = null) {
    const items = await getDocuments("announcements");
    const sorted = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (!currentUser) return sorted.filter((a) => a.audience === "all");
    if (currentUser.role === "admin") return sorted;

    return sorted.filter((a) => {
      if (a.audience === "all") return true;
      if (currentUser.role === "teacher" && a.audience === "teachers") return true;
      if (currentUser.role === "student" && a.audience === "students") return true;
      if (a.audience === currentUser.departmentId) return true;
      if (currentUser.role === "student" && a.audience === currentUser.classId) return true;
      if (currentUser.role === "teacher" && currentUser.assignedClasses?.includes(a.audience)) return true;
      return false;
    });
  },

  async createAnnouncement(data, attachmentFile = null) {
    let attachment = null;
    if (attachmentFile) {
      attachment = await uploadFileToStorage("announcements", attachmentFile);
    }

    return await addDocument("announcements", {
      ...data,
      attachmentUrl: attachment ? attachment.url : (data.attachmentUrl || null),
      attachmentName: attachment ? attachment.name : (data.attachmentName || null),
      createdAt: new Date().toISOString(),
    });
  },

  async updateAnnouncement(id, updates) {
    return await updateDocument("announcements", id, updates);
  },

  async deleteAnnouncement(id) {
    return await deleteDocument("announcements", id);
  },
};
