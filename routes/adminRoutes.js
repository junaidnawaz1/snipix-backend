import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import isAdmin from "../middleware/isAdmin.js";
import { getAllUsers, deleteUser, getAllLinks, deleteLink } from "../controller/adminController.js";

const router = express.Router();

router.get("/users", verifyToken, isAdmin, getAllUsers);
router.delete("/user/:id", verifyToken, isAdmin, deleteUser);
router.get("/links", verifyToken, isAdmin, getAllLinks);
router.delete("/link/:id", verifyToken, isAdmin, deleteLink);

export default router;
