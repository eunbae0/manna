import { useAnalytics } from '@/hooks/useAnalytics';

/**
 * Component for tracking screen views in Firebase Analytics
 * 
 * This component should be included in the root layout to track all screen views
 */
export function ScreenTracker() {
  // Use the analytics hook to track screen views
  useAnalytics();
  
  // This component doesn't render anything
  return null;
}
