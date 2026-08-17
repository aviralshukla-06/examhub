import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import {
    uploadContent,
    getContentById,
    listContent,
} from "../controllers/content.controller";

const router = express.Router();

// Public
router.get("/", listContent);

// Protected
router.get("/:id", authenticate, getContentById);
router.post("/upload", authenticate, upload.single("file"), uploadContent);

export default router;