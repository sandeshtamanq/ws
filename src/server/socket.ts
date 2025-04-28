import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "./types/socket";
import Message from "./models/Message";
import User from "./models/User";

export default function (server: HttpServer) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server);

  // Run when client connects
  io.on("connection", (socket) => {
    console.log("New WebSocket connection...");

    // Join chat room
    socket.on("joinRoom", async ({ userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) return;

        // Update user's socket ID
        user.socketId = socket.id;
        await user.save();

        socket.join("chatroom");

        // Welcome current user
        socket.emit("message", {
          username: "ChatBot",
          text: "Welcome to the chat!",
          time: new Date().toISOString(),
        });

        // Broadcast when a user connects
        socket.broadcast.to("chatroom").emit("message", {
          username: "ChatBot",
          text: `${user.username} has joined the chat`,
          time: new Date().toISOString(),
        });

        // Send users and room info
        const users = await User.find({ online: true });
        io.to("chatroom").emit("roomUsers", {
          users: users.map((u) => ({
            username: u.username,
            id: u._id?.toString() ?? "",
          })),
        });
      } catch (err) {
        console.error(err);
      }
    });

    // Listen for chatMessage
    socket.on("chatMessage", async ({ userId, msg }) => {
      try {
        const user = await User.findById(userId);
        if (!user) return;

        const message = new Message({
          user: user._id,
          username: user.username,
          text: msg,
          time: new Date(),
        });

        await message.save();

        io.to("chatroom").emit("message", {
          userId: user._id?.toString(),
          username: user.username,
          text: msg,
          time: new Date().toISOString(),
        });
      } catch (err) {
        console.error(err);
      }
    });

    // Runs when client disconnects
    socket.on("disconnect", async () => {
      try {
        const user = await User.findOne({ socketId: socket.id });
        if (user) {
          user.online = false;
          user.socketId = null;
          await user.save();

          io.to("chatroom").emit("message", {
            username: "ChatBot",
            text: `${user.username} has left the chat`,
            time: new Date().toISOString(),
          });

          // Send users and room info
          const users = await User.find({ online: true });
          io.to("chatroom").emit("roomUsers", {
            users: users.map((u) => ({
              username: u.username,
              id: u._id?.toString() ?? "",
            })),
          });
        }
      } catch (err) {
        console.error(err);
      }
    });
  });

  return io;
}
