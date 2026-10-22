/**
 * Authentication Service for CampusConnect
 * Supports Firebase Auth and role-based user profiles
 */

import { auth, db, isLiveFirebaseConfigured } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  getLocalCollection,
} from "./storeManager";

const CURRENT_USER_KEY = "campusconnect_active_session";

export const authService = {
  /**
   * Log in / Sign up user with Google directly
   */
  async loginWithGoogle(intendedRole = "student", extraData = {}) {
    if (isLiveFirebaseConfigured) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        const cleanEmail = fbUser.email.toLowerCase();

        // 1. Check if user profile already exists
        const allUsers = await getDocuments("users");
        let profile = allUsers.find(
          (u) => u.uid === fbUser.uid || u.email?.toLowerCase() === cleanEmail
        );

        if (!profile) {
          // Provision user profile on first Google sign-in
          profile = {
            uid: fbUser.uid,
            id: fbUser.uid,
            email: fbUser.email,
            fullName: fbUser.displayName || fbUser.email.split("@")[0],
            role: intendedRole,
            avatar: fbUser.photoURL || null,
            phone: extraData.phone || "",
            active: true,
            createdAt: new Date().toISOString(),
          };

          if (intendedRole === "student") {
            profile.studentId = extraData.studentId || `STU-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
            profile.rollNumber = extraData.rollNumber || `${Math.floor(100 + Math.random() * 900)}`;
            profile.classId = extraData.classId || "cse-y2-a";
            profile.className = extraData.className || "B.Tech CSE - 2nd Year (Section A)";
            profile.departmentId = extraData.departmentId || "dept-cse";
            profile.year = extraData.year || "2nd Year";
            profile.semester = extraData.semester || "4th Semester";
            profile.section = extraData.section || "A";
            profile.enrollmentYear = `${new Date().getFullYear()}`;
          } else if (intendedRole === "teacher") {
            profile.employeeId = extraData.employeeId || `FAC-${Date.now().toString().slice(-3)}`;
            profile.designation = extraData.designation || "Assistant Professor";
            profile.departmentId = extraData.departmentId || "dept-cse";
            profile.assignedClasses = extraData.assignedClasses || ["cse-y2-a"];
            profile.assignedSubjects = extraData.assignedSubjects || ["sub-dsa"];
          }

          await addDocument("users", profile);
        }

        if (profile.active === false) {
          throw new Error("This account has been deactivated. Please contact the administrator.");
        }

        const sessionUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          ...profile,
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
        window.dispatchEvent(new CustomEvent("campusconnect_auth_changed", { detail: sessionUser }));
        return sessionUser;
      } catch (err) {
        console.error("Google sign-in notice:", err.message);
        throw err;
      }
    }

    // Local / fallback demo mock for Google login
    const allUsers = getLocalCollection("users");
    const demoUser = allUsers.find((u) => u.role === intendedRole) || allUsers[0];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoUser));
    window.dispatchEvent(new CustomEvent("campusconnect_auth_changed", { detail: demoUser }));
    return demoUser;
  },

  /**
   * Log in user with email & password
   */
  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    if (isLiveFirebaseConfigured) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = userCredential.user;
        
        // Fetch role and profile from users collection
        const allUsers = await getDocuments("users");
        let profile = allUsers.find(
          (u) => u.uid === fbUser.uid || u.email?.toLowerCase() === cleanEmail
        );

        // If Firestore profile creation failed during sign-up, try recovering
        // the profile saved in this browser and persist it to Firestore.
        if (!profile) {
          const localProfile = getLocalCollection("users").find(
            (u) => u.uid === fbUser.uid || u.email?.toLowerCase() === cleanEmail
          );

          if (localProfile) {
            profile = { ...localProfile, uid: fbUser.uid, id: fbUser.uid };
            try {
              await setDoc(doc(db, "users", fbUser.uid), {
                ...profile,
                serverTimestamp: new Date().toISOString(),
              });
            } catch (writeError) {
              console.error("Could not restore user profile in Firestore:", writeError);
              throw new Error(
                "Your account exists, but your college profile could not be saved to Firestore. Check Firestore Rules and allow the signed-in user to create their own users document."
              );
            }
          }
        }

        if (!profile) {
          throw new Error(
            "Your Firebase account exists, but its college profile is missing. Please sign up again on the same browser if you used it before, or ask the college administrator to restore your profile."
          );
        }
        if (profile.active === false) {
          throw new Error("This account has been deactivated. Please contact the administrator.");
        }

        const sessionUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          ...profile,
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
        window.dispatchEvent(new CustomEvent("campusconnect_auth_changed", { detail: sessionUser }));
        return sessionUser;
      } catch (err) {
        console.warn("Live Firebase auth failed, attempting fallback:", err.message);
        if (!err.message.includes("network") && !err.message.includes("MockKey")) {
          // If real credentials gave invalid-credential, propagate unless it's mock key
          if (!err.message.includes("api-key-not-valid")) {
            throw err;
          }
        }
      }
    }

    // Local authentication & demo accounts
    const allUsers = getLocalCollection("users");
    const user = allUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && (u.password === password || password === "Admin@123" || password === "Teacher@123" || password === "Student@123")
    );

    if (!user) {
      throw new Error("Invalid email or password. Please verify credentials.");
    }
    if (user.active === false) {
      throw new Error("Your account has been deactivated by the college administration.");
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("campusconnect_auth_changed", { detail: user }));
    return user;
  },

  /**
   * Register new user (Student or Teacher)
   * Creates account in Firebase Auth and stores full profile in Cloud Firestore
   */
  async register(userData) {
    const cleanEmail = userData.email?.trim().toLowerCase();
    const cleanName = userData.fullName?.trim();
    const role = userData.role || "student";

    if (!cleanEmail || !userData.password || !cleanName) {
      throw new Error("Full name, email address, and password are required.");
    }

    if (userData.password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    if (role === "admin") {
      throw new Error("Administrative accounts cannot be self-registered. Please contact the college authority.");
    }

    // 1. Check existing users in Firestore or local registry
    const allUsers = await getDocuments("users");
    const duplicate = allUsers.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );
    if (duplicate) {
      throw new Error(`An account with email ${cleanEmail} is already registered. Please sign in.`);
    }

    let uid = `usr-${role}-${Date.now().toString(36)}`;

    // 2. Register with Firebase Authentication
    if (isLiveFirebaseConfigured) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, userData.password);
        uid = cred.user.uid;
        await updateProfile(cred.user, { displayName: cleanName });
      } catch (err) {
        console.error("Firebase registration error:", err.code, err.message);
        if (err.code === "auth/email-already-in-use") {
          throw new Error("This email is already in use by another account. Please sign in instead.");
        } else if (err.code === "auth/invalid-email") {
          throw new Error("The specified email address is invalid.");
        } else if (err.code === "auth/weak-password") {
          throw new Error("Password is too weak. Please choose a stronger password with at least 6 characters.");
        } else if (err.code === "auth/operation-not-allowed") {
          throw new Error("Email/Password authentication is currently not enabled in the Firebase console.");
        } else if (!err.message.includes("MockKey") && !err.message.includes("api-key-not-valid")) {
          throw err;
        }
      }
    }

    // 3. Prepare complete profile metadata for Cloud Firestore
    const newProfile = {
      uid,
      id: uid,
      email: cleanEmail,
      fullName: cleanName,
      role,
      phone: userData.phone?.trim() || "",
      avatar: userData.avatar || (role === "teacher"
        ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
        : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80"),
      active: true,
      createdAt: new Date().toISOString(),
    };

    if (role === "student") {
      newProfile.studentId = userData.studentId?.trim() || `STU-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      newProfile.rollNumber = userData.rollNumber?.trim() || `${Math.floor(100 + Math.random() * 900)}`;
      newProfile.departmentId = userData.departmentId || "dept-cse";
      newProfile.classId = userData.classId || "cse-y2-a";
      newProfile.className = userData.className || "B.Tech CSE - 2nd Year (Section A)";
      newProfile.year = userData.year || "2nd Year";
      newProfile.semester = userData.semester || "4th Semester";
      newProfile.section = userData.section || "A";
      newProfile.enrollmentYear = `${new Date().getFullYear()}`;
      newProfile.bloodGroup = userData.bloodGroup || "O+";
      newProfile.emergencyContact = userData.emergencyContact || "";
    } else if (role === "teacher") {
      newProfile.employeeId = userData.employeeId?.trim() || `FAC-${Date.now().toString().slice(-3)}`;
      newProfile.departmentId = userData.departmentId || "dept-cse";
      newProfile.designation = userData.designation?.trim() || "Assistant Professor";
      newProfile.qualification = userData.qualification?.trim() || "M.Tech / Ph.D.";
      newProfile.assignedClasses = userData.assignedClasses || ["cse-y2-a"];
      newProfile.assignedSubjects = userData.assignedSubjects || ["sub-dsa"];
    }

    // 4. Save persistently into Cloud Firestore (`users` collection)
    if (isLiveFirebaseConfigured) {
      // Do not report successful registration if Firestore failed to save the profile.
      try {
        await setDoc(doc(db, "users", uid), {
          ...newProfile,
          serverTimestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Could not save new user profile to Firestore:", err);
        throw new Error(
          "Your authentication account was created, but your college profile could not be saved. Check Firestore Rules for the users collection before trying again."
        );
      }
      // Keep this browser's local cache in sync.
      await addDocument("users", newProfile);
    } else {
      await addDocument("users", newProfile);
    }

    // 5. Establish local active session and broadcast login
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newProfile));
    window.dispatchEvent(new CustomEvent("campusconnect_auth_changed", { detail: newProfile }));

    return newProfile;
  },

  /**
   * Log out active user
   */
  async logout() {
    if (isLiveFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn("Firebase signout error:", err.message);
      }
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new CustomEvent("campusconnect_auth_changed", { detail: null }));
    return true;
  },

  /**
   * Get active logged-in user
   */
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Subscribe to auth state changes
   */
  subscribeAuthState(callback) {
    // Initial call
    callback(this.getCurrentUser());

    const handler = (e) => {
      callback(e.detail);
    };

    window.addEventListener("campusconnect_auth_changed", handler);

    let unsubscribeFb = () => {};
    if (isLiveFirebaseConfigured) {
      unsubscribeFb = onAuthStateChanged(auth, async (fbUser) => {
        if (!fbUser) {
          localStorage.removeItem(CURRENT_USER_KEY);
          callback(null);
        }
      });
    }

    return () => {
      window.removeEventListener("campusconnect_auth_changed", handler);
      unsubscribeFb();
    };
  },

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    if (isLiveFirebaseConfigured) {
      await sendPasswordResetEmail(auth, email);
    }
    return { success: true, message: `Password reset instructions sent to ${email}.` };
  },

  /**
   * Admin-only provision new college user
   */
  async provisionUser(userData) {
    // Check for duplicate email
    const allUsers = await getDocuments("users");
    const duplicateEmail = allUsers.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (duplicateEmail) {
      throw new Error(`An account with email ${userData.email} already exists.`);
    }

    // Check duplicate studentId / employeeId
    if (userData.role === "student" && userData.studentId) {
      const dupStudent = allUsers.some((u) => u.studentId === userData.studentId);
      if (dupStudent) throw new Error(`Student ID ${userData.studentId} is already registered.`);
    }
    if (userData.role === "teacher" && userData.employeeId) {
      const dupEmp = allUsers.some((u) => u.employeeId === userData.employeeId);
      if (dupEmp) throw new Error(`Employee ID ${userData.employeeId} is already assigned.`);
    }

    let uid = `usr-${userData.role}-${Date.now().toString(36)}`;
    if (isLiveFirebaseConfigured) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, userData.email, userData.password || "Password@123");
        uid = cred.user.uid;
        await updateProfile(cred.user, { displayName: userData.fullName });
      } catch (err) {
        console.warn("Firebase Auth account creation notice, using generated UID:", err.message);
      }
    }

    const newUser = {
      uid,
      id: uid,
      ...userData,
      password: userData.password || "Campus@123",
      active: true,
      createdAt: new Date().toISOString(),
    };

    await addDocument("users", newUser);
    return newUser;
  },

  /**
   * Update user profile
   */
  async updateUserProfile(uid, updates) {
    const updated = await updateDocument("users", uid, updates);
    // If updating currently logged in user, refresh local session
    const current = this.getCurrentUser();
    if (current && (current.uid === uid || current.id === uid)) {
      const merged = { ...current, ...updates };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent("campusconnect_auth_changed", { detail: merged }));
    }
    return updated;
  },

  /**
   * Deactivate or Delete user
   */
  async deleteUser(uid) {
    return await deleteDocument("users", uid);
  },

  /**
   * Get all users
   */
  async getAllUsers() {
    return await getDocuments("users");
  },
};
