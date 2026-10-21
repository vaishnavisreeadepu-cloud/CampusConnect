/**
 * CampusConnect - Cloud Functions for Firebase
 * Trusted server-side operations utilizing Firebase Admin SDK
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

/**
 * Middleware helper: verify caller is an authorized administrator
 */
async function assertAdminCaller(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication is required to perform this action."
    );
  }
  const callerUid = context.auth.uid;
  const callerDoc = await db.collection("users").doc(callerUid).get();
  const callerRole = context.auth.token.role || (callerDoc.exists && callerDoc.data().role);
  if (callerRole !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only college administrators can invoke this trusted operation."
    );
  }
}

/**
 * 1. Provision New College User (Admin, Teacher, or Student)
 * Creates Firebase Auth identity, assigns custom claims, and saves user profile in Firestore
 */
exports.createCollegeUser = functions.https.onCall(async (data, context) => {
  await assertAdminCaller(context);

  const { email, password, fullName, role, ...additionalData } = data;

  if (!email || !password || !fullName || !role) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email, password, fullName, and role are required."
    );
  }

  if (!["admin", "teacher", "student"].includes(role)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid user role specified."
    );
  }

  try {
    // 1. Create auth account in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName,
      emailVerified: true,
    });

    // 2. Set Firebase Custom Claims for role-based security
    await auth.setCustomUserClaims(userRecord.uid, { role });

    // 3. Create Firestore user document
    const userData = {
      uid: userRecord.uid,
      email,
      fullName,
      role,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ...additionalData,
    };

    await db.collection("users").doc(userRecord.uid).set(userData);

    // 4. Audit Log
    await db.collection("auditLogs").add({
      action: "USER_PROVISIONED",
      performedBy: context.auth.uid,
      targetUid: userRecord.uid,
      role,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      uid: userRecord.uid,
      message: `Successfully provisioned ${role} account for ${fullName}.`,
    };
  } catch (error) {
    functions.logger.error("Error creating user:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * 2. Set Custom User Claims (Admin only)
 */
exports.setCustomClaims = functions.https.onCall(async (data, context) => {
  await assertAdminCaller(context);

  const { uid, role } = data;
  if (!uid || !["admin", "teacher", "student"].includes(role)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Valid target UID and role are required."
    );
  }

  try {
    await auth.setCustomUserClaims(uid, { role });
    await db.collection("users").doc(uid).update({ role });
    return { success: true, message: `Role updated to ${role}.` };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * 3. Automated Push Notification on New Announcement
 */
exports.onAnnouncementCreated = functions.firestore
  .document("announcements/{announcementId}")
  .onCreate(async (snap, context) => {
    const announcement = snap.data();
    const payload = {
      notification: {
        title: `📢 College Announcement: ${announcement.title}`,
        body: announcement.content.substring(0, 100) + "...",
      },
      data: {
        type: "announcement",
        announcementId: context.params.announcementId,
      },
    };

    // Broadcast to relevant topic (e.g., 'all', or specific class/dept)
    const topic = announcement.audience === "all" ? "campus_all" : `audience_${announcement.audience}`;
    try {
      await admin.messaging().sendToTopic(topic, payload);
    } catch (err) {
      functions.logger.warn("FCM topic dispatch notice:", err);
    }
  });

/**
 * 4. Automated Notification on New Private Chat Message
 */
exports.onChatMessageCreated = functions.firestore
  .document("conversations/{conversationId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const recipientUid = message.recipientId;

    if (!recipientUid) return;

    // Create an in-app notification record in Firestore
    await db.collection("notifications").add({
      userId: recipientUid,
      type: "chat_message",
      title: `New message from ${message.senderName}`,
      message: message.text.substring(0, 80),
      conversationId: context.params.conversationId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
