// src/middleware/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ensure upload dir exists
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'resumes');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// simple filename sanitizer
function safeName(original) {
  const base = original.replace(/[^a-zA-Z0-9._-]/g, '_');
  const ts = Date.now();
  const dot = base.lastIndexOf('.');
  const name = dot > -1 ? base.slice(0, dot) : base;
  const ext  = dot > -1 ? base.slice(dot) : '';
  return `${name}_${ts}${ext}`;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, safeName(file.originalname)),
});

const fileFilter = (_req, file, cb) => {
  // allow common doc types
  const ok = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf',
    'text/rtf',
  ].includes(file.mimetype);
  cb(ok ? null : new Error('Unsupported file type'), ok);
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('resume'); // <-- must match FormData key on the client

export { UPLOAD_DIR };
