// src/middleware/upload.js
import fs from "fs";
import path from "path";
import multer from "multer";

// Ensure uploads/resumes exists
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "resumes");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Disk storage: uploads/resumes/<original_base>_<ts>.<ext>
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

// Accept only resume-like docs, up to 10 MB
function fileFilter(_req, file, cb) {
  const allowed = [".pdf", ".doc", ".docx", ".rtf"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) return cb(new Error("Invalid file type"), false);
  cb(null, true);
}

// Named export used by routes
export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
