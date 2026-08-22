const cron = require('node-cron');
const prisma = require('../utils/prisma');

const startCronJobs = () => {
  // Run every day at midnight to clean up notifications older than 30 days
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cron job: Clean up old notifications');
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
        },
      });
      console.log(`Deleted ${result.count} old notifications.`);
    } catch (error) {
      console.error('Error in cleanup cron job:', error);
    }
  });
};

module.exports = { startCronJobs };
