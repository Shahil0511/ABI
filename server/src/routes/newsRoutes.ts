import { Router } from 'express';
import { apiRateLimit } from '../config/rateLimit';
import { validator } from '../middleware/validator';
import { newsCreateSchema, newsIdSchema } from '../models/newsModel';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  getFile
} from '../controllers/newsController';
import { authenticate } from '../middleware/auth';
import { uploadNewsFiles } from '../config/multer'; // Import from the new location

const router = Router();

// ------------------ File serving ------------------
// Public access to files (images/videos stored in GridFS)
router.get('/files/:fileId', apiRateLimit, getFile);

// ------------------ CRUD Routes ------------------
// Create a news item (protected: editors & admins)
router.post(
  '/',
  apiRateLimit,
  authenticate,
  uploadNewsFiles,
  validator(newsCreateSchema),
  asyncHandler(createNews)
);



// Get all news (public)
router.get(
  '/',
  apiRateLimit,
  asyncHandler(getAllNews)
);

// Get a single news item by ID (public)
router.get(
  '/:id',
  apiRateLimit,
  validator(newsIdSchema, { payloadType: 'params' }),
  asyncHandler(getNewsById)
);

// Update news (protected: editors & admins)
router.put(
  '/:id',
  apiRateLimit,
  authenticate,
  uploadNewsFiles, // Handle updated file uploads
  validator(newsCreateSchema), // Optional: validate updated fields
  asyncHandler(updateNews)
);

// Delete news (protected: editors & admins)
router.delete(
  '/:id',
  apiRateLimit,
  authenticate,
  validator(newsIdSchema, { payloadType: 'params' }),
  asyncHandler(deleteNews)
);


export default router;