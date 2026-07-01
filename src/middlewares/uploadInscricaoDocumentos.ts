import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const BASE_DIR = path.resolve(process.cwd(), "uploads", "inscricoes");

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const inscricaoId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!inscricaoId) {
      return cb(new Error("ID da inscrição não informado"), BASE_DIR);
    }

    const dir = path.join(BASE_DIR, inscricaoId);
    ensureDir(dir);

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^\w\-]+/g, "_");

    const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${baseName}${ext}`;
    cb(null, uniqueName);
  },
});

export const uploadInscricaoDocumentos = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Tipo de arquivo não permitido"));
    }
    cb(null, true);
  },
});