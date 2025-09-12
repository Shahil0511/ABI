
import { Router } from 'express';
import { apiRateLimit } from '../config/rateLimit';
import { validator } from '../middleware/validator';
import {
  userCreateSchema,
  userLoginSchema
} from '../models/userModel';
import {
  loginUser,
  registerUser,
  // loginUser,
  // logoutUser,
  // getCurrentUser

} from '../controllers/userController';

const router = Router();

// Public routes
router.post(
  '/signup',
  apiRateLimit,
  validator(userCreateSchema),
  registerUser

);

router.post(
  '/login',
  apiRateLimit,
  validator(userLoginSchema),
  loginUser

);

// Protected routes (require authentication)
// router.post('/auth/logout', logoutUser);
// router.get('/auth/me', getCurrentUser);

export default router;