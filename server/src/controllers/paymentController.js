// Payment gateway integration. StudentHub itself stays free — this exists so
// sponsors/supporters can fund coupon pools (see rewardController.js) via a
// real Stripe Checkout session. Entirely opt-in: without STRIPE_SECRET_KEY
// set, this route responds 503 instead of crashing the server, so nothing
// else in the app is affected either way.

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  try {
    const Stripe = require("stripe");
    return new Stripe(process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    console.warn("stripe package not installed — payment routes disabled. Run `npm install` to enable.");
    return null;
  }
}

exports.createSupportCheckout = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      msg: "Payments aren't configured on this deployment yet (STRIPE_SECRET_KEY missing).",
    });
  }

  try {
    const { amount } = req.body; // amount in whole currency units, e.g. 5 = $5
    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount < 1) {
      return res.status(400).json({ msg: "Provide a support amount of at least 1." });
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Support StudentHub",
              description: "Funds sponsored coupons distributed to active students and teachers.",
            },
            unit_amount: Math.round(parsedAmount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${clientUrl}/support/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/support/cancelled`,
      metadata: { userId: req.user?.userId || "guest" },
    });

    res.json({ checkoutUrl: session.url });
  } catch (err) {
    console.log("PAYMENT ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Stripe webhook: when a support payment succeeds, mint a bonus sponsored
// coupon so it flows straight into the existing reward system.
exports.handleWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(503).end();

  try {
    const prisma = require("../utils/prisma");
    const sig = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await prisma.sponsoredCoupon.create({
        data: {
          sponsor: "Community Supporter",
          code: `SUPPORTER-${session.id.slice(-8).toUpperCase()}`,
          description: "Funded by a platform supporter — thank you!",
        },
      });
    }

    res.json({ received: true });
  } catch (err) {
    console.log("WEBHOOK ERROR:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
