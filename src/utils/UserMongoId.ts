// src/utils/userMongoId.ts
/**
 * Helper to manage MongoDB ObjectId for users
 * 
 * TEMPORARY SOLUTION: This creates a deterministic ObjectId from SQL user_id
 * LONG-TERM: User service should provide mongo_id during login
 */

/**
 * Generates a valid MongoDB ObjectId (24 hex characters) from an integer user ID
 * Format: Deterministic hex encoding of the user ID string
 * 
 * IMPORTANT: This is DETERMINISTIC and does NOT use localStorage to ensure
 * consistency across sessions and prevent sync issues.
 * 
 * TEMPORARY SOLUTION - Long-term: User service should provide mongo_id during login
 */
export function generateMongoIdFromUserId(userId: string | number): string {
  const userIdStr = String(userId);
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // During SSR/build time, return a placeholder
    return '000000000000000000000000';
  }
  
  // Generate a deterministic ObjectId based on user_id string only
  // Encode the userId string to hex, repeat/pad and slice to 24 chars
  const hexFromString = [...userIdStr].map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  let mongoId = hexFromString;
  while (mongoId.length < 24) {
    mongoId += hexFromString;
  }
  mongoId = mongoId.slice(0, 24);
  
  // DO NOT store in localStorage - this must be deterministic across all sessions
  
  return mongoId;
}

/**
 * Validates if a string is a valid MongoDB ObjectId (24 hex characters)
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Gets the user's MongoDB ObjectId from localStorage or generates one
 */
export function getUserMongoId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // During SSR/build time, return a placeholder
    return '000000000000000000000000';
  }
  
  // Try to get the explicitly stored mongo_id (from login)
  const explicitMongoId = localStorage.getItem('user_mongo_id');
  if (explicitMongoId && isValidObjectId(explicitMongoId)) {
    return explicitMongoId;
  }
  
  // Get the SQL user_id
  const userId = localStorage.getItem('user_id');
  if (!userId) {
    console.warn('No user_id found in localStorage! Using default MongoDB ID for testing.');
    // Use a valid default MongoDB ObjectID for testing (24 hex chars)
    return '507f1f77bcf86cd799439011';
  }
  
  // Generate/retrieve deterministic MongoDB ID
  const mongoId = generateMongoIdFromUserId(userId);
  
  // Validate the generated ID
  if (!isValidObjectId(mongoId)) {
    console.error('Generated invalid MongoDB ID:', mongoId);
    // Return valid default
    return '507f1f77bcf86cd799439011';
  }
  
  return mongoId;
}

/**
 * Call this when user logs in to store their MongoDB ObjectId
 * Add this to your login success handler
 */
export function setUserMongoId(mongoId: string): void {
  if (typeof window === 'undefined') return; // Skip during SSR
  
  if (!isValidObjectId(mongoId)) {
    console.error('Invalid MongoDB ObjectId:', mongoId);
    return;
  }
  localStorage.setItem('user_mongo_id', mongoId);
}

/**
 * Clear user MongoDB ID on logout
 * Only clears the explicitly set mongo_id (from login), not generated IDs
 */
export function clearUserMongoId(): void {
  if (typeof window === 'undefined') return; // Skip during SSR
  
  localStorage.removeItem('user_mongo_id');
  // Note: We no longer store generated IDs in localStorage to ensure
  // deterministic ID generation across all sessions
}

/**
 * Generates a valid MongoDB ObjectId (24 hex characters) from a dashboard ID
 * Similar to user ID conversion but for dashboards
 * 
 * IMPORTANT: This is DETERMINISTIC and does NOT use localStorage to ensure
 * all users/sessions generate the same MongoDB ID for the same dashboard.
 * This prevents WebSocket sync issues between different browser sessions.
 */
export function getDashboardMongoId(dashboardId: string | number): string {
  const dashboardIdStr = String(dashboardId);
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return '000000000000000000000000';
  }
  
  // Generate a deterministic ObjectId based on dashboard_id string only
  // Convert each character to its hex ASCII code
  const hexFromString = [...dashboardIdStr].map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  
  // Repeat the hex string until we have at least 24 characters, then slice to exactly 24
  let mongoId = hexFromString;
  while (mongoId.length < 24) {
    mongoId += hexFromString;
  }
  mongoId = mongoId.slice(0, 24);
  
  // DO NOT store in localStorage - this must be deterministic across all sessions
  // to ensure all users connect to the same WebSocket room for the same dashboard
  
  return mongoId;
}