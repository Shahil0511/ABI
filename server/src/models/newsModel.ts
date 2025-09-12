import Joi from 'joi';
import mongoose, { model, ObjectId, Schema } from 'mongoose';

// Types
export type ContentType = 'article' | 'video' | 'short' | 'gallery' | 'podcast';
export type NewsStatus = 'draft' | 'published' | 'archived';

export interface INews {
  _id?: ObjectId;
  title: string;
  summary: string;
  content: string;
  contentType: ContentType;
  tags: string[];
  category: string;
  subcategory: string;
  author: ObjectId; // Reference to User
  status: NewsStatus;
  featuredImage?: string;
  videoUrl?: string;
  galleryImages?: string[];
  readTime: number; // in minutes
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface INewsCreate {
  title: string;
  summary: string;
  content: string;
  contentType: ContentType;
  tags: string[];
  category: string;
  subcategory: string;
  author: ObjectId;
  status?: NewsStatus;
  featuredImage?: string;
  videoUrl?: string;
  galleryImages?: string[];
  readTime?: number;
}

export interface INewsUpdate {
  title?: string;
  summary?: string;
  content?: string;
  contentType?: ContentType;
  tags?: string[];
  category?: string;
  subcategory?: string;
  status?: NewsStatus;
  featuredImage?: string;
  videoUrl?: string;
  galleryImages?: string[];
  readTime?: number;
}

// Validation Schemas using Joi
export const newsCreateSchema = Joi.object({
  title: Joi.string().min(5).max(200).trim().required().messages({
    'string.min': 'Title must be at least 5 characters',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required'
  }),
  
  summary: Joi.string().min(10).max(300).trim().required().messages({
    'string.min': 'Summary must be at least 10 characters',
    'string.max': 'Summary must not exceed 300 characters',
    'any.required': 'Summary is required'
  }),
  
  content: Joi.string().min(50).required().messages({
    'string.min': 'Content must be at least 50 characters',
    'any.required': 'Content is required'
  }),
  
  contentType: Joi.string()
    .valid('article', 'video', 'short', 'gallery', 'podcast')
    .required()
    .messages({
      'any.only': 'Content type must be one of: article, video, short, gallery, podcast',
      'any.required': 'Content type is required'
    }),
  
  // Fixed: Allow both string and array for tags
tags: Joi.alternatives().try(
  Joi.string().custom((value, helpers) => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      return [parsed]; // single string
    } catch {
      return [value]; // fallback if plain string
    }
  }),
  Joi.array().items(Joi.string().min(1).max(50))
).required().messages({
    'any.required': 'Tags are required'
  }),
  
  category: Joi.string().min(1).max(50).trim().required().messages({
    'string.min': 'Category must be at least 1 character',
    'string.max': 'Category must not exceed 50 characters',
    'any.required': 'Category is required'
  }),
  
  subcategory: Joi.string().min(1).max(50).trim().required().messages({
    'string.min': 'Subcategory must be at least 1 character',
    'string.max': 'Subcategory must not exceed 50 characters',
    'any.required': 'Subcategory is required'
  }),
  
  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .default('draft')
    .messages({
      'any.only': 'Status must be one of: draft, published, archived'
    }),
  
  // These will be handled as uploaded files, not validation needed here
  featuredImage: Joi.any().optional(),
  videoUrl: Joi.any().optional(),
  galleryImages: Joi.any().optional(),
  
  readTime: Joi.number()
    .integer()
    .min(1)
    .default(5)
    .messages({
      'number.min': 'Read time must be at least 1 minute',
      'number.integer': 'Read time must be a whole number'
    }),
    
  // Remove currentTag from validation - it's only for frontend
  currentTag: Joi.any().optional()
}).options({ stripUnknown: true });

export const newsUpdateSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .trim()
    .messages({
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title must not exceed 200 characters'
    }),
  
  summary: Joi.string()
    .min(10)
    .max(300)
    .trim()
    .messages({
      'string.min': 'Summary must be at least 10 characters',
      'string.max': 'Summary must not exceed 300 characters'
    }),
  
  content: Joi.string()
    .min(50)
    .messages({
      'string.min': 'Content must be at least 50 characters'
    }),
  
  contentType: Joi.string()
    .valid('article', 'video', 'short', 'gallery', 'podcast')
    .messages({
      'any.only': 'Content type must be one of: article, video, short, gallery, podcast'
    }),
  
  tags: Joi.alternatives().try(
    Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          return helpers.error('any.invalid');
        }
        if (parsed.length < 1 || parsed.length > 10) {
          return helpers.error('array.length');
        }
        return parsed;
      } catch {
        return helpers.error('any.invalid');
      }
    }).messages({
      'any.invalid': 'Tags must be a valid JSON array',
      'array.length': 'Tags must contain 1-10 items'
    }),
    Joi.array().items(Joi.string().min(1).max(50)).min(1).max(10)
  ),
  
  category: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .messages({
      'string.min': 'Category must be at least 1 character',
      'string.max': 'Category must not exceed 50 characters'
    }),
  
  subcategory: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .messages({
      'string.min': 'Subcategory must be at least 1 character',
      'string.max': 'Subcategory must not exceed 50 characters'
    }),
  
  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .messages({
      'any.only': 'Status must be one of: draft, published, archived'
    }),
  
  featuredImage: Joi.any().optional(),
  videoUrl: Joi.any().optional(),
  galleryImages: Joi.any().optional(),
  
  readTime: Joi.number()
    .integer()
    .min(1)
    .messages({
      'number.min': 'Read time must be at least 1 minute',
      'number.integer': 'Read time must be a whole number'
    }),
    
  currentTag: Joi.any().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
}).options({ stripUnknown: true });

// ID validation schema for params
export const newsIdSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({
      'any.required': 'News ID is required'
    })
}).options({ stripUnknown: true });

// Query validation schema for news listing
export const newsQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  
  contentType: Joi.string()
    .valid('article', 'video', 'short', 'gallery', 'podcast'),
  
  category: Joi.string()
    .min(1)
    .max(50),
  
  subcategory: Joi.string()
    .min(1)
    .max(50),
  
  tags: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  
  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .default('published'),
  
  author: Joi.string(),
  
  search: Joi.string()
    .trim()
    .min(1)
    .max(100),
  
  sortBy: Joi.string()
    .valid('title', 'createdAt', 'updatedAt', 'publishedAt', 'views', 'likes', 'readTime')
    .default('createdAt'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
  
  featured: Joi.boolean()
}).options({ stripUnknown: true });

// Mongoose Schema
const newsSchema = new Schema<INews>({
  title: { type: String, required: true, trim: true },
  summary: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  contentType: { 
    type: String, 
    enum: ['article', 'video', 'short', 'gallery', 'podcast'], 
    required: true 
  },
  tags: { type: [String], required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  featuredImage: { type: String },
  videoUrl: { type: String },
  galleryImages: [{ type: String }],
  readTime: { type: Number, default: 5 },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date }
});

// Pre-save middleware to update publishedAt
newsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Create model
const News = mongoose.models.News || model<INews>('News', newsSchema);

// Helper Functions
export function isPublished(news: INews): boolean {
  return news.status === 'published';
}

export function isVideoContent(news: INews): boolean {
  return news.contentType === 'video';
}

export function isShortContent(news: INews): boolean {
  return news.contentType === 'short';
}

export function filterByTags(newsItems: INews[], tags: string[]): INews[] {
  return newsItems.filter(item => 
    tags.some(tag => item.tags.includes(tag))
  );
}

export function filterByContentType(newsItems: INews[], contentType: ContentType): INews[] {
  return newsItems.filter(item => item.contentType === contentType);
}

export function getPopularNews(newsItems: INews[], limit: number = 10): INews[] {
  return [...newsItems]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export function getRecentNews(newsItems: INews[], limit: number = 10): INews[] {
  return [...newsItems]
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
    .slice(0, limit);
}

// Type guards
export function isValidContentType(type: string): type is ContentType {
  return ['article', 'video', 'short', 'gallery', 'podcast'].includes(type);
}

export function isValidNewsStatus(status: string): status is NewsStatus {
  return ['draft', 'published', 'archived'].includes(status);
}

export default News;