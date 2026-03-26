// ============================================================
// server.js - WITH Socket.IO for Real-Time Group Chat
// ============================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app); // wrap express with http

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Routes
const authRoutes         = require("./routes/authRoutes");
const userRoutes         = require("./routes/userRoutes");
const destinationRoutes  = require("./routes/destinationRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const favoritesRoutes    = require("./routes/favoritesRoutes");
const reviewRoutes       = require("./routes/reviewRoutes");
const groupTripRoutes    = require("./routes/groupTripRoutes");
const meetingPollRoutes  = require("./routes/meetingPollRoutes");
const expenseRoutes      = require("./routes/expenseRoutes");
const itineraryRoutes    = require("./routes/itineraryRoutes");
const analyticsRoutes      = require("./routes/analyticsRoutes");
const notificationRoutes   = require("./routes/notificationRoutes");

app.use("/api/auth",         authRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/favorites",    favoritesRoutes);
app.use("/api/reviews",      reviewRoutes);
app.use("/api/group-trips",    groupTripRoutes);
app.use("/api/meeting-polls",  meetingPollRoutes);
app.use("/api/expenses",       expenseRoutes);
app.use("/api/itinerary",      itineraryRoutes);
app.use("/api/analytics",      analyticsRoutes);
app.use("/api/notifications",   notificationRoutes);

// ── Socket.IO Real-Time Chat ─────────────────────────────────
const Message = require("./models/Message");
const Notification = require("./models/Notification");
const GroupTrip = require("./models/GroupTrip");

// Helper: create notification + emit to recipient via socket
const createNotification = async (io, { recipient, type, title, message, link, tripId, triggeredBy }) => {
  try {
    const notif = await Notification.create({ recipient, type, title, message, link, tripId, triggeredBy });
    // Emit real-time to recipient if online
    io.to(`user_${recipient}`).emit("new_notification", {
      _id: notif._id,
      type, title, message, link, tripId,
      triggeredBy, isRead: false,
      createdAt: notif.createdAt,
    });
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};
const jwt = require("jsonwebtoken");

const User = require("./models/User");

// Auth middleware for socket
const socketAuth = async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch full user from DB to get name
    const user = await User.findById(decoded.id).select("name email").lean();
    if (!user) return next(new Error("User not found"));
    socket.user = {
      id: decoded.id,
      name: user.name,
      email: user.email,
    };
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Invalid token"));
  }
};

io.use((socket, next) => socketAuth(socket, next));

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.user?.name}`);

  // Join personal room for direct notifications
  socket.join(`user_${socket.user?.id}`);

  // Join trip room
  socket.on("join_trip", async (tripId) => {
    socket.join(tripId);
    console.log(`📍 ${socket.user?.name} joined trip ${tripId}`);

    // Send last 50 messages
    try {
      const messages = await Message.find({ tripId: tripId.toString() })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      socket.emit("previous_messages", messages.reverse());
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  });

  // Leave trip room
  socket.on("leave_trip", (tripId) => {
    socket.leave(tripId);
  });

  // Send message
  socket.on("send_message", async ({ tripId, text }) => {
    console.log(`💬 Message from ${socket.user?.name} (${socket.user?.id}) in trip ${tripId}: ${text}`);
    if (!text?.trim() || !tripId) return;

    try {
      const message = await Message.create({
        tripId: tripId.toString(),
        sender: socket.user?.id?.toString() || "",
        senderName: socket.user?.name || "Unknown",
        text: text.trim(),
        type: "text",
      });

      const msgData = {
        _id: message._id,
        tripId,
        sender: socket.user?.id,
        senderName: socket.user?.name,
        text: text.trim(),
        createdAt: message.createdAt,
        type: "text",
      };

      io.to(tripId).emit("new_message", msgData);
      console.log(`✅ Message saved and sent to room ${tripId}`);

      // Notify other trip members
      try {
        const trip = await GroupTrip.findById(tripId);
        if (trip) {
          for (const member of trip.members) {
            if (member.user?.toString() !== socket.user?.id) {
              await createNotification(io, {
                recipient: member.user,
                type: "group_message",
                title: `💬 New message in "${trip.name}"`,
                message: `${socket.user?.name}: ${text.slice(0, 50)}${text.length > 50 ? "..." : ""}`,
                link: `/group-trips/${tripId}`,
                tripId,
                triggeredBy: socket.user?.name,
              });
            }
          }
        }
      } catch (e) { console.error("Notif error:", e.message); }
    } catch (err) {
      console.error("Error saving message:", err.message);
      socket.emit("message_error", { message: "Could not send message." });
    }
  });

  // Group edited notification
  socket.on("group_updated", async ({ tripId, updatedBy, changes }) => {
    const systemMsg = `✏️ ${updatedBy} updated the group: ${changes}`;
    io.to(tripId).emit("system_message", {
      _id: Date.now(),
      tripId,
      senderName: "System",
      text: systemMsg,
      type: "system",
      createdAt: new Date(),
    });

    // Notify other members
    try {
      const trip = await GroupTrip.findById(tripId);
      if (trip) {
        for (const member of trip.members) {
          if (member.user?.toString() !== socket.user?.id) {
            await createNotification(io, {
              recipient: member.user,
              type: "group_edit",
              title: `✏️ "${trip.name}" was updated`,
              message: `${updatedBy}: ${changes}`,
              link: `/group-trips/${tripId}`,
              tripId,
              triggeredBy: updatedBy,
            });
          }
        }
      }
    } catch (e) { console.error("Notif error:", e.message); }
  });

  // Typing indicator
  socket.on("typing", ({ tripId, isTyping, userId }) => {
    socket.to(tripId).emit("user_typing", {
      userId: userId || socket.user?.id,
      name: socket.user?.name,
      isTyping,
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.user?.name}`);
  });
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
