// ═══════════════════════════════════════════════════════════════
// HeritGoa Server — Heritage Analysis Route
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import multer from 'multer';
import { handleHeritageAnalysis } from '../controllers/analyzeController.js';

const router = express.Router();

// Memory storage for fast memory-to-buffer processing without writing temporary files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP) are allowed.'));
    }
  }
});

// POST /api/heritage/analyze
router.post('/analyze', upload.single('image'), handleHeritageAnalysis);

export default router;
