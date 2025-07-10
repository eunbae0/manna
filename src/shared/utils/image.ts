import type { ImageSource } from 'expo-image';

/**
 * firebase storage image url not cached by expo-image: cc.https://github.com/expo/expo/issues/26129
 */
export function getImageSourceForSignedImageUrl(
	imageUrl: string,
): ImageSource | null {
	if (!imageUrl) {
		return null;
	}
	const imageUrlInstance = new URL(imageUrl);
	const imageCacheKey = imageUrlInstance.origin + imageUrlInstance.pathname;

	return {
		uri: imageUrl,
		cacheKey: imageCacheKey,
	};
}
