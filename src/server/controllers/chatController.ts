import { Request, Response } from "express";
import User from "../models/User";
import Message from "../models/Message";

// @desc    Render chat page
// @route   GET /chat
// @access  Private
export const renderChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      res.redirect("/login");
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.redirect("/login");
      return;
    }

    // Get last 50 messages
    const messages = await Message.find().sort({ time: -1 }).limit(50).lean();

    // Reverse to show oldest first
    messages.reverse();

    // Get online users
    const onlineUsers = await User.find({ online: true })
      .select("username")
      .lean();

    res.render("chat/index", {
      user,
      messages,
      onlineUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
