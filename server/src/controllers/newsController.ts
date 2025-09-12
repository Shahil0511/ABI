import { Request, Response } from 'express';
import mongoose from 'mongoose';
import News from '../models/newsModel';
import { newsCreateSchema, newsIdSchema } from '../models/newsModel';
import { newsService } from '../services/newsService';
import { GridFS } from '../config/gridfs';

// ------------------ CREATE ------------------
export const createNews = async (req: Request, res: Response): Promise<void> => {
  try {

    let processedBody = { ...req.body };

    // Normalize tags
    if (typeof processedBody.tags === 'string') {
      try {
        processedBody.tags = JSON.parse(processedBody.tags);
      } catch {
        processedBody.tags = [processedBody.tags];
      }
    } else {
      processedBody.tags = [];
    }

    // Parse readTime → number
    if (processedBody.readTime) {
      processedBody.readTime = Number(processedBody.readTime);
    }

    // Process files (GridFS upload)
    const fileData = await newsService.processFiles(req.files as any);
    processedBody = { ...processedBody, ...fileData };

    // Validate
    const { error, value } = newsCreateSchema.validate(processedBody);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
      return;
    }

    // Permission check
    const user = (req as any).user;
    if (!user || !['editor', 'admin'].includes(user.role)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    // Save
    const savedNews = await newsService.createNews(value, user.id);
    await savedNews.populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'News created successfully',
      data: savedNews
    });
  } catch (err: any) {
    console.error('Error creating news:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ------------------ GET ALL ------------------
export const getAllNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const newsList = await News.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: newsList.length,
      data: newsList
    });
  } catch (err: any) {
    console.error('Error fetching news:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ------------------ GET BY ID ------------------
export const getNewsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = newsIdSchema.validate({ id });
    if (error) {
      res.status(400).json({ success: false, message: 'Invalid ID' });
      return;
    }

    const news = await News.findById(id).populate('author', 'name email');
    if (!news) {
      res.status(404).json({ success: false, message: 'News not found' });
      return;
    }

    res.json({ success: true, data: news });
  } catch (err: any) {
    console.error('Error fetching news:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ------------------ UPDATE ------------------
export const updateNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let processedBody = { ...req.body };

    // Normalize tags
    if (typeof processedBody.tags === 'string') {
      try {
        processedBody.tags = JSON.parse(processedBody.tags);
      } catch {
        processedBody.tags = [processedBody.tags];
      }
    }

    // Parse readTime → number
    if (processedBody.readTime) {
      processedBody.readTime = Number(processedBody.readTime);
    }

    // Process uploaded files (replace if new ones provided)
    const fileData = await newsService.processFiles(req.files as any);
    processedBody = { ...processedBody, ...fileData };

    // Validate
    const { error, value } = newsCreateSchema.validate(processedBody, { allowUnknown: true });
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
      return;
    }

    const updatedNews = await News.findByIdAndUpdate(
      id,
      { ...value, updatedAt: new Date() },
      { new: true }
    ).populate('author', 'name email');

    if (!updatedNews) {
      res.status(404).json({ success: false, message: 'News not found' });
      return;
    }

    res.json({ success: true, message: 'News updated successfully', data: updatedNews });
  } catch (err: any) {
    console.error('Error updating news:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ------------------ DELETE ------------------
export const deleteNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await News.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'News not found' });
      return;
    }

    res.json({ success: true, message: 'News deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting news:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ------------------ FILE SERVING ------------------
export const getFile = async (req: Request, res: Response) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);


    const db = mongoose.connection.db;
if (!db) {
  throw new Error('Database connection not established');
}

const bucket = new mongoose.mongo.GridFSBucket(db, {
  bucketName: "uploads",
});

    // Set headers BEFORE streaming
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); 
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    bucket.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    res.status(404).json({ success: false, message: "File not found" });
  }
};
