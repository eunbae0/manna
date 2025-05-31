/**
 * Notice type definition
 */
export interface Notice {
	id: string;
	title: string;
	content: string;
	date: Date;
	isPinned: boolean;

	showOnMain: boolean; // 메인화면에 보여질지 여부
	mainDisplayText: string; // 메인화면에 표시할 문구

	metadata: {
		status: 'published' | 'archived';
	};
}
