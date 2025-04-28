import { Request, Response } from "express";
import User from "../models/User";

interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

interface LoginBody {
  username: string;
  password: string;
}

// @desc    Register user
// @route   POST /register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body as RegisterBody;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      res.render("auth/register", {
        error: "User already exists",
        username,
        email,
      });
      return;
    }

    // Create new user
    user = await User.create({
      username,
      email,
      password,
    });

    // Set session and redirect
    req.session.userId = user._id?.toString();
    res.redirect("/chat");
  } catch (err) {
    console.error(err);
    res.render("auth/register", {
      error: "Server error",
      username: req.body.username || "",
      email: req.body.email || "",
    });
  }
};

// @desc    Login user
// @route   POST /login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as LoginBody;

    // Check for user
    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      res.render("auth/login", {
        error: "Invalid credentials",
        username,
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.render("auth/login", {
        error: "Invalid credentials",
        username,
      });
      return;
    }

    // Set user as online
    user.online = true;
    await user.save();

    // Set session and redirect
    req.session.userId = user._id?.toString();
    res.redirect("/chat");
  } catch (err) {
    console.error(err);
    res.render("auth/login", {
      error: "Server error",
      username: req.body.username || "",
    });
  }
};

// @desc    Logout user
// @route   GET /logout
// @access  Private
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Set user as offline
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) {
        user.online = false;
        user.socketId = null;
        await user.save();
      }
    }

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        res.redirect("/chat");
        return;
      }
      res.redirect("/login");
    });
  } catch (err) {
    console.error(err);
    res.redirect("/chat");
  }
};

// @desc    Render register page
// @route   GET /register
// @access  Public
export const renderRegister = (req: Request, res: Response): void => {
  if (req.session.userId) {
    res.redirect("/chat");
    return;
  }
  res.render("auth/register", { error: null, username: "", email: "" });
};

// @desc    Render login page
// @route   GET /login
// @access  Public
export const renderLogin = (req: Request, res: Response): void => {
  if (req.session.userId) {
    res.redirect("/chat");
    return;
  }
  res.render("auth/login", { error: null, username: "" });
};
