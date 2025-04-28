import express from "express";
import {
  register,
  login,
  logout,
  renderRegister,
  renderLogin,
} from "../controllers/authController";

const router = express.Router();

router.get("/", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/chat");
  }
  res.redirect("/login");
});

router.get("/register", renderRegister);
router.post("/register", register);
router.get("/login", renderLogin);
router.post("/login", login);
router.get("/logout", logout);

export default router;
