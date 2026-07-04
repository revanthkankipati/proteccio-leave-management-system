import app from './app';
import { config } from './config';
import prisma from './config/prisma';

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`API Docs: http://localhost:${config.port}/api-docs`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
