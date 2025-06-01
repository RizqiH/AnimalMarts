import { VercelRequest, VercelResponse } from '@vercel/node';

// Import app dari server.ts (yang sudah export app)
let app: any;

try {
  // Import dari server.ts yang sudah export app
  app = require('../src/server').default;
  console.log('Successfully imported app from server.ts');
} catch (error) {
  console.error('Failed to import app from server:', error);
  try {
    // Fallback ke app.ts langsung
    app = require('../src/app').default;
    console.log('Successfully imported app from app.ts');
  } catch (error2) {
    console.error('Failed to import app:', error2);
  }
}

// Tambahkan route root jika app berhasil di-load
if (app) {
  // Tambahkan route root yang tidak ada di app.ts
  app.get('/', (req: any, res: any) => {
    res.status(200).json({
      success: true,
      message: 'AnimalMart Backend API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      endpoints: {
        health: '/health',
        products: '/api/products',
        orders: '/api/orders',
        upload: '/api/upload',
        cart: '/api/cart',
        payments: '/api/payments'
      }
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`${req.method} ${req.url}`);

  // Set CORS headers yang sesuai dengan app.ts
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? 'https://animal-marts.vercel.app' 
    : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Jika app tidak berhasil di-import, berikan response manual
  if (!app) {
    console.error('App not loaded, providing fallback response');
    
    if (req.url === '/') {
      return res.status(200).json({
        success: true,
        message: 'AnimalMart Backend API (Fallback)',
        error: 'App not loaded properly',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server configuration error',
      error: 'APP_NOT_LOADED'
    });
  }

  try {
    // Set environment to production untuk Vercel
    process.env.NODE_ENV = 'production';
    
    // Gunakan Express app untuk handle request
    return app(req, res);
    
  } catch (error) {
    console.error('Handler error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}