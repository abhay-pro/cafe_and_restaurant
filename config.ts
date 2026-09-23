/**
 * Global Configuration - Centralized app configuration
 * All sensitive values and global constants should be kept here
 * 
 * NOTE: For production, move API keys to environment variables (.env file)
 * Never commit real API keys to version control
 */

// Application configuration
export const APP_NAME = "CafeDelight";
export const APP_DESC = "Premium Cafe & Restaurant";
export const APP_VERSION = "1.0.0";
export const APP_URL = "http://localhost:3000";

// Security settings
export const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
export const RATE_LIMIT_MAX = 100; // max requests per window
export const CORS_ORIGIN = "*"; // Adjust for production

// API keys (for future backend integration - keep secure in production)
// In production, use: OPENAI_KEY=sk-... STRIPE_KEY=sk_test_... in .env file
export const API_KEYS = {
  // These are placeholder keys - in production, use environment variables
  openai: process.env.OPENAI_KEY || "sk-demo-openai-key",
  stripe: process.env.STRIPE_KEY || "sk_test_demo_stripe_key",
};

// Feature flags
export const FEATURES = {
  enableReviews: true,
  enableTiming: true,
  enableOrderTracking: true,
};

// Contact info
export const CONTACT = {
  email: "contact@cafedelight.com",
  phone: "+1-555-CAFE-DEL",
  address: "123 Food Street, Gourmet City",
};

// Menu categories
export const CATEGORIES = [
  { id: "coffee", label: "Coffee & Tea" },
  { id: "tea", label: "Tea" },
  { id: "food", label: "Food" },
  { id: "dessert", label: "Desserts" },
  { id: "drinks", label: "Cold Drinks" },
];

// Export for easy access
export default {
  name: APP_NAME,
  desc: APP_DESC,
  version: APP_VERSION,
  url: APP_URL,
  categories: CATEGORIES,
};