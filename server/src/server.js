const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start listening
connectDB()
  .then(async () => {
    // Auto-seed demo data if demo account does not exist
    try {
      const User = require('./models/User');
      const demoExists = await User.findOne({ email: 'demo@devtrack.io' });
      if (!demoExists) {
        console.log('[DevTrack] Demo user not found. Auto-seeding initial demo data...');
        const { populateDemoData } = require('./seed');
        await populateDemoData();
        console.log('[DevTrack] Demo account and sample data auto-seeded successfully.');
      }
    } catch (seedErr) {
      console.warn('[DevTrack] Demo account auto-seed notice:', seedErr.message);
    }

    const server = app.listen(PORT, () => {
      console.log(`[DevTrack] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Graceful shutdown handler for zero-downtime rolling deploys (Render/Kubernetes/Docker)
    const handleShutdown = async (signal) => {
      console.log(`[DevTrack] ${signal} signal received. Closing HTTP server and database connections...`);
      server.close(async () => {
        try {
          await disconnectDB();
          console.log('[DevTrack] Clean shutdown completed. Exiting process.');
          process.exit(0);
        } catch (err) {
          console.error('[DevTrack] Error during database disconnect:', err.message);
          process.exit(1);
        }
      });

      // Force shutdown after 10s if connections refuse to drain
      setTimeout(() => {
        console.error('[DevTrack] Force shutdown triggered after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[DevTrack Unhandled Rejection]: ${err.message}`);
    });
  })
  .catch((err) => {
    console.error(`[DevTrack Fatal] Database connection failed: ${err.message}`);
    process.exit(1);
  });
