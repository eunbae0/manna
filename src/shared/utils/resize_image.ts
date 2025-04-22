import * as ImageManipulator from 'expo-image-manipulator';

export const resizeImage = async (uri: string) => {
	try {
		const context = ImageManipulator.ImageManipulator.manipulate(uri).resize({
			width: 128,
			height: 128,
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
