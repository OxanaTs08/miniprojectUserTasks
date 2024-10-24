import { Router } from "express";
import {
  createTask,
  updateTask,
  updateStatusTask,
  deleteTask,
  getAllTasks,
  getFilteredTasks,
  getTasksById,
  getFilteredDateTasks,
} from "../controllers/auth";
import authenticateJWT from "../middleWare/authMiddleWare";

const router = Router();

router.post("/newtask", authenticateJWT, createTask as any);
router.put("/updatetask/:id", authenticateJWT, updateTask as any);
router.delete("/deletetask/:id", authenticateJWT, deleteTask as any);
router.get("/gettask/", authenticateJWT, getAllTasks as any);
router.get("/getfilteredtasks/", authenticateJWT, getFilteredTasks as any);
router.get(
  "/getfiltereddatetasks/",
  authenticateJWT,
  getFilteredDateTasks as any
);
router.patch("/changestatus/:id", authenticateJWT, updateStatusTask as any);
router.get("/gettask/:id", authenticateJWT, getTasksById as any);
export default router;
