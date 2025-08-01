import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { startTrial, checkPlanStatus } from "../controller/planController.js";

const router = express.Router();

router.post("/trial/start", verifyToken, startTrial);
router.get("/status", verifyToken, checkPlanStatus);

export default router;
