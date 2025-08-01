import express from "express";
import { register, login, logout ,getUserProfile} from "../controller/authController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", verifyToken, getUserProfile);


// ✅ Auth Check Route (Frontend uses this to check if user is logged in)
router.get("/check", verifyToken, (req, res) => {
  res.status(200).json({ id: req.user.id, isAdmin: req.user.isAdmin });
});

// ✅ Admin Check Route (Optional, for admin-only areas)
router.get("/admin-check", verifyToken, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: "Admins only" });
  res.status(200).json({ message: "Admin authenticated" });
});


export default router;
