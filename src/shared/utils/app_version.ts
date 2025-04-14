import Constants from 'expo-constants';

export const getCurrentAppVersion = () => {
	return Constants.expoConfig?.version || '1.0.0';
};

export const compareVersions = (
	currentVersion: string,
	latestVersion: string,
) => {
	const current = currentVersion.split('.').map(Number);
	const latest = latestVersion.split('.').map(Number);

	for (let i = 0; i < Math.max(current.length, latest.length); i++) {
		const a = current[i] || 0;
		const b = latest[i] || 0;
		if (a < b) return -1; // 업데이트 필요
		if (a > b) return 1; // 현재 버전이 더 높음 (개발 중일 수 있음)
	}
	return 0; // 버전 동일
};
