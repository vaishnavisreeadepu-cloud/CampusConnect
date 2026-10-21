/**
 * StoreManager - Resilient Data Layer for CampusConnect
 * Supports live Firebase Firestore/Auth/Storage when configured,
 * and seamlessly provides full local reactive persistence with real-time events.
 */

import {
  auth,
  db,
  storage,
  isLiveFirebaseConfigured,
} from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import {
  INITIAL_COLLEGE_SETTINGS,
  INITIAL_DEPARTMENTS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_USERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_MATERIALS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_ATTENDANCE_SESSIONS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_TIMETABLE,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_ENQUIRIES,
  INITIAL_NOTIFICATIONS,
} from "./seedData";

const STORAGE_KEY_PREFIX = "campusconnect_";

// Helper to get or initialize collection in localStorage
function getLocalCollection(name, initialData = []) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + name);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PREFIX + name, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Local storage read error for", name, err);
    return initialData;
  }
}

function setLocalCollection(name, items) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + name, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(`campusconnect_${name}_updated`, { detail: items }));
  } catch (err) {
    console.error("Local storage write error for", name, err);
  }
}

// Initial bootstrap of localStorage store
export function initLocalStore() {
  getLocalCollection("settings", INITIAL_COLLEGE_SETTINGS);
  getLocalCollection("departments", INITIAL_DEPARTMENTS);
  getLocalCollection("classes", INITIAL_CLASSES);
  getLocalCollection("subjects", INITIAL_SUBJECTS);
  getLocalCollection("users", INITIAL_USERS);
  getLocalCollection("announcements", INITIAL_ANNOUNCEMENTS);
  getLocalCollection("materials", INITIAL_MATERIALS);
  getLocalCollection("assignments", INITIAL_ASSIGNMENTS);
  getLocalCollection("submissions", INITIAL_SUBMISSIONS);
  getLocalCollection("attendanceSessions", INITIAL_ATTENDANCE_SESSIONS);
  getLocalCollection("attendanceRecords", INITIAL_ATTENDANCE_RECORDS);
  getLocalCollection("timetable", INITIAL_TIMETABLE);
  getLocalCollection("conversations", INITIAL_CONVERSATIONS);
  getLocalCollection("messages", INITIAL_MESSAGES);
  getLocalCollection("enquiries", INITIAL_ENQUIRIES);
  getLocalCollection("notifications", INITIAL_NOTIFICATIONS);
}

// Subscribe to collection changes (emulates Firestore onSnapshot or uses live onSnapshot)
export function subscribeToCollection(collectionName, callback, filterFn = null) {
  if (isLiveFirebaseConfigured) {
    try {
      const colRef = collection(db, collectionName);
      return onSnapshot(colRef, (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(filterFn ? items.filter(filterFn) : items);
      }, (err) => {
        console.warn(`Firestore onSnapshot fallback for ${collectionName}:`, err.message);
        // Fall back to local store on permission/index error
        const items = getLocalCollection(collectionName);
        callback(filterFn ? items.filter(filterFn) : items);
      });
    } catch (e) {
      console.warn("Using local subscription for:", collectionName);
    }
  }

  // Local event-driven subscription
  const updateHandler = () => {
    const items = getLocalCollection(collectionName);
    callback(filterFn ? items.filter(filterFn) : items);
  };

  // Initial call
  updateHandler();

  const eventName = `campusconnect_${collectionName}_updated`;
  window.addEventListener(eventName, updateHandler);

  return () => {
    window.removeEventListener(eventName, updateHandler);
  };
}

// Generic CRUD operations
export async function getDocuments(collectionName, filterFn = null) {
  if (isLiveFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, collectionName));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return filterFn ? items.filter(filterFn) : items;
    } catch (err) {
      console.warn(`Firestore read failed for ${collectionName}, reading local:`, err.message);
    }
  }
  const items = getLocalCollection(collectionName);
  return filterFn ? items.filter(filterFn) : items;
}

export async function addDocument(collectionName, data) {
  const newId = data.id || `${collectionName.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const record = {
    ...data,
    id: newId,
    createdAt: data.createdAt || new Date().toISOString(),
  };

  if (isLiveFirebaseConfigured) {
    try {
      await setDoc(doc(db, collectionName, newId), {
        ...record,
        serverTimestamp: serverTimestamp(),
      });
    } catch (err) {
      console.warn(`Firestore write fallback for ${collectionName}:`, err.message);
    }
  }

  const items = getLocalCollection(collectionName);
  items.unshift(record);
  setLocalCollection(collectionName, items);
  return record;
}

export async function updateDocument(collectionName, id, updates) {
  if (isLiveFirebaseConfigured) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    } catch (err) {
      console.warn(`Firestore update fallback for ${collectionName}:`, err.message);
    }
  }

  const items = getLocalCollection(collectionName);
  const index = items.findIndex((i) => i.id === id || i.uid === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    setLocalCollection(collectionName, items);
    return items[index];
  }
  return null;
}

export async function deleteDocument(collectionName, id) {
  if (isLiveFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      console.warn(`Firestore delete fallback for ${collectionName}:`, err.message);
    }
  }

  const items = getLocalCollection(collectionName);
  const filtered = items.filter((i) => i.id !== id && i.uid !== id);
  setLocalCollection(collectionName, filtered);
  return true;
}

// File Storage upload helper
export async function uploadFileToStorage(path, file) {
  if (isLiveFirebaseConfigured && file instanceof File) {
    try {
      const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return {
        url: downloadUrl,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type,
      };
    } catch (err) {
      console.warn("Firebase storage upload notice, using object URL:", err.message);
    }
  }

  // Mock / preview file upload
  return {
    url: file instanceof File ? URL.createObjectURL(file) : "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    name: file?.name || "course_document.pdf",
    size: file?.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "1.8 MB",
    type: file?.type || "application/pdf",
  };
}

export {
  auth,
  db,
  storage,
  getLocalCollection,
  setLocalCollection,
};
