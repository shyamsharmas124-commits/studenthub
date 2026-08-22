const prisma = require("../utils/prisma");
const notify = require("../utils/notify");

// Points required before a user is eligible to claim a sponsored coupon.
// Points currently come from quiz performance (see quizController) but any
// future point-earning action (course completion, streaks, etc.) feeds the same pool.
const COUPON_POINTS_THRESHOLD = 100;

exports.getMyRewards = async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { userId: req.user.userId },
      orderBy: { earnedAt: "desc" },
    });

    const totalPoints = rewards.reduce((sum, r) => sum + (r.points || 0), 0);

    res.json({
      rewards,
      totalPoints,
      couponsClaimed: rewards.filter((r) => r.type === "COUPON").length,
      nextCouponAt: Math.max(COUPON_POINTS_THRESHOLD - totalPoints, 0),
    });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

exports.claimCoupon = async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { userId: req.user.userId },
    });
    const totalPoints = rewards.reduce((sum, r) => sum + (r.points || 0), 0);

    if (totalPoints < COUPON_POINTS_THRESHOLD) {
      return res.status(400).json({
        msg: `You need ${COUPON_POINTS_THRESHOLD} points to claim a coupon. You have ${totalPoints}.`,
      });
    }

    // Atomically grab one unclaimed coupon so two simultaneous requests can't get the same code
    const coupon = await prisma.sponsoredCoupon.findFirst({
      where: { claimed: false },
    });

    if (!coupon) {
      return res.status(404).json({ msg: "No sponsored coupons are available right now. Check back soon!" });
    }

    const updatedCoupon = await prisma.sponsoredCoupon.updateMany({
      where: { id: coupon.id, claimed: false },
      data: {
        claimed: true,
        claimedByUserId: req.user.userId,
        claimedAt: new Date(),
      },
    });

    // Someone else claimed it between our read and write — ask the user to retry
    if (updatedCoupon.count === 0) {
      return res.status(409).json({ msg: "That coupon was just claimed by someone else. Please try again." });
    }

    await prisma.reward.create({
      data: {
        userId: req.user.userId,
        type: "COUPON",
        coupon: `${coupon.sponsor}: ${coupon.code}`,
        points: 0,
      },
    });

    await notify({
      userId: req.user.userId,
      message: `You claimed a coupon from ${coupon.sponsor}!`,
      type: "ACHIEVEMENT",
    });

    res.json({
      msg: "Coupon claimed successfully",
      sponsor: coupon.sponsor,
      code: coupon.code,
      description: coupon.description,
    });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};
