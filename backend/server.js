const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// NOTE: express-mongo-sanitize and hpp are incompatible with Express 5
// const mongoSanitize = require('express-mongo-sanitize');
// const hpp = require('hpp');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// ===========================================
// 🔐 SECURITY MIDDLEWARE
// ===========================================

// 1. Helmet - Set security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
}));

// 2. Rate Limiting - Prevent brute force attacks
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per 15 minutes
    message: {
        message: 'Demasiadas solicitudes desde esta IP. Por favor intenta de nuevo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per 15 minutes
    message: {
        message: 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
});

// Apply rate limiting to all requests
app.use(generalLimiter);

// 3. CORS Configuration - Restrict origins in production
const allowedOrigins = isProduction
    ? [process.env.FRONTEND_URL || 'https://stockzavala.com']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

// For development, allow any origin
app.use(cors({
    origin: isProduction ? allowedOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Private network access header (for local network access)
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
    next();
});

// 4. Body Parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Data Sanitization - DISABLED (incompatible with Express 5)
// app.use(mongoSanitize());

// 6. Prevent HTTP Parameter Pollution - DISABLED (incompatible with Express 5)
// app.use(hpp());

// 7. Remove X-Powered-By header
app.disable('x-powered-by');

// ===========================================
// 📊 REQUEST LOGGING (Development only)
// ===========================================
if (!isProduction) {
    app.use((req, res, next) => {
        console.log(`📨 ${req.method} ${req.path}`);
        next();
    });
}

// ===========================================
// 🗄️ DATABASE CONNECTION
// ===========================================
const connectDB = require('./config/db');
connectDB();

// ===========================================
// 🛣️ ROUTES
// ===========================================
const authRoutes = require('./routes/authRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const fixRoutes = require('./routes/fixRoutes');
const reportRoutes = require('./routes/reportRoutes');
const snapshotRoutes = require('./routes/snapshotRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityRoutes = require('./routes/activityRoutes');
const backupRoutes = require('./routes/backupRoutes');

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter, authRoutes);

// Regular routes
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/snapshots', snapshotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/fix', fixRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'StockZavala API is running',
        environment: isProduction ? 'production' : 'development',
        timestamp: new Date().toISOString()
    });
});

// ===========================================
// ❌ ERROR HANDLING
// ===========================================

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);

    // Don't leak error details in production
    const message = isProduction ? 'Error interno del servidor' : err.message;
    const stack = isProduction ? undefined : err.stack;

    res.status(err.status || 500).json({
        message,
        ...(stack && { stack })
    });
});

// ===========================================
// 🚀 START SERVER
// ===========================================
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 ================================');
    console.log('   StockZavala API Server');
    console.log('🚀 ================================');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`🔐 Security: Helmet, Rate Limiting, CORS`);
    console.log(`📡 Local: http://localhost:${PORT}`);
    console.log('🚀 ================================');
    console.log('');
});
