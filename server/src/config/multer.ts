import multer from 'multer';
import { Request } from 'express';


// Define custom file filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'videoUrl') {
    // Video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for video uploads!'));
    }
  } else {
    // Image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for image uploads!'));
    }
  }
};

// Create multer instance with configuration
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Define specific upload configurations
export const uploadNewsFiles = upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'videoUrl', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]);

// Export the base upload instance for potential other uses
export default upload;