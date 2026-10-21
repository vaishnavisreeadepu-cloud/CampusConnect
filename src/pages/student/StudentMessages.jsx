import React, { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { messageService } from "../../services/messageService";
import { authService } from "../../services/authService";
import {
  MessageSquare,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Download,
  X,
  User,
  Plus,
} from "lucide-react";

export const StudentMessages = () => {
  const { user } = useAuth();
  const { classes } = useCollege();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);

  // New Consultation Modal
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);

  const messagesEndRef = useRef(null);

  // Load teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      const allUsers = await authService.getAllUsers();
      setTeachers(allUsers.filter((u) => u.role === "teacher"));
    };
    fetchTeachers();
  }, []);

  // Subscribe to student's own conversations
  useEffect(() => {
    if (!user) return;
    const unsub = messageService.subscribeConversations(user.uid || user.id, (convs) => {
      setConversations(convs);
      if (!activeConv && convs.length > 0) {
        setActiveConv(convs[0]);
      }
    });

    return () => unsub();
  }, [user]);

  // Subscribe to active conversation messages
  useEffect(() => {
    if (!activeConv) return;

    const unsub = messageService.subscribeMessages(activeConv.id, (msgs) => {
      setMessages(msgs);
      messageService.markAsRead(activeConv.id, user.uid || user.id, user.role);
    });

    return () => unsub();
  }, [activeConv, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachment) || !activeConv) return;

    setSending(true);
    try {
      const recipientId = activeConv.teacherId;
      await messageService.sendMessage(
        activeConv.id,
        user,
        recipientId,
        inputText,
        attachment
      );
      setInputText("");
      setAttachment(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleStartNewConsultation = async (teacher) => {
    try {
      const conv = await messageService.getOrCreateConversation(teacher, user, user.classId);
      setActiveConv(conv);
      setNewChatModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout
      title="Faculty Consultation & Messaging"
      subtitle="Direct 1-on-1 private messaging with your course instructors"
      actions={
        <button
          onClick={() => setNewChatModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Message Faculty
        </button>
      }
    >
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden h-[650px] flex">
        {/* Left Column: Conversations */}
        <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Faculty Chats
            </h3>
            <button
              onClick={() => setNewChatModalOpen(true)}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              + New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="py-12 text-center text-slate-400 px-4 text-xs">
                No active conversations yet. Click "Message Faculty" above to begin.
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                const hasUnread = (conv.unreadByStudent || 0) > 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={`p-4 cursor-pointer transition-colors space-y-1 ${
                      isSelected ? "bg-white border-l-4 border-blue-600 shadow-xs" : "hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                        {conv.teacherName}
                      </span>
                      {hasUnread && (
                        <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {conv.unreadByStudent}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{conv.lastMessage}</p>
                    <span className="text-[10px] text-slate-400 block">Faculty Advisor</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Stream */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/40">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeConv.teacherName}</h4>
                  <p className="text-[11px] text-slate-500">Instructor • Private Academic Channel</p>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
                {messages.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Start of consultation. Send an inquiry or clarification below.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === (user?.uid || user?.id);

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1.5 shadow-xs ${
                            isMe
                              ? "bg-blue-600 text-white rounded-tr-xs"
                              : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                          {msg.attachmentUrl && (
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold ${
                                isMe ? "bg-blue-700 text-white" : "bg-slate-100 text-blue-700"
                              }`}
                            >
                              <Download className="w-3.5 h-3.5" />
                              {msg.attachmentName || "Attached Document"}
                            </a>
                          )}

                          <div
                            className={`flex items-center justify-end gap-1 text-[10px] pt-1 ${
                              isMe ? "text-blue-200" : "text-slate-400"
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMe && (
                              <span>
                                {msg.read ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white space-y-2">
                {attachment && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 text-blue-800 text-xs">
                    <span className="truncate">{attachment.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <label className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl cursor-pointer">
                    <Paperclip className="w-5 h-5" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setAttachment(e.target.files[0])}
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="Type message to instructor..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!inputText.trim() && !attachment)}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select or open a faculty conversation to begin
            </div>
          )}
        </div>
      </div>

      {/* Select Faculty Modal */}
      {newChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setNewChatModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Contact Course Faculty</h3>
            <p className="text-xs text-slate-500">
              Select an instructor to start a direct academic inquiry conversation:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teachers.map((t) => (
                <div
                  key={t.uid || t.id}
                  onClick={() => handleStartNewConsultation(t)}
                  className="p-3 rounded-xl border border-slate-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors flex items-center gap-3"
                >
                  <img
                    src={t.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80"}
                    alt={t.fullName}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{t.fullName}</h4>
                    <p className="text-[10px] text-blue-700 font-medium">{t.designation || "Faculty"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
