// services/newsService.ts
import { GridFS } from '../config/gridfs';
import { Readable } from 'stream';
import path from 'path';
import News from '../models/newsModel';
import mongoose from 'mongoose';

const uploadToGridFS = (file: Express.Multer.File, filename: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const bucket = GridFS.getBucket();
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadDate: new Date()
      }
    });

    const readableStream = new Readable();
    readableStream.push(file.buffer);
    readableStream.push(null);

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => resolve(uploadStream.id.toString()));

    readableStream.pipe(uploadStream);
  });
};

export const newsService = {
  async processFiles(files: { [fieldname: string]: Express.Multer.File[] }) {
    const processed: Record<string, any> = {};

    if (files.featuredImage?.[0]) {
      const f = files.featuredImage[0];
      const name = `featured-${Date.now()}-${Math.random()}${path.extname(f.originalname)}`;
      processed.featuredImage = await uploadToGridFS(f, name);
    }

    if (files.videoUrl?.[0]) {
      const f = files.videoUrl[0];
      const name = `video-${Date.now()}-${Math.random()}${path.extname(f.originalname)}`;
      processed.videoUrl = await uploadToGridFS(f, name);
    }

    if (files.galleryImages?.length) {
      processed.galleryImages = await Promise.all(
        files.galleryImages.map((f, i) => {
          const name = `gallery-${Date.now()}-${i}-${Math.random()}${path.extname(f.originalname)}`;
          return uploadToGridFS(f, name);
        })
      );
    }

    return processed;
  },

  async createNews(data: any, userId: string) {
    const news = new News({
      ...data,
      author: new mongoose.Types.ObjectId(userId),
      likes: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(data.status === 'published' && { publishedAt: new Date() })
    });

    return news.save();
  }
};
