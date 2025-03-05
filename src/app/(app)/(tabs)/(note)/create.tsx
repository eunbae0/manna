import { VStack } from '#/components/ui/vstack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import Header from '@/components/common/Header';
import { router } from 'expo-router';
import { TextInput } from 'react-native';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import { AlignJustify, BookText, Megaphone, Tag } from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';

const copy = '# h1 Heading\n**This is some bold text!**\n\nThis is normal text';

export default function CreateScreen() {
	return (
		<SafeAreaView>
			<VStack space="xl">
				<Header
					label="설교 노트 쓰기"
					onPressBackButton={() => router.back()}
				/>
				<VStack space="2xl" className="px-6 h-full">
					<TextInput
						placeholder="설교 제목"
						className="text-3xl font-pretendard-bold"
					/>
					{/* <Markdown>{copy}</Markdown> */}

					<VStack space="lg">
						<HStack space="sm" className="items-center w-full">
							<HStack space="sm" className="w-1/4 items-center">
								<Icon as={BookText} size="lg" className="text-typography-600" />
								<Text size="lg" className="text-typography-600">
									설교 본문
								</Text>
							</HStack>
							<TextInput
								placeholder="ex. 창세기 1장 1절"
								className="w-full text-[16px]"
							/>
						</HStack>
						<HStack space="sm" className="items-center w-full">
							<HStack space="sm" className="w-1/4 items-center">
								<Icon
									as={AlignJustify}
									size="lg"
									className="text-typography-600"
								/>
								<Text size="lg" className="w-full text-typography-600">
									예배 종류
								</Text>
							</HStack>
							<Text
								size="lg"
								className="bg-purple-100 px-2 rounded-full text-typography-700"
							>
								금요철야
							</Text>
						</HStack>
						<HStack space="sm" className="items-center w-full">
							<HStack space="sm" className="w-1/4 items-center">
								<Icon
									as={Megaphone}
									size="lg"
									className="text-typography-600"
								/>
								<Text size="lg" className="text-typography-600">
									설교자
								</Text>
							</HStack>
							<TextInput
								placeholder="비어 있음"
								className="w-full text-[16px]"
							/>
						</HStack>
					</VStack>
					<TextInput
						placeholder="설교 노트를 적어보세요 ..."
						className="text-xl h-full flex-1"
						multiline={true}
						textAlignVertical="top"
					/>
				</VStack>
			</VStack>
		</SafeAreaView>
	);
}
