import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads/cursos");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,

    filename(req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {

    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Arquivo deve ser uma imagem."));
    }

    cb(null, true);
};

export const uploadCurso = multer({

    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter

});