import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { UserDocument } from "../models/User";

export interface ServerToClientEvents {
  message: (message: {
    userId?: string;
    username: string;
    text: string;
    time: string;
  }) => void;
  roomUsers: (data: { users: { username: string; id: string }[] }) => void;
}

export interface ClientToServerEvents {
  joinRoom: (data: { userId: string }) => void;
  chatMessage: (data: { userId: string; msg: string }) => void;
  disconnect: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user?: UserDocument;
}
