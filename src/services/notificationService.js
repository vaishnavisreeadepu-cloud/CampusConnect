/**
 * Notification Service for CampusConnect
 * Real-time notifications and browser push notification integration
 */

import {
  getDocuments,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
} from "./storeManager";

export const notificationService = {
  subscribeNotifications(userId, callback) {
    return subscribeToCollection("notifications", (items) => {
      const userNotifs = items.filter((n) => n.userId === userId);
      userNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      callback(userNotifs);
    });
  },

  async markAsRead(id) {
    return await updateDocument("notifications", id, { read: true });
  },

  async clearNotification(id) {
    return await deleteDocument("notifications", id);
  },

  async requestBrowserNotificationPermission() {
    if (!("Notification" in window)) {
      console.warn("Browser does not support notifications");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (err) {
      console.warn("Notification permission request denied or failed:", err);
      return false;
    }
  },
};
