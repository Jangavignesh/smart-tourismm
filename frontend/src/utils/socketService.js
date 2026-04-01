// ============================================================
// src/utils/socketService.js
// Single shared socket instance across all components
// ============================================================

let socket = null;

export const getSocket = () => socket;

export const initSocket = (token, onReady) => {
  if (socket?.connected) {
    if (onReady) onReady(socket);
    return socket;
  }

  const loadAndConnect = () => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
    socket = window.io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      if (onReady) onReady(socket);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });
  };

  if (window.io) {
    loadAndConnect();
  } else {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.min.js";
    script.onload = loadAndConnect;
    document.head.appendChild(script);
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
