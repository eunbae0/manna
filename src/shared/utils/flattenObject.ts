/**
 * 중첩된 객체를 Firestore의 dot notation으로 변환하는 함수
 * 예: { a: { b: 1 } } -> { 'a.b': 1 }
 */
export function flattenObject<T extends Record<string, unknown>>(
	obj: T,
	prefix = '',
): Record<string, unknown> {
	return Object.keys(obj).reduce<Record<string, unknown>>((acc, key) => {
		const prefixedKey = prefix ? `${prefix}.${key}` : key;
		const value = obj[key];

		if (
			typeof value === 'object' &&
			value !== null &&
			!Array.isArray(value) &&
			Object.keys(value as Record<string, unknown>).length > 0
		) {
			Object.assign(
				acc,
				flattenObject(value as Record<string, unknown>, prefixedKey),
			);
		} else {
			acc[prefixedKey] = value;
		}

		return acc;
	}, {});
}
