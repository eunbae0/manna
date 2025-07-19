import React from 'react';
import { TouchableOpacity, Linking } from 'react-native';
import { Text, type TextSize } from '@/shared/components/text';
// import { LinkPreview } from './LinkPreview';

interface TextWithLinksProps {
	text: string;
	className?: string;
	size?: TextSize;
}

/**
 * URL을 감지하고 클릭 가능한 링크로 변환하는 컴포넌트
 *
 * @param text - 변환할 텍스트
 * @param className - 텍스트에 적용할 클래스 이름
 * @param size - 텍스트 크기
 */
export function TextWithLinks({ text, className, size }: TextWithLinksProps) {
	// URL을 감지하기 위한 정규식
	const urlRegex = /(https?:\/\/[^\s]+)/g;

	// 텍스트를 파싱하여 URL과 일반 텍스트로 분리
	const parts = text.split(urlRegex);
	const matches: Set<string> = new Set(text.match(urlRegex) || []);

	// 파싱된 결과를 저장할 배열
	const elements: React.ReactNode[] = [];

	// 파싱된 텍스트와 URL을 번갈아가며 배열에 추가
	for (let i = 0; i < parts.length; i++) {
		if (matches.has(parts[i])) {
			elements.push(
				<React.Fragment key={`link-container-${i}`}>
					<TouchableOpacity
						onPress={() => {
							Linking.openURL(parts[i]).catch((err) => {
								console.error('URL을 열 수 없습니다:', err);
							});
						}}
					>
						<Text size={size} className="text-blue-500 underline">
							{parts[i]}
						</Text>
					</TouchableOpacity>
					{/* <LinkPreview url={parts[i]} /> */}
				</React.Fragment>,
			);
			continue;
		}

		// 일반 텍스트인 경우, 빈 문자열이 아닌 경우에만 렌더링
		elements.push(
			<Text key={`text-${i}`} size={size} className={className}>
				{parts[i]}
			</Text>,
		);
	}

	return <>{elements}</>;
}

export default TextWithLinks;
