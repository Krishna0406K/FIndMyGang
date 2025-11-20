import express from 'express';
import multer from 'multer';
import { uploadMedia, uploadMultipleMedia } from '../controllers/mediaController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

router.post('/upload', authenticateToken, upload.single('file'), uploadMedia);
router.post('/upload-multiple', authenticateToken, upload.array('files', 5), uploadMultipleMedia);

export default router;
