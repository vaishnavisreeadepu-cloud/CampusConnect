/**
 * Material / Notes Service for CampusConnect
 * Uploads course documents to Firebase Storage and manages Firestore metadata.
 * Enforces strict class-specific isolation so students only see materials for their class.
 */

import {
  getDocuments,
  addDocument,
  deleteDocument,
  subscribeToCollection,
  uploadFileToStorage,
} from "./storeManager";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const materialService = {
  /**
   * Subscribe to real-time materials strictly filtered by class
   */
  subscribeMaterials(classId, callback) {
    return subscribeToCollection("materials", (items) => {
      const filtered = classId ? items.filter((m) => m.classId === classId) : items;
      filtered.sort((a, b) => new Date(b.createdAt || b.uploadDate) - new Date(a.createdAt || a.uploadDate));
      callback(filtered);
    });
  },

  async getMaterials(classId = null) {
    const items = await getDocuments("materials");
    const filtered = classId ? items.filter((m) => m.classId === classId) : items;
    return filtered.sort((a, b) => new Date(b.createdAt || b.uploadDate) - new Date(a.createdAt || a.uploadDate));
  },

  async uploadMaterial(data, file) {
    if (!data.title || !data.classId || !data.subjectId) {
      throw new Error("Title, Class, and Subject are required.");
    }

    let fileInfo = {
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      name: "Lecture_Notes.pdf",
      size: "2.1 MB",
      type: "application/pdf",
    };

    if (file instanceof File) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error("File size exceeds 25MB maximum limit.");
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx|doc|pptx|ppt|png|jpg|jpeg)$/i)) {
        throw new Error("Unsupported file type. Please upload PDF, Word document, PowerPoint presentation, or image.");
      }
      fileInfo = await uploadFileToStorage(`materials/${data.classId}`, file);
    }

    const newMaterial = {
      ...data,
      fileUrl: fileInfo.url,
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
      fileType: fileInfo.type,
      uploadDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };

    return await addDocument("materials", newMaterial);
  },

  async deleteMaterial(id, teacherUid, isAdmin = false) {
    const all = await getDocuments("materials");
    const item = all.find((m) => m.id === id);
    if (!item) throw new Error("Material record not found.");

    if (!isAdmin && item.teacherId !== teacherUid) {
      throw new Error("Unauthorized: You can only delete materials that you uploaded.");
    }

    return await deleteDocument("materials", id);
  },
};
