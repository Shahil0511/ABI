import Joi from 'joi';

export const healthCheckSchema = Joi.object({
  // Optional detailed flag for extended health check
  detailed: Joi.boolean().default(false),
  
  // Optional services to check
  services: Joi.array().items(Joi.string().valid('database', 'cache', 'storage')),
  
  // Optional timeout
  timeout: Joi.number().integer().min(100).max(5000).default(1000),
}).options({ stripUnknown: true });