import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import opportunityRoutes from './routes/opportunity.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';
import { AppError } from './errors/AppError';

const app = express();

// Config CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Install Morgan HTTP request logger
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json());

// Base health route (standardized success payload format)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok' }
  });
});

// Register API routers
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/users', userRoutes);

// Catch-all fallback route handler for missing routes
app.all('*', (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// Mount the global error middleware at the end of the pipeline
app.use(errorHandler);

export default app;
