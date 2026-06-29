function toDateKey(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function calculateStreak(activityDates) {
  if (!activityDates.length) return 0;

  const dateSet = new Set(activityDates);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const cursor = new Date(today);

  if (!dateSet.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dateSet.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

async function recordLearningActivity(prisma, userId) {
  const today = toDateKey();

  await prisma.learningActivity.upsert({
    where: {
      userId_date: { userId, date: today }
    },
    update: {},
    create: { userId, date: today }
  });
}

module.exports = { toDateKey, calculateStreak, recordLearningActivity };
