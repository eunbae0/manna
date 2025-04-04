const BIBLICAL_NAMES = [
	'모세',
	'노아',
	'다윗',
	'요셉',
	'아담',
	'야곱',
	'이삭',
	'아브라함',
	'솔로몬',
	'사무엘',
	'엘리야',
	'다니엘',
	'에스더',
	'룻',
	'베드로',
	'바울',
	'요한',
	'마태',
	'누가',
	'마가',
];
/**
 * 성경에 등장하는 인물 이름과 숫자를 조합하여 랜덤한 사용자 이름을 생성합니다.
 * @returns 랜덤하게 생성된 사용자 이름 (예: "모세42")
 */
export function generateRandomDisplayName(): string {
	// 성경에 등장하는 인물 이름 (4자 이하)

	// 랜덤한 성경 인물 이름 선택
	const randomName =
		BIBLICAL_NAMES[Math.floor(Math.random() * BIBLICAL_NAMES.length)];

	// 랜덤한 2자리 숫자 생성 (10-99)
	const randomNumber = Math.floor(Math.random() * 90) + 10;

	// 이름과 숫자 조합
	return `${randomName}${randomNumber}`;
}
