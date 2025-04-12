import { storage } from '@/firebase/config';
import {
	ref,
	uploadBytesResumable,
	getDownloadURL,
} from '@react-native-firebase/storage';

export async function uploadImageAsync(uri: string, path: string) {
	// Why are we using XMLHttpRequest? See:
	// https://github.com/expo/expo/issues/2402#issuecomment-443726662
	const blob: Blob = await new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.onload = () => {
			resolve(xhr.response);
		};
		xhr.onerror = (e) => {
			console.log(e);
			reject(new TypeError('Network request failed'));
		};
		xhr.responseType = 'blob';
		xhr.open('GET', uri, true);
		xhr.send(null);
	});
	const fileRef = ref(storage, path);
	await uploadBytesResumable(fileRef, blob);

	// We're done with the blob, close and release it
	//@ts-expect-error
	blob.close();

	return await getDownloadURL(fileRef);
}
