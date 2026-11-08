const dotenv = require('dotenv');

// Load environment variables before any other imports
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5003;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[Server] Notes App Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection] ${err.message}`);
      server.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
      console.log('[Server] SIGTERM received. Shutting down gracefully...');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error(`[Server Startup Error] ${error.message}`);
    process.exit(1);
  }
};

startServer();

