import ContentFieldScreen from '@/features/fellowship/components/content-field-screen';

export default function FellowshipSermonTopicScreen() {
	return (
		<ContentFieldScreen
			title="설교 나눔"
			fieldKey="sermonTopic"
			placeholder="ex. 오늘 말씀을 삶에 어떻게 적용하면 좋을까요?"
		/>
	);
}
