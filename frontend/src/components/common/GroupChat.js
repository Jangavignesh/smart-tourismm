// ============================================================
// src/components/common/GroupChat.js - FINAL REBUILD
// Real WhatsApp style chat
// My messages → RIGHT (purple, no name)
// Others → LEFT (white, with name + colored avatar)
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { initSocket, getSocket } from "../../utils/socketService";
import toast from "react-hot-toast";

const GroupChat = ({ tripId, tripName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const listenersAddedRef = useRef(false);

  // Get current user ID — use useMemo to always get fresh value
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = (user?._id || user?.id || storedUser?._id || storedUser?.id || "").toString();
  const myName = (user?.name || storedUser?.name || "").toString();

  // Store in ref so isMine always uses latest value
  const myIdRef = useRef(myId);
  myIdRef.current = myId;

  useEffect(() => {
    if (!tripId || !myId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    initSocket(token, (socket) => {
      setConnected(socket.connected);
      socket.emit("join_trip", tripId);

      if (!listenersAddedRef.current) {
        listenersAddedRef.current = true;

        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));

        socket.on("previous_messages", (msgs) => {
          setMessages(msgs || []);
          setTimeout(() => scrollToBottom(), 200);
        });

        socket.on("new_message", (msg) => {
          setMessages(prev => {
            if (prev.find(m => m._id?.toString() === msg._id?.toString())) return prev;
            return [...prev, msg];
          });
          setTimeout(() => scrollToBottom(), 100);
        });

        socket.on("system_message", (msg) => {
          setMessages(prev => [...prev, { ...msg, type: "system" }]);
          setTimeout(() => scrollToBottom(), 100);
        });

        socket.on("user_typing", ({ name, isTyping, userId }) => {
          if (userId === myId || name === myName) return;
          if (isTyping) {
            setTyping(name);
            setTimeout(() => setTyping(null), 3000);
          } else {
            setTyping(null);
          }
        });

        socket.on("message_error", ({ message }) => {
          toast.error(message || "Could not send message.");
        });
      }
    });

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("previous_messages");
        socket.off("new_message");
        socket.off("system_message");
        socket.off("user_typing");
        socket.off("message_error");
        listenersAddedRef.current = false;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, myId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const socket = getSocket();
    if (!socket?.connected) { toast.error("Not connected!"); return; }
    socket.emit("send_message", { tripId, text: text.trim() });
    socket.emit("typing", { tripId, isTyping: false, userId: myId });
    setText("");
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!socket) return;
    socket.emit("typing", { tripId, isTyping: true, userId: myId, name: myName });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { tripId, isTyping: false, userId: myId });
    }, 2000);
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true
  });

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  // ── Key function: determine if message is mine ────────────
  const isMine = (msg) => {
    if (!msg) return false;
    const currentId = myIdRef.current;
    console.log(`🔍 isMine check | msg.sender: "${msg.sender}" | myId: "${currentId}" | match: ${msg.sender?.toString() === currentId?.toString()}`);
    if (!currentId) return false;
    return msg.sender?.toString() === currentId.toString();
  };

  // Unique color per sender ID
  const COLORS = ["#6366f1","#8b5cf6","#ec4899","#f43f5e","#f97316","#22c55e","#14b8a6","#3b82f6","#a855f7","#06b6d4"];
  const getSenderColor = (senderId, senderName) => {
    const key = senderId || senderName || "";
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col" style={{ height: "520px" }}>

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">💬</div>
          <div>
            <h3 className="font-bold text-white text-base">Group Chat</h3>
            <p className="text-violet-200 text-xs">{tripName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
          <span className="text-xs text-violet-200 font-medium">{connected ? "Live" : "Connecting..."}</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ backgroundColor: "#f8f7ff" }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-slate-500 font-medium text-sm">No messages yet!</p>
            <p className="text-slate-400 text-xs mt-1">Be the first to say something 👋</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  {date}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {msgs.map((msg, i) => {
                // System message
                if (msg.type === "system") {
                  return (
                    <div key={msg._id || i} className="flex justify-center my-3">
                      <span className="text-xs text-violet-500 bg-violet-50 border border-violet-100 px-4 py-1.5 rounded-full">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const mine = isMine(msg);
                const prevMsg = msgs[i - 1];
                const nextMsg = msgs[i + 1];
                const isFirstInGroup = !prevMsg || prevMsg.type === "system" || isMine(prevMsg) !== mine || prevMsg.sender?.toString() !== msg.sender?.toString();
                const isLastInGroup = !nextMsg || nextMsg.type === "system" || isMine(nextMsg) !== mine || nextMsg.sender?.toString() !== msg.sender?.toString();

                const senderColor = getSenderColor(msg.sender?.toString(), msg.senderName);

                return (
                  <div key={msg._id || i} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : "flex-row"} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}>

                    {/* Avatar for others */}
                    {!mine && (
                      <div className="flex-shrink-0 w-8">
                        {isLastInGroup ? (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                            style={{ backgroundColor: senderColor }}>
                            {msg.senderName?.charAt(0).toUpperCase() || "?"}
                          </div>
                        ) : (
                          <div className="w-8 h-8" /> // spacer
                        )}
                      </div>
                    )}

                    {/* Message content */}
                    <div className={`flex flex-col max-w-[65%] ${mine ? "items-end" : "items-start"}`}>
                      {/* Sender name for others — show on first message in group */}
                      {!mine && isFirstInGroup && (
                        <span
                          className="text-xs font-bold mb-1 ml-1"
                          style={{ color: senderColor }}>
                          {msg.senderName || "Unknown"}
                        </span>
                      )}

                      {/* Message bubble */}
                      <div className={`px-3.5 py-2 text-sm break-words shadow-sm ${
                        mine
                          ? "bg-violet-600 text-white"
                          : "bg-white text-slate-800 border border-slate-100"
                      } ${
                        mine
                          ? isFirstInGroup && isLastInGroup ? "rounded-2xl rounded-br-sm"
                            : isFirstInGroup ? "rounded-2xl rounded-br-sm"
                            : isLastInGroup ? "rounded-2xl rounded-br-sm"
                            : "rounded-2xl rounded-br-sm"
                          : isFirstInGroup && isLastInGroup ? "rounded-2xl rounded-bl-sm"
                            : isFirstInGroup ? "rounded-2xl rounded-bl-sm"
                            : isLastInGroup ? "rounded-2xl rounded-bl-sm"
                            : "rounded-2xl rounded-bl-sm"
                      }`}>
                        {msg.text}
                      </div>

                      {/* Time — only on last message in group */}
                      {isLastInGroup && (
                        <span className={`text-xs text-slate-400 mt-1 ${mine ? "mr-1" : "ml-1"}`}>
                          {formatTime(msg.createdAt)}
                          {mine && <span className="ml-1 text-violet-300">✓✓</span>}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {typing && (
          <div className="flex items-end gap-2 mt-3">
            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {typing?.charAt(0)?.toUpperCase()}
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                {[0, 200, 400].map(d => (
                  <div key={d} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
            <span className="text-xs text-slate-400">{typing} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          value={text}
          onChange={handleTyping}
          placeholder={connected ? `Message ${tripName}...` : "Connecting..."}
          disabled={!connected}
          maxLength={1000}
          className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 transition-all"
        />
        <button
          type="submit"
          disabled={!text.trim() || !connected}
          className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white flex items-center justify-center transition-all flex-shrink-0 shadow-md shadow-violet-500/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default GroupChat;
