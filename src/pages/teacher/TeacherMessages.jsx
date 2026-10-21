import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { messageService } from "../../services/messageService";
import {
  MessageSquare,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Search,
  Download,
  AlertCircle,
  Flag,
  User,
} from "lucide-react";

export const TeacherMessages = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // Subscribe to conversations involving this teacher
  useEffect(() => {
    if (!user) return;
    const unsub = messageService.subscribeConversations(user.uid || user.id, (convs) => {
      setConversations(convs);
      
      // If navigated from class student list with a specific conversationId
      const targetId = location.state?.conversationId;
      if (targetId) {
        const found = convs.find((c) => c.id === targetId);
        if (found) setActiveConv(found);
      } else if (!activeConv && convs.length > 0) {
        setActiveConv(convs[0]);
      }
    });

    return () => unsub();
  }, [user, location.state]);

  // Subscribe to messages in active conversation
  useEffect(() => {
    if (!activeConv) return;

    const unsub = messageService.subscribeMessages(activeConv.id, (msgs) => {
      setMessages(msgs);
      // Mark read
      messageService.markAsRead(activeConv.id, user.uid || user.id, user.role);
    });

    return () => unsub();
  }, [activeConv, user]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachment) || !activeConv) return;

    setSending(true);
    try {
      const recipientId = activeConv.studentId;
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
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter(
    (c) =>
      c.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      c.studentRoll?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Direct Student Communications"
      subtitle="Encrypted 1-on-1 academic consultation, doubt clearance, and coursework advisement"
    >
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden h-[650px] flex">
        {/* Left Column: Conversation Roster */}
        <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Scholars Conversations
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search scholars..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConvs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 px-4 text-xs">
                No active conversations. Click "Message Student" from your class rosters to initiate.
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                const hasUnread = (conv.unreadByTeacher || 0) > 0;

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
                        {conv.studentName}
                      </span>
                      {hasUnread && (
                        <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {conv.unreadByTeacher}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{conv.lastMessage}</p>
                    <span className="text-[10px] text-slate-400 block">
                      Roll: #{conv.studentRoll || "N/A"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Box */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{activeConv.studentName}</h4>
                    <p className="text-[11px] text-slate-500">
                      Enrolled Scholar • Roll #{activeConv.studentRoll || "N/A"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setReportModalOpen(true)}
                  className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                  title="Abuse Moderation Controls"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Report / Moderate</span>
                </button>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
                {messages.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Start of consultation. Send an academic message below.
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

              {/* Input Form */}
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
                    placeholder="Type an instructional message or reply..."
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
              Select or open a scholar conversation to chat
            </div>
          )}
        </div>
      </div>

      {/* Moderation / Abuse Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-600" />
              Content Moderation Notice
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All communications on CampusConnect are governed by college conduct codes. Conversations can be audited by the Dean of Academic Affairs.
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
