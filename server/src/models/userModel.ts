// user.model.ts
import Joi from 'joi';
import mongoose, { model, ObjectId, Schema } from 'mongoose';

// Types
export type UserRole = 'user' | 'editor' | 'admin';

export interface IUser {
 _id?: ObjectId;
  name: string;
  email: string;
  password: string; 
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface IUserUpdate {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface IUserLogin {
  email: string;
  password: string;
}

// Validation Schemas using Joi
export const userCreateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  
  role: Joi.string()
    .valid('user', 'editor')
    .default('user')
    .messages({
      'any.only': 'Role must be either "user" or "editor"'
    })
}).options({ stripUnknown: true });

export const userUpdateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 100 characters'
    }),
  
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
  
  role: Joi.string()
    .valid('user', 'editor')
    .messages({
      'any.only': 'Role must be either "user" or "editor"'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
}).options({ stripUnknown: true });

export const userLoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty'
    })
}).options({ stripUnknown: true });

// ID validation schema for params
export const userIdSchema = Joi.object({
  id: Joi.string()
    .guid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.guid': 'Invalid user ID format',
      'any.required': 'User ID is required'
    })
}).options({ stripUnknown: true });

// Query validation schema for user listing
export const userQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  
  role: Joi.string()
    .valid('user', 'editor', 'admin'),
  
  search: Joi.string()
    .trim()
    .min(1)
    .max(100),
  
  sortBy: Joi.string()
    .valid('name', 'email', 'createdAt', 'updatedAt')
    .default('createdAt'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
}).options({ stripUnknown: true });

// Default Values
export const defaultUserCreate: IUserCreate = {
  name: '',
  email: '',
  password: '',
  role: 'user'
};

// Helper Functions
export function isEditor(user: IUser): boolean {
  return user.role === 'editor';
}

export function isAdmin(user: IUser): boolean {
  return user.role === 'admin';
}

export function hasPermission(user: IUser, requiredRole: UserRole): boolean {
  const roleHierarchy = { user: 0, editor: 1, admin: 2 };
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

// Type guards
export function isValidUserRole(role: string): role is UserRole {
  return ['user', 'editor', 'admin'].includes(role);
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['user', 'editor', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
const User = mongoose.models.User || model<IUser>('User', userSchema);
export default User;