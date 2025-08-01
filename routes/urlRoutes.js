import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  createShortUrl,
  redirectShortUrl,
  getAnalytics,
  deleteUserLink,   // ✅ Import here
} from "../controller/urlController.js";

const router = express.Router();

router.post("/api/short", verifyToken, createShortUrl);
router.get("/:shortUrl", redirectShortUrl);
router.get("/analytics/all", verifyToken, getAnalytics);

// ✅ User deletes their own link
router.delete("/api/short/:id", verifyToken, deleteUserLink);

export default router;
