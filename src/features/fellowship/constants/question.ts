export interface RecommendedQuestion {
	id: string;
	text: string;
	selected?: boolean;
}

export interface QuestionCategory {
	id: string;
	title: string;
	questions: RecommendedQuestion[];
}

// 아이스브레이킹 추천 질문 카테고리
export const ICEBREAKING_CATEGORIES: QuestionCategory[] = [
	{
		id: '1',
		title: '신앙',
		questions: [
			{
				id: '1-1',
				text: '최근에 읽은 성경 구절 중 가장 마음에 와닿은 것은 무엇인가요?',
			},
			{
				id: '1-2',
				text: '최근에 들은 찬양이나, 가장 좋아하는 찬양은 무엇인가요?',
			},
			{ id: '1-3', text: '신앙생활을 하면서 가장 어려운 점은 무엇인가요?' },
			{ id: '1-4', text: '교회에서 가장 좋아하는 활동은 무엇인가요?' },
			{ id: '1-5', text: '신앙이 당신의 삶에 어떤 변화를 가져왔나요?' },
		],
	},
	{
		id: '2',
		title: '가벼운 주제',
		questions: [
			{ id: '2-1', text: '이번 주 동안 있었던 재밌는 일 한가지를 말해주세요' },
			{
				id: '2-2',
				text: '최근에 본 영화나 드라마 중 가장 인상 깊었던 것은 무엇인가요?',
			},
			{ id: '2-3', text: '어렸을 때 꿈은 무엇이었나요?' },
			{ id: '2-4', text: '가장 기억에 남는 여행지는 어디인가요?' },
			{ id: '2-5', text: '올해 가장 기뻤던 순간은 언제인가요?' },
		],
	},
	{
		id: '3',
		title: '취미',
		questions: [
			{ id: '3-1', text: '요즘 가장 즐겨하는 취미는 무엇인가요?' },
			{ id: '3-2', text: '새롭게 시작해보고 싶은 취미가 있다면 무엇인가요?' },
			{ id: '3-3', text: '어떤 취미를 통해 스트레스를 해소하시나요?' },
			{ id: '3-4', text: '어떤 음악을 즐겨 듣나요?' },
			{
				id: '3-5',
				text: '취미 활동을 통해 배운 가장 중요한 교훈은 무엇인가요?',
			},
		],
	},
];

// 설교 나눔 추천 질문 카테고리
export const SERMON_CATEGORIES: QuestionCategory[] = [
	{
		id: '1',
		title: '기본',
		questions: [
			{ id: '1-1', text: '오늘 말씀을 삶에 어떻게 적용할 수 있을까요?' },
			{ id: '1-2', text: '오늘 말씀 중 가장 마음에 와닿은 부분은 무엇인가요?' },
			{ id: '1-3', text: '말씀을 들으면서 떠오른 질문이 있나요?' },
			{ id: '1-4', text: '이 말씀을 통해 새롭게 알게 된 것이 있나요?' },
			{ id: '1-5', text: '말씀을 들으면서 느낀 감정은 무엇인가요?' },
		],
	},
	{
		id: '2',
		title: '적용',
		questions: [
			{ id: '2-1', text: '이번 주 말씀을 통해 어떤 결단을 하게 되었나요?' },
			{
				id: '2-2',
				text: '말씀에서 배운 것을 실천하기 위해 어떤 노력을 할 수 있을까요?',
			},
			{ id: '2-3', text: '말씀을 적용하는 데 있어 어려운 점은 무엇인가요?' },
			{
				id: '2-4',
				text: '이 말씀이 당신의 일상에 어떤 변화를 가져올 수 있을까요?',
			},
			{ id: '2-5', text: '말씀을 적용하기 위해 필요한 도움은 무엇인가요?' },
		],
	},
	{
		id: '3',
		title: '깊이',
		questions: [
			{
				id: '3-1',
				text: '이 말씀을 통해 하나님에 대해 새롭게 알게 된 점이 있나요?',
			},
			{
				id: '3-2',
				text: '이 말씀이 우리 공동체에 어떤 의미를 가지고 있을까요?',
			},
			{
				id: '3-3',
				text: '말씀을 통해 하나님께서 우리에게 주시는 메시지는 무엇일까요?',
			},
			{ id: '3-4', text: '말씀을 묵상하면서 어떤 생각이 들었나요?' },
			{ id: '3-5', text: '이 말씀이 현재 우리 사회에 어떤 의미가 있을까요?' },
		],
	},
];
