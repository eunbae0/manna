import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Divider } from '#/components/ui/divider';
import { Heading } from '#/components/ui/heading';
import { Text } from '#/components/ui/text';
import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';

export default function PolicyScreen() {
	return (
		<SafeAreaView className="flex-1 bg-background-50">
			<VStack className="flex-1 gap-5">
				<Header label="정책 및 약관" />

				<ScrollView
					className="flex-1 px-5"
					showsVerticalScrollIndicator={false}
				>
					<VStack space="xl" className="pb-8">
						<PolicySection
							title="이용약관"
							content={
								'소그룹 앱(이하 "서비스")을 이용해 주셔서 감사합니다. 본 약관은 서비스 이용에 관한 조건 및 절차, 이용자와 당사의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정합니다.\n\n' +
								'1. 서비스 이용 계약\n' +
								'본 서비스를 이용하기 위해서는 이용약관에 동의하셔야 합니다. 회원가입 시 약관에 동의함으로써 이용계약이 성립됩니다.\n\n' +
								'2. 서비스 이용\n' +
								'서비스는 교회 소그룹 활동을 지원하기 위한 목적으로 제공됩니다. 이용자는 서비스를 이용함에 있어 관련 법령 및 본 약관을 준수해야 합니다.\n\n' +
								'3. 서비스 변경 및 중단\n' +
								'당사는 서비스의 내용, 이용방법, 이용시간을 변경하거나 중단할 수 있으며, 이 경우 사전에 공지합니다. 단, 불가피한 사유가 있는 경우 사후에 공지할 수 있습니다.'
							}
						/>

						<PolicySection
							title="개인정보 처리방침"
							content={
								'소그룹 앱은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」등 관련 법령을 준수하고 있습니다.\n\n' +
								'1. 수집하는 개인정보 항목\n' +
								'- 필수항목: 이메일 주소, 이름\n' +
								'- 선택항목: 프로필 이미지\n' +
								'- 자동 수집 항목: 기기 정보, 로그 데이터, 사용 기록\n\n' +
								'2. 개인정보의 수집 및 이용목적\n' +
								'- 서비스 제공 및 계정 관리\n' +
								'- 소그룹 활동 지원 및 관리\n' +
								'- 서비스 개선 및 새로운 서비스 개발\n\n' +
								'3. 개인정보의 보유 및 이용기간\n' +
								'회원 탈퇴 시 또는 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관련 법령에 의해 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.'
							}
						/>

						<PolicySection
							title="커뮤니티 가이드라인"
							content={
								'소그룹 앱은 건전한 소그룹 활동을 지원하기 위해 다음과 같은 커뮤니티 가이드라인을 제시합니다.\n\n' +
								'1. 상호 존중\n' +
								'모든 이용자는 서로를 존중하고 배려하는 태도로 서비스를 이용해야 합니다.\n\n' +
								'2. 적절한 콘텐츠\n' +
								'불쾌감을 주거나 부적절한 콘텐츠의 게시를 금지합니다. 특히 다음과 같은 콘텐츠는 엄격히 금지됩니다:\n' +
								'- 혐오 발언 또는 차별적 내용\n' +
								'- 타인의 명예를 훼손하는 내용\n' +
								'- 불법적인 활동을 조장하는 내용\n\n' +
								'3. 개인정보 보호\n' +
								'타인의 개인정보를 무단으로 수집, 공개하거나 부적절하게 이용하는 행위를 금지합니다.'
							}
						/>

						<PolicySection
							title="문의 및 피드백"
							content={
								'서비스 이용 중 문의사항이나 피드백이 있으시면 다음 연락처로 문의해 주세요.\n\n' +
								'이메일: geb9211@gmail.com\n' +
								'\n' +
								'최종 업데이트: 2025년 3월 26일'
							}
						/>
					</VStack>
				</ScrollView>
			</VStack>
		</SafeAreaView>
	);
}

function PolicySection({ title, content }: { title: string; content: string }) {
	return (
		<VStack space="md">
			<Heading size="xl" className="text-typography-900">
				{title}
			</Heading>
			<Text size="md" className="text-typography-700 whitespace-pre-line">
				{content}
			</Text>
			<Divider className="my-2" />
		</VStack>
	);
}
