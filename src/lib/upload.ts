import multer from 'multer';
import path   from 'path';
import fs     from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'logos');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXT = ['.png', '.jpg', '.jpeg', '.webp'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req,  file,  cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.params['id']}${ext}`);
  },
});

const fileFilter = (
  _req:  Express.Request,
  file:  Express.Multer.File,
  cb:    multer.FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXT.includes(ext)) cb(null, true);
  else cb(new Error('Solo se permiten imágenes PNG, JPG o WEBP'));
};

export const uploadLogoMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('logo');
