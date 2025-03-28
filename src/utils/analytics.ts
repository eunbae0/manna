import analytics from '@react-native-firebase/analytics';

/**
 * Utility functions for Firebase Analytics
 */

/**
 * Log a custom event to Firebase Analytics
 * 
 * @param eventName - Name of the event to log
 * @param params - Optional parameters to include with the event
 */
export async function logEvent(
  eventName: string, 
  params?: Record<string, string | number | boolean | null | undefined>
): Promise<void> {
  try {
    await analytics().logEvent(eventName, params);
    console.log(`[Analytics] Event logged: ${eventName}`, params);
  } catch (error) {
    console.error('[Analytics] Error logging event:', error);
  }
}

/**
 * Log a user property to Firebase Analytics
 * 
 * @param name - Name of the user property
 * @param value - Value of the user property
 */
export async function setUserProperty(
  name: string, 
  value: string
): Promise<void> {
  try {
    await analytics().setUserProperty(name, value);
    console.log(`[Analytics] User property set: ${name}=${value}`);
  } catch (error) {
    console.error('[Analytics] Error setting user property:', error);
  }
}

/**
 * Set the user ID for Firebase Analytics
 * 
 * @param userId - User ID to set
 */
export async function setUserId(userId: string | null): Promise<void> {
  try {
    await analytics().setUserId(userId);
    console.log(`[Analytics] User ID set: ${userId}`);
  } catch (error) {
    console.error('[Analytics] Error setting user ID:', error);
  }
}

/**
 * Common analytics events for the app
 */
export const AnalyticsEvents = {
  // User actions
  USER_LOGIN: 'user_login',
  USER_SIGNUP: 'user_signup',
  USER_LOGOUT: 'user_logout',
  
  // Content interactions
  VIEW_FELLOWSHIP: 'view_fellowship',
  CREATE_FELLOWSHIP: 'create_fellowship',
  VIEW_NOTE: 'view_note',
  CREATE_NOTE: 'create_note',
  
  // Group actions
  JOIN_GROUP: 'join_group',
  CREATE_GROUP: 'create_group',
  
  // Worship type actions
  ADD_WORSHIP_TYPE: 'add_worship_type',
  SELECT_WORSHIP_TYPE: 'select_worship_type',
  
  // App usage
  APP_OPEN: 'app_open',
  APP_ERROR: 'app_error',
};
