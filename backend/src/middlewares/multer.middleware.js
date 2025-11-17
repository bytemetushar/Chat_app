import path from 'path'
import multer from 'multer'
import fs from 'fs'

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads", { recursive: true });

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads"),
    filename: (req, file, cb) =>
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error("Images only"));
    }
}

const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb); 
    }
});
 
export default uploadImage;
