import express from "express";
import { renderChat } from "../controllers/chatController";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.get("/", isAuthenticated, renderChat);

export default router;
