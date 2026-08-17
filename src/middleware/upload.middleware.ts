import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";

// Allowed file types
const ALLOWED_TYPES: Record<string, string[]> = {
  "video/mp4": ["mp4"],
  "video/webm": ["webm"],
  "application/pdf": ["pdf"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
};

// Max sizes
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_DOC_SIZE = 20 * 1024 * 1024;    // 20MB

// Ensure uploads dir exists
const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const isVideo = file.mimetype.startsWith("video/");
    const folder = isVideo ? "uploads/videos" : "uploads/documents";
    ensureDir(folder);
    cb(null, folder);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

const limits = (file: Express.Multer.File) =>
  file.mimetype.startsWith("video/") ? MAX_VIDEO_SIZE : MAX_DOC_SIZE;

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE }, // outer cap, video is biggest
});
