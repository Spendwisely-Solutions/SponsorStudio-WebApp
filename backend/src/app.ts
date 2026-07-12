import express from 'express';
import cors from 'cors';
import opportunityRoutes from './routes/opportunity.routes';

const app = express();

// Config CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());

// Base health route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Register API routers
app.use('/api/opportunities', opportunityRoutes);

export default app;
