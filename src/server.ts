import dotenv from 'dotenv';
import app from './app.js';
import logger from './logger.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    // Start the server
    app.listen(PORT, () => {
      logger.info(`🚀 TalentMatch AI API Server running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`⏰ Started at: ${new Date().toISOString()}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('🔄 SIGTERM received, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('🔄 SIGINT received, shutting down gracefully');
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
