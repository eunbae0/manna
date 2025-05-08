import { useEffect } from 'react';
import { getAnalytics } from '@react-native-firebase/analytics';
import { usePathname, useSegments } from 'expo-router';

/**
 * Custom hook for tracking screen views in Firebase Analytics
 *
 * This hook automatically logs screen_view events when the route changes
 */
export function useAnalytics() {
	const pathname = usePathname();
	const segments = useSegments();

	useEffect(() => {
		if (__DEV__) return;

		if (!pathname) return;

		// Clean up the route for better readability in analytics
		const routeName = getRouteName(pathname, segments);

		// Log screen view event
		const logScreenView = async () => {
			try {
				await getAnalytics().logScreenView({
					screen_name: routeName,
					screen_class: routeName,
				});
				console.log(`[Analytics] Screen view logged: ${routeName}`);
			} catch (error) {
				console.error('[Analytics] Error logging screen view:', error);
			}
		};

		logScreenView();
	}, [pathname, segments]);
}

/**
 * Helper function to get a clean route name from pathname and segments
 */
function getRouteName(pathname: string, segments: string[]): string {
	// If we're at the root, return "Home"
	if (pathname === '/') return 'Home';

	// For tab routes like /(app)/(tabs)/home, use the last segment
	if (pathname.includes('(tabs)') && segments.length > 0) {
		const lastSegment = segments[segments.length - 1];
		return capitalizeFirstLetter(lastSegment);
	}

	// For dynamic routes like /(app)/(fellowship)/[id], use a generic name
	if (pathname.includes('[') && pathname.includes(']')) {
		// Extract the pattern, e.g., "fellowship/[id]" -> "Fellowship Detail"
		const parts = pathname.split('/');
		const dynamicPart = parts.find((part) => part.includes('['));

		if (dynamicPart) {
			// Find the parent route
			const parentIndex = parts.findIndex((part) => part === dynamicPart) - 1;
			const parent = parentIndex >= 0 ? parts[parentIndex] : '';

			if (parent) {
				// Clean up parent name (remove parentheses, capitalize)
				const cleanParent = parent.replace(/[()]/g, '');
				return `${capitalizeFirstLetter(cleanParent)} Detail`;
			}
		}
	}

	// For other routes, use the last non-empty segment
	const filteredSegments = segments.filter(
		(segment) => segment && !segment.startsWith('(') && !segment.endsWith(')'),
	);

	if (filteredSegments.length > 0) {
		const lastSegment = filteredSegments[filteredSegments.length - 1];
		return capitalizeFirstLetter(lastSegment);
	}

	// Fallback: use pathname without special characters
	const cleanPathname =
		pathname
			.replace(/[[\]()]/g, '') // Remove brackets and parentheses
			.split('/')
			.filter(Boolean)
			.pop() || 'Screen';

	return capitalizeFirstLetter(cleanPathname);
}

/**
 * Helper function to capitalize the first letter of a string
 */
function capitalizeFirstLetter(string: string): string {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
