import * as ImageManipulator from 'expo-image-manipulator';

export const convertToWebp = async (uri: string) => {
	try {
		const context = ImageManipulator.ImageManipulator.manipulate(uri);
		const image = await context.renderAsync();
		const result = await image.saveAsync({
			format: ImageManipulator.SaveFormat.WEBP,
			compress: 0.8,
		});
		return result.uri;
	} catch (error) {
		throw new Error(`이미지 WebP 변환 오류: ${error}`);
	}
};

export const resizeImage = async (
	uri: string,
	width: number | undefined = 128,
	height: number | undefined = 128,
) => {
	try {
		const context = ImageManipulator.ImageManipulator.manipulate(uri).resize({
			width: width ?? 128,
			height: height ?? 128,
		});
		const image = await context.renderAsync();
		const _result = await image.saveAsync({
			format: ImageManipulator.SaveFormat.WEBP,
		});
		return _result.uri;
	} catch (error) {
		throw new Error(`이미지 리사이징 오류: ${error}`);
	}
};

/**
 * 이미지를 WebP 형식으로 변환하는 함수
 * @param uri 변환할 이미지의 URI
 * @param quality 변환된 이미지의 품질 (0-1 사이의 값, 기본값 0.8)
 * @returns 변환된 WebP 이미지의 URI
 */
export const changeImageFormat = async (
	uri: string,
	quality = 0.7,
	format: ImageManipulator.SaveFormat = ImageManipulator.SaveFormat.WEBP,
) => {
	try {
		// 이미지 조작 컨텍스트 생성
		const context = ImageManipulator.ImageManipulator.manipulate(uri);

		// 이미지 렌더링
		const image = await context.renderAsync();

		// WebP 형식으로 저장
		const result = await image.saveAsync({
			format,
			compress: quality,
		});

		return result.uri;
	} catch (error) {
		throw new Error(`이미지 WebP 변환 오류: ${error}`);
	}
};
