const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { createSupportCheckout, handleWebhook } = require("../controllers/paymentController");

router.post("/support-checkout", auth, createSupportCheckout);

// Note: Stripe webhook signature verification needs the RAW request body,
// not JSON-parsed. This route is wired here for completeness, but before
// going live you'd exclude "/api/payment/webhook" from the global
// express.json() middleware in index.js and instead parse it with
// express.raw({ type: "application/json" }) — otherwise
// stripe.webhooks.constructEvent() will fail signature verification.
router.post("/webhook", handleWebhook);

module.exports = router;
