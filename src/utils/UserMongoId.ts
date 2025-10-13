// src/utils/userMongoId.ts
/**
 * Helper to manage MongoDB ObjectId for users
 * 
 * TEMPORARY SOLUTION: This creates a deterministic ObjectId from SQL user_id
 * LONG-TERM: User service should provide mongo_id during login
 */

/**
 * Generates a valid MongoDB ObjectId (24 hex characters) from an integer user ID
 * Format: 8 hex timestamp + 10 hex random + 6 hex counter
 * We'll use a deterministic approach for consistency
 */
export function generateMongoIdFromUserId(userId: string | number): string {
  const userIdStr = String(userId);
  
  // Check if we already have a stored mongo_id for this user
  const storedId = localStorage.getItem(`user_${userIdStr}_mongo_id`);
  if (storedId && isValidObjectId(storedId)) {
    return storedId;
  }
  
  // Generate a deterministic ObjectId based on user_id
  // This ensures the same user always gets the same MongoDB ID
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const userPart = parseInt(userIdStr).toString(16).padStart(16, '0');
  const mongoId = (timestamp + userPart).slice(0, 24);
  
  // Store it for future use
  localStorage.setItem(`user_${userIdStr}_mongo_id`, mongoId);
  
  console.log(`Generated MongoDB ObjectId for user ${userIdStr}:`, mongoId);
  console.warn('⚠️ Using generated ObjectId. Update login service to provide mongo_id');
  
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
  // Try to get the explicitly stored mongo_id (from login)
  const explicitMongoId = localStorage.getItem('user_mongo_id');
  if (explicitMongoId && isValidObjectId(explicitMongoId)) {
    return explicitMongoId;
  }
  
  // Get the SQL user_id
  const userId = localStorage.getItem('user_id');
  if (!userId) {
    console.error('No user_id found in localStorage! User not logged in?');
    throw new Error('User not logged in');
  }
  
  // Generate/retrieve deterministic MongoDB ID
  return generateMongoIdFromUserId(userId);
}

/**
 * Call this when user logs in to store their MongoDB ObjectId
 * Add this to your login success handler
 */
export function setUserMongoId(mongoId: string): void {
  if (!isValidObjectId(mongoId)) {
    console.error('Invalid MongoDB ObjectId:', mongoId);
    return;
  }
  localStorage.setItem('user_mongo_id', mongoId);
}

/**
 * Clear user MongoDB ID on logout
 */
export function clearUserMongoId(): void {
  localStorage.removeItem('user_mongo_id');
  // Also clear any generated IDs
  const userId = localStorage.getItem('user_id');
  if (userId) {
    localStorage.removeItem(`user_${userId}_mongo_id`);
  }
}