import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import departmentHeadRoutes from './routes/department-head.routes.js';
import hrRoutes from './routes/hr.routes.js';
import candidateRoutes from './routes/candidate.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import passport from 'passport';
import session from 'express-session'
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import testRoutes from './routes/test.routes.js';
import fs from 'fs';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
const profilePicturesDir = path.join(uploadsDir, 'profile-pictures');

// Créer les dossiers s'ils n'existent pas
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir);
  console.log('Created profile-pictures directory');
}

// Vérifier les permissions
try {
  fs.accessSync(profilePicturesDir, fs.constants.W_OK);
  console.log('Upload directory is writable');
} catch (err) {
  console.error('Upload directory is not writable:', err);
}

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(passport.initialize());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

// Configurer les dossiers statiques - mettre ceci AVANT les routes
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/api/uploads', express.static(uploadsPath));

// Logger pour débugger les requêtes de fichiers
app.use('/api/uploads', (req, res, next) => {
  console.log('Static file request:', {
    url: req.url,
    originalUrl: req.originalUrl,
    path: path.join(uploadsPath, req.url)
  });
  next();
});

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log('\nIncoming request:');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  next();
});

// Update the static file serving configuration
app.use('/api/auth/upload', express.static(path.join(__dirname, 'uploads')));

// Remove any duplicate static file configurations
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/api/uploads', express.static(uploadsPath));

// Add this debug middleware right after the static file configurations
app.use((req, res, next) => {
  console.log('Request path:', req.path);
  console.log('Full URL:', req.originalUrl);
  console.log('Looking for file in:', path.join(__dirname, 'uploads', req.path));
  next();
});

// Test root route
app.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// Debug route to see if Express is working
app.get('/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint',
    routes: app._router.stack
      .filter(r => r.route)
      .map(r => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods)
      }))
  });
});

// Routes
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/department-heads', departmentHeadRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/users', userRoutes);

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 for URL:', req.url);
  res.status(404).json({
    message: 'Route not found',
    path: req.url
  });
});

// Gestionnaire d'erreurs pour multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large' });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Start listening
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Test API at: http://localhost:${PORT}/api/test`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer(); 