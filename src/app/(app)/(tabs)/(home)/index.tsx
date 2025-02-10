import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ButtonIcon, ButtonText } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import {
	ChevronDownIcon,
	SettingsIcon,
	MenuIcon,
	Icon,
	ChevronRightIcon,
} from '#/components/ui/icon';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import {
	Avatar,
	AvatarGroup,
	AvatarBadge,
	AvatarFallbackText,
	AvatarImage,
} from '#/components/ui/avatar';
import {
	ChevronLeftIcon,
	Edit3Icon,
	Flag,
	HandHelping,
	HeartIcon,
	MoreHorizontal,
	PlusIcon,
	UserRound,
} from 'lucide-react-native';
import { Divider } from '#/components/ui/divider';
import { Card } from '#/components/ui/card';
import { ScrollView } from 'react-native';
import { Badge } from '#/components/ui/badge';
import { Box } from '#/components/ui/box';

export default function HomeScreen() {
	return (
		<SafeAreaView>
			<ScrollView showsVerticalScrollIndicator={false}>
				<VStack className="pb-20">
					<VStack space="xl" className="px-5">
						<HStack className="justify-between">
							<HStack space="sm" className="items-center">
								<Heading size="xl">OO 사랑방</Heading>
								<Button size="xl" variant="link">
									<ButtonIcon as={ChevronDownIcon} />
								</Button>
							</HStack>
							<HStack space="xl" className="px-1">
								<Button size="xl" variant="link">
									<ButtonIcon as={SettingsIcon} />
								</Button>
								<Button size="xl" variant="link">
									<ButtonIcon as={MenuIcon} />
								</Button>
							</HStack>
						</HStack>
						<HStack space="lg">
							{/* <Avatar
									size={'2xl'}
									uri={
										'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
									}
								>
									<AvatarFallbackText>""</AvatarFallbackText>
									<AvatarImage
										source={{
											uri: props.uri,
										}}
									/>
								</Avatar> */}
							<VStack space="sm" className="items-center">
								<Avatar className="bg-yellow-600">
									<Icon as={UserRound} size="xl" className="stroke-white" />
									{/* <Badge
										className="absolute -right-2 -top-2 w-5 h-5 bg-yellow-500 rounded-full items-center justify-center"
										variant="solid"
									> */}
									{/* <Icon
										as={Flag}
										size="2xs"
										className="absolute -right-2 -top-2 w-5 h-5 stroke-yellow-500 rounded-full items-center justify-center"
									/> */}
									{/* <BadgeText className="text-white">2</BadgeText> */}
									{/* </Badge> */}
									<AvatarBadge className="bg-yellow-400" />
								</Avatar>
								<Text size="sm" bold={true}>
									홍길동
								</Text>
							</VStack>
						</HStack>
					</VStack>
					<Divider className="my-4 h-[6px]" />
					<VStack space="lg" className="px-5">
						{/* Date */}
						<VStack>
							<HStack className="px-2 justify-between">
								<HStack space="xs" className="items-center">
									<Heading size="sm">2025년 2월</Heading>
									<Button size="xl" variant="link">
										<ButtonIcon as={ChevronRightIcon} />
									</Button>
								</HStack>
								<HStack space="md">
									<Button size="xl" variant="link">
										<ButtonIcon as={ChevronLeftIcon} />
									</Button>
									<Button size="xl" variant="link">
										<ButtonIcon as={ChevronRightIcon} />
									</Button>
								</HStack>
							</HStack>
							<HStack space="md" className="justify-evenly">
								<VStack space="sm" className="items-center">
									<Text size="sm" className="color-red-500">
										일
									</Text>
									<Button variant="link" className="w-9 h-9 rounded-full">
										<ButtonText size="md">1</ButtonText>
									</Button>
								</VStack>
								<VStack space="sm" className="items-center">
									<Text size="sm" className="">
										월
									</Text>
									<Button variant="link" className="w-9 h-9 rounded-full">
										<ButtonText size="md">2</ButtonText>
									</Button>
								</VStack>
								<VStack space="sm" className="items-center">
									<Text size="sm" className="">
										화
									</Text>
									<Button variant="link" className="w-9 h-9 rounded-full">
										<ButtonText size="md">3</ButtonText>
									</Button>
								</VStack>
								<VStack space="sm" className="items-center">
									<Text size="sm" className="">
										수
									</Text>
									<Button
										variant="link"
										className="w-9 h-9 bg-yellow-300 rounded-full"
									>
										<ButtonText size="md">4</ButtonText>
									</Button>
									<Box className="bg-gray-300 w-1 h-1 rounded-full" />
								</VStack>
								<VStack space="sm" className="items-center">
									<Text size="sm" className="">
										목
									</Text>
									<Button variant="link" className="w-9 h-9 rounded-full">
										<ButtonText size="md">5</ButtonText>
									</Button>
								</VStack>
								<VStack space="sm" className="items-center">
									<Text size="sm" className="">
										금
									</Text>
									<Button variant="link" className="w-9 h-9 rounded-full">
										<ButtonText size="md">6</ButtonText>
									</Button>
								</VStack>
								<VStack space="sm" className="items-center">
									<Text size="sm" className="color-blue-500">
										토
									</Text>
									<Button variant="link" className="w-9 h-9 rounded-full">
										<ButtonText size="md">7</ButtonText>
									</Button>
								</VStack>
							</HStack>
						</VStack>
						{/* 오늘의 기도 제목 */}
						<VStack className="gap-12">
							<VStack space="md">
								<HStack className="justify-between items-center">
									<Heading size="lg">오늘의 기도 제목</Heading>
									<Button size="xl" variant="link">
										<ButtonIcon as={Edit3Icon} />
									</Button>
								</HStack>
								<VStack space="3xl">
									<Card
										variant="filled"
										className="shadow-sm shadow-slate-300 rounded-xl"
									>
										<VStack space="2xl" className="pb-4">
											<HStack space="sm" className="items-center">
												<Avatar size="xs" className="bg-yellow-600">
													<Icon
														as={UserRound}
														size="xs"
														className="stroke-white"
													/>
												</Avatar>
												<HStack space="sm" className="items-end">
													<Text size="md" bold={true}>
														홍길동
													</Text>
													<HStack space="xs" className="items-center">
														<Text size="sm">사랑방원</Text>
														<Divider
															orientation="vertical"
															className="h-3 mx-[3px]"
														/>
														<Text size="sm">2025.02.01 주일 나눔</Text>
													</HStack>
												</HStack>
											</HStack>
											<Text>
												모든 결정가운데 하나님의 말씀보다 앞서지 않게 해주세요.
											</Text>
										</VStack>
										<Button
											size="sm"
											variant="link"
											className="absolute top-2 right-5"
										>
											<ButtonIcon
												as={MoreHorizontal}
												className="color-gray-400"
											/>
										</Button>
										<Button
											variant="outline"
											size="xs"
											className="z-10 absolute -bottom-4 right-4 rounded-full bg-white"
										>
											<ButtonIcon
												size="sm"
												as={HandHelping}
												className="color-black"
											/>
											<HStack space="xs">
												<ButtonText size="sm">기도했어요</ButtonText>
												<ButtonText size="sm">1</ButtonText>
											</HStack>
										</Button>
									</Card>
									<Card
										variant="filled"
										className="shadow-sm shadow-slate-300 rounded-xl"
									>
										<VStack space="2xl" className="pb-4">
											<HStack space="sm" className="items-center">
												<Avatar size="xs" className="bg-yellow-600">
													<Icon
														as={UserRound}
														size="xs"
														className="stroke-white"
													/>
												</Avatar>
												<HStack space="sm" className="items-end">
													<Text size="md" bold={true}>
														홍길동
													</Text>
													<HStack space="xs" className="items-center">
														<Text size="sm">사랑방원</Text>
														<Divider
															orientation="vertical"
															className="h-3 mx-[3px]"
														/>
														<Text size="sm">2025.02.01 주일 나눔</Text>
													</HStack>
												</HStack>
											</HStack>
											<Text>
												모든 결정가운데 하나님의 말씀보다 앞서지 않게 해주세요.
											</Text>
										</VStack>
										<Button
											size="sm"
											variant="link"
											className="absolute top-2 right-5"
										>
											<ButtonIcon
												as={MoreHorizontal}
												className="color-gray-400"
											/>
										</Button>
										<Button
											variant="outline"
											size="xs"
											className="z-10 absolute -bottom-4 right-4 rounded-full bg-white"
										>
											<ButtonIcon
												size="sm"
												as={HandHelping}
												className="color-black"
											/>
											<HStack space="xs">
												<ButtonText size="sm">기도했어요</ButtonText>
												<ButtonText size="sm">1</ButtonText>
											</HStack>
										</Button>
									</Card>
								</VStack>
							</VStack>
							{/* 오늘의 감사 나눔 */}
							<VStack space="md">
								<HStack className="justify-between items-center">
									<Heading size="lg">오늘의 감사 나눔</Heading>
									<Button size="md" variant="link">
										<ButtonText>감사 추가하기</ButtonText>
										<ButtonIcon as={PlusIcon} />
									</Button>
								</HStack>
								<VStack space="3xl">
									<Card
										variant="filled"
										className="shadow-sm shadow-slate-300 rounded-xl"
									>
										<VStack space="2xl" className="pb-4">
											<HStack space="sm" className="items-center">
												<Avatar size="xs" className="bg-yellow-600">
													<Icon
														as={UserRound}
														size="xs"
														className="stroke-white"
													/>
												</Avatar>
												<HStack space="sm" className="items-end">
													<Text size="md" bold={true}>
														홍길동
													</Text>
													<Text size="sm">사랑방장</Text>
												</HStack>
											</HStack>
											<Text>
												모든 결정가운데 하나님의 말씀보다 앞서지 않게 해주세요.
											</Text>
										</VStack>
										<Button
											size="sm"
											variant="link"
											className="absolute top-2 right-5"
										>
											<ButtonIcon
												as={MoreHorizontal}
												className="color-gray-400"
											/>
										</Button>
										<Button
											variant="outline"
											size="xs"
											className="z-10 absolute -bottom-4 right-4 rounded-full bg-white"
										>
											<ButtonIcon
												size="sm"
												as={HeartIcon}
												className="color-black"
											/>
											<ButtonText size="sm">1</ButtonText>
										</Button>
									</Card>
								</VStack>
							</VStack>
							<Button variant="outline">
								<ButtonText>설교 나눔 만들기</ButtonText>
								<ButtonIcon size="sm" as={PlusIcon} />
							</Button>
						</VStack>
					</VStack>
				</VStack>
			</ScrollView>
		</SafeAreaView>
	);
}
