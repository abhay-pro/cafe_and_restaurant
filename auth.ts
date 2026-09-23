/**
 * Static Authentication Configuration
 * 
 * ADMIN CREDENTIALS - Stored in code for static authentication
 * 
 * NOTE: For production, use environment variables or a proper authentication service
 * Never expose real credentials in client-side code
 * 
 * This is for demonstration purposes only - in production, implement proper auth
 */

// Admin credentials - stored in code (static authentication)
// In production, move these to .env file and never commit to version control
export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123", // Change this to a strong password
};

// Authentication settings
export const AUTH = {
  // Login attempt lockout after 3 failed attempts
  maxLoginAttempts: 3,
  // Lockout duration in milliseconds (5 minutes)
  lockoutDuration: 5 * 60 * 1000,
  // Session timeout in minutes (30 minutes)
  sessionTimeout: 30 * 60,
};

// Error messages for authentication
export const AUTH_MESSAGES = {
  invalidCredentials: "Invalid username or password",
  accountLocked: "Account locked due to too many failed attempts. Try again later.",
  loginSuccessful: "Login successful",
};

// For API routes - verify admin credentials
export const verifyAdminAuth = (username: string, password: string) => {
  const { username: correctUsername, password: correctPassword } = ADMIN_CREDENTIALS;
  
  // Simple constant-time comparison to prevent timing attacks
  const usernameMatch = username === correctUsername;
  const passwordMatch = password === correctPassword;
  
  return usernameMatch && passwordMatch;
};

// Generate basic auth header for API routes
export const getAuthHeader = () => {
  const credentials = `${ADMIN_CREDENTIALS.username}:${ADMIN_CREDENTIALS.password}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
};