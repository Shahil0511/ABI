import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import Logger from '../config/logger';
import { IUserCreate, IUser, userCreateSchema, userLoginSchema } from '../models/userModel';
import { MongoDB } from '../config/db';

export const registerUser = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Input validation using Joi schema
    const { error, value } = userCreateSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: error.details[0].message,
      });
      return;
    }//

    // 
    const { name, email, password, role } = value as IUserCreate;

    // 2. Check if user already exists in database
    const db = MongoDB.getConnection();
    const usersCollection = db.collection<IUser>('users');
    // u squar 37 900 6 rose sefish yes sole
    const existingUser = await usersCollection.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // 3. Hash password with secure salt rounds
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create user object with proper data sanitization
    const userData: IUser = {
    
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 5. Save user to database
    const result = await usersCollection.insertOne(userData);
    if (!result.insertedId) {
      throw new Error('Failed to create user in database');
    }

    // Get the inserted ID as string
   

    // 6. Generate JWT token with proper configuration
    const jwtSecret: string = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const tokenPayload = {
      userId: userData._id,
      role: userData.role,
    };
    
    const token = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: process.env.JWT_ISSUER || 'your-app-name',
      audience: process.env.JWT_AUDIENCE || 'your-app-users',
    } as SignOptions);

    // 7. Log successful registration (without sensitive data)
    Logger.info('User registered successfully', {
      userId: userData._id,
      email: userData.email,
      role: userData.role,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });

    // 8. Return sanitized response (never return password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          createdAt: userData.createdAt,
        },
      },
    });
  } catch (error) {
    // 9. Comprehensive error logging
    Logger.error('Registration error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      // Log sanitized request body (remove password)
      requestData: {
        name: req.body?.name,
        email: req.body?.email,
        role: req.body?.role,
      },
    });

    // 10. Handle different error types appropriately
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: error.message,
        });
        return;
      }
      
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
        return;
      }
    }

    // 11. Generic error response (don't expose internal errors)
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again later.',
      ...(process.env.NODE_ENV === 'development' && {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    });
  }
};

export const loginUser = async(
req:Request,
res:Response,
next:NextFunction
):Promise<void> =>{
  try{
      // 1. Validate input
    const  {error, value} = userLoginSchema.validate(req.body);
    if(error){
      res.status(400).json({
        success:false,
        message:'Validation failed',
        error:error.details[0].message,
      });
      return;
    }

    const {email,password}=value;
    // 2. Find user in database
    const db = MongoDB.getConnection();
    const usersCollection = db.collection<IUser>('users');
    const user = await usersCollection.findOne({email:email.toLowerCase().trim()});
 
    if(!user){
      res.status(401).json({
        success:false,
        message: 'Invalid email or password',
      });
      return;
    }
     // 3. Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password', // Same message for security
      });
      return;
    }

    // 4. Generate JWT token

    const jwtSecret:string = process.env.JWT_SECRET || "";
    if(!jwtSecret){
      throw new Error('JWT_SECRET is not configured');
    }

    const tokenPayload = {
      userId : user._id,
      role:user.role,
    }

    const token = jwt.sign(tokenPayload, jwtSecret,{
       expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: process.env.JWT_ISSUER || 'your-app-name',
      audience: process.env.JWT_AUDIENCE || 'your-app-users',
    }as SignOptions);
 // 5. Logging
    Logger.info('User logged in successfully', {
      userId: user._id,
      email: user.email,
      role: user.role,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });

    // 6. Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  }catch (error) {
    Logger.error('Login error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      requestData: {
        email: req.body?.email,
      },
    });

    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again later.',
      ...(process.env.NODE_ENV === 'development' && {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    });
  }
};