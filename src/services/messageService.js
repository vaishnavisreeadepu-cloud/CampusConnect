/**
 * Message Service for CampusConnect
 * Real-time private 1-on-1 teacher-student messaging with live listeners, attachments, and unread counts.
 */

import {
  getDocuments,
  addDocument,
  updateDocument,
  subscribeToCollection,
  uploadFileToStorage,
  getLocalCollection,
  setLocalCollection,
} from "./storeManager";

export const messageService = {
  /**
   * Subscribe to conversations involving the active user
   */
  subscribeConversations(userId, callback) {
    return subscribeToCollection("conversations", (items) => {
      const userConvs = items.filter(
        (c) => c.teacherId === userId || c.studentId === userId
      );
      userConvs.sort((a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));
      callback(userConvs);
    });
  },

  /**
   * Subscribe to messages in a specific conversation
   */
  subscribeMessages(conversationId, callback) {
    return subscribeToCollection("messages", (items) => {
      const convMessages = items.filter((m) => m.conversationId === conversationId);
      convMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      callback(convMessages);
    });
  },

  /**
   * Get or create conversation between a teacher and a student
   */
  async getOrCreateConversation(teacher, student, classId) {
    const teacherId = teacher.uid || teacher.id;
    const studentId = student.uid || student.id;

    const allConvs = await getDocuments("conversations");
    let conv = allConvs.find(
      (c) => c.teacherId === teacherId && c.studentId === studentId
    );

    if (!conv) {
      conv = await addDocument("conversations", {
        teacherId,
        teacherName: teacher.fullName,
        studentId,
        studentName: student.fullName,
        studentRoll: student.rollNumber || "N/A",
        classId: classId || student.classId,
        lastMessage: "Conversation opened",
        lastMessageAt: new Date().toISOString(),
        unreadByTeacher: 0,
        unreadByStudent: 0,
        createdAt: new Date().toISOString(),
      });
    }

    return conv;
  },

  /**
   * Send a message
   */
  async sendMessage(conversationId, sender, recipientId, text, attachmentFile = null) {
    let attachment = null;
    if (attachmentFile instanceof File) {
      attachment = await uploadFileToStorage(`messages/${conversationId}`, attachmentFile);
    }

    const message = {
      conversationId,
      senderId: sender.uid || sender.id,
      senderName: sender.fullName,
      senderRole: sender.role,
      recipientId,
      text: text.trim(),
      attachmentUrl: attachment ? attachment.url : null,
      attachmentName: attachment ? attachment.name : null,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const savedMessage = await addDocument("messages", message);

    // Update conversation lastMessage & unread count
    const convs = await getDocuments("conversations");
    const conv = convs.find((c) => c.id === conversationId);
    if (conv) {
      const isTeacherSender = sender.role === "teacher";
      await updateDocument("conversations", conversationId, {
        lastMessage: text.trim() || (attachment ? `📎 ${attachment.name}` : "Attachment"),
        lastMessageAt: new Date().toISOString(),
        unreadByTeacher: isTeacherSender ? 0 : (conv.unreadByTeacher || 0) + 1,
        unreadByStudent: !isTeacherSender ? 0 : (conv.unreadByStudent || 0) + 1,
      });
    }

    // Add In-App notification for the recipient
    await addDocument("notifications", {
      userId: recipientId,
      title: `New Message from ${sender.fullName}`,
      message: text.substring(0, 60) + (text.length > 60 ? "..." : ""),
      type: "message",
      conversationId,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return savedMessage;
  },

  /**
   * Mark all messages in a conversation as read by active user
   */
  async markAsRead(conversationId, currentUserId, role) {
    const allMessages = getLocalCollection("messages");
    let changed = false;

    allMessages.forEach((m) => {
      if (m.conversationId === conversationId && m.recipientId === currentUserId && !m.read) {
        m.read = true;
        changed = true;
      }
    });

    if (changed) {
      setLocalCollection("messages", allMessages);
    }

    // Reset unread count on conversation
    const convs = getLocalCollection("conversations");
    const conv = convs.find((c) => c.id === conversationId);
    if (conv) {
      if (role === "teacher") conv.unreadByTeacher = 0;
      else if (role === "student") conv.unreadByStudent = 0;
      setLocalCollection("conversations", convs);
    }
  },
};
