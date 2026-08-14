const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getMyRewards, claimCoupon } = require("../controllers/rewardController");

router.get("/my", auth, getMyRewards);
router.post("/claim-coupon", auth, claimCoupon);

module.exports = router;
