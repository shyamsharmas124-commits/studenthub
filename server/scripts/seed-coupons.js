// Run with: node scripts/seed-coupons.js
// Adds sample sponsored coupons for students/teachers to claim once they cross
// the points threshold. Replace with real sponsor codes before going live.
require("dotenv").config();
const prisma = require("../src/utils/prisma");

const coupons = [
  { sponsor: "Skillshare", code: "STUDENTHUB-SS-2026", description: "1 month free premium membership" },
  { sponsor: "JetBrains", code: "STUDENTHUB-JB-2026", description: "Free student license for all IDEs" },
  { sponsor: "Notion", code: "STUDENTHUB-NOTION-2026", description: "6 months of Notion Plus" },
  { sponsor: "Canva", code: "STUDENTHUB-CANVA-2026", description: "3 months of Canva Pro" },
];

async function main() {
  for (const c of coupons) {
    await prisma.sponsoredCoupon.create({ data: c });
  }
  console.log(`Seeded ${coupons.length} sponsored coupons.`);
}

main()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
