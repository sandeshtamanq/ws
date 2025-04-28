import express from "express";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import session from "express-session";
import connectDB from "./config/db";
import MongoStore from "connect-mongo";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import setupSocket from "./socket";

dotenv.config();
connectDB();
const app = express();

const server = http.createServer(app);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));

const sessionMiddleware = session({
  secret: process.env.SECRET_KEY || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
});

app.use(sessionMiddleware);

app.use("/", authRoutes);
app.use("/chat", chatRoutes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Set up socket.io
const io = setupSocket(server);
