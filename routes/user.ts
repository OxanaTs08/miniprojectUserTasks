import { Router } from "express";
import { registerController, loginController } from "../controllers/auth";
import authenticateJWT from "../middleWare/authMiddleWare";

const router = Router();

router.post("/register", registerController as any, authenticateJWT);
router.post("/login", loginController as any, authenticateJWT);
export default router;
