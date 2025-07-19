import { useCallback, useState } from 'react';

export function useRefreshControl(refetch: () => Promise<unknown>) {
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = useCallback(async () => {
		try {
			setIsRefreshing(true);
			await refetch();
		} finally {
			setIsRefreshing(false);
		}
	}, [refetch]);

	return {
		isRefreshing,
		onRefresh: handleRefresh,
	};
}

export default useRefreshControl;
