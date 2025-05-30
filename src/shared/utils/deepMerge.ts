import type { DeepPartial } from './deepPartial';

export const deepMerge = <T extends Record<string, unknown>>(
	target: T,
	source: DeepPartial<T>,
): T => {
	const output = { ...target };

	for (const key in source) {
		if (source[key] === undefined) continue;

		if (
			source[key] !== null &&
			typeof source[key] === 'object' &&
			!Array.isArray(source[key])
		) {
			if (!(key in target)) {
				Object.assign(output, { [key]: source[key] });
			} else {
				output[key] = deepMerge(
					target[key] as T[Extract<keyof T, string>],
					source[key] as T[Extract<keyof T, string>],
				);
			}
		} else {
			Object.assign(output, { [key]: source[key] });
		}
	}

	return output;
};
