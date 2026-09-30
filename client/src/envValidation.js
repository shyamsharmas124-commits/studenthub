/**
 * Client-side Environment Variable Validation
 * Ensures required VITE_ variables are present at build/runtime.
 */
export function validateEnv() {
  const missing = [];

  // VITE_API_URL is highly recommended, though axios.js falls back to localhost.
  if (!import.meta.env.VITE_API_URL) {
    console.warn(
      "⚠️ VITE_API_URL is missing! The app will fall back to http://localhost:5000/api which will fail in production."
    );
  }

  // Add any other required variables here
  // if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) missing.push("VITE_STRIPE_PUBLIC_KEY");

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required client environment variables: ${missing.join(", ")}`
    );
  }

  console.log("✅ Client environment validated.");
}
