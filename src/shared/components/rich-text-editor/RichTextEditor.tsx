import { useState, useRef, useMemo } from 'react';
import {
	TextInput,
	type TextInputProps,
	View,
	Text,
	StyleSheet,
} from 'react-native';

export interface RichTextEditorProps extends TextInputProps {
	/** 마크다운 스타일 활성화 여부 */
	enableMarkdown?: boolean;
}

const DEFAULT_MARKDOWN_TYPE: MarkdownType = 'text';

type MarkdownType =
	| 'bold'
	| 'italic'
	| 'inline_code'
	| 'code_block'
	| 'heading1'
	| 'heading2'
	| 'heading3'
	| 'blockquote'
	| 'list_item'
	| 'ordered_list_item'
	| 'text';

type MarkdownMeta = {
	language?: string; // 코드 블록 언어
	number?: number; // 순서 있는 목록 번호
};

type MarkdownSegment = {
	type: MarkdownType;
	content: string;
	meta?: MarkdownMeta;
};

// 마크다운 파싱 유틸리티 함수
function parseMarkdown(text: string): MarkdownSegment[] {
	if (!text) return [{ type: 'text', content: '' }];

	// 줄 단위로 분할하여 처리
	const lines = text.split('\n');
	const segments: MarkdownSegment[] = [];

	// 코드 블록 처리를 위한 상태
	let inCodeBlock = false;
	let codeBlockContent = '';
	let codeBlockLanguage = '';

	// 각 줄 처리
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// 코드 블록 처리
		if (line.trim().startsWith('```')) {
			if (!inCodeBlock) {
				// 코드 블록 시작
				inCodeBlock = true;
				codeBlockLanguage = line.trim().substring(3).trim();
				codeBlockContent = '';
			} else {
				// 코드 블록 종료
				inCodeBlock = false;
				segments.push({
					type: 'code_block',
					content: codeBlockContent,
					meta: { language: codeBlockLanguage },
				});
			}
			continue;
		}

		if (inCodeBlock) {
			// 코드 블록 내부 내용 추가
			codeBlockContent = `${codeBlockContent}${line}\n`;
			continue;
		}

		// 제목 처리
		if (line.startsWith('# ')) {
			segments.push({
				type: 'heading1',
				content: line.substring(2),
			});
			continue;
		}

		if (line.startsWith('## ')) {
			segments.push({
				type: 'heading2',
				content: line.substring(3),
			});
			continue;
		}

		if (line.startsWith('### ')) {
			segments.push({
				type: 'heading3',
				content: line.substring(4),
			});
			continue;
		}

		// 인용구 처리
		if (line.startsWith('> ')) {
			segments.push({
				type: 'blockquote',
				content: line.substring(2),
			});
			continue;
		}

		// 순서 없는 목록 처리
		if (line.match(/^\s*[-*]\s+/)) {
			const content = line.replace(/^\s*[-*]\s+/, '');
			segments.push({
				type: 'list_item',
				content: content,
			});
			continue;
		}

		// 순서 있는 목록 처리
		const orderedListMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
		if (orderedListMatch) {
			segments.push({
				type: 'ordered_list_item',
				content: orderedListMatch[2],
				meta: { number: Number.parseInt(orderedListMatch[1], 10) },
			});
			continue;
		}

		// 일반 텍스트 처리 (인라인 마크다운 포함)
		if (line.trim() !== '') {
			// 인라인 마크다운 파싱
			const regex = /(?:`([^`]+)`)|(?:\*\*([^*]+)\*\*)|(?:_([^_]+)_)/g;
			let lastIndex = 0;
			let match: RegExpExecArray | null;

			// 정규식을 사용하여 인라인 마크다운 파싱
			match = regex.exec(line);

			// 매치가 없는 경우 일반 텍스트로 처리
			if (match === null) {
				segments.push({
					type: 'text',
					content: line,
				});
				continue;
			}

			// 인라인 마크다운이 있는 경우 처리
			while (match !== null) {
				// 매치 전 텍스트가 있는 경우 추가
				if (match.index > lastIndex) {
					segments.push({
						type: 'text',
						content: line.substring(lastIndex, match.index),
					});
				}

				// 어떤 패턴이 매치되었는지 확인
				if (match[1] !== undefined) {
					// 인라인 코드
					segments.push({
						type: 'inline_code',
						content: match[1],
					});
				} else if (match[2] !== undefined) {
					// 볼드
					segments.push({
						type: 'bold',
						content: match[2],
					});
				} else if (match[3] !== undefined) {
					// 이탈릭
					segments.push({
						type: 'italic',
						content: match[3],
					});
				}

				lastIndex = regex.lastIndex;
				match = regex.exec(line);
			}

			// 남은 텍스트가 있는 경우 추가
			if (lastIndex < line.length) {
				segments.push({
					type: 'text',
					content: line.substring(lastIndex),
				});
			}
		} else {
			// 빈 줄 처리
			segments.push({
				type: 'text',
				content: '',
			});
		}
	}

	return segments;
}

// 마크다운 렌더링 컴포넌트
function MarkdownText({ text }: { text: string }) {
	const segments = useMemo(() => parseMarkdown(text), [text]);
	console.log(segments);

	return (
		<Text style={styles.markdownContainer}>
			{segments.map((segment, index) => {
				// 고유한 키 생성 (타입과 내용 기반)
				const key = `${segment.type}-${index}-${segment.content.substring(0, 10).replace(/\s/g, '')}`;
				// 렌더링 로직
				console.log(segment.content);
				switch (segment.type) {
					case 'heading1':
						return (
							<Text key={key} style={styles.heading1}>
								{segment.content}
							</Text>
						);
					case 'heading2':
						return (
							<Text key={key} style={styles.heading2}>
								{segment.content}
							</Text>
						);
					case 'heading3':
						return (
							<Text key={key} style={styles.heading3}>
								{segment.content}
							</Text>
						);
					case 'blockquote':
						return (
							<View key={key} style={styles.blockquote}>
								<Text style={styles.blockquoteText}>{segment.content}</Text>
							</View>
						);
					case 'list_item':
						return (
							<View key={key} style={styles.listItem}>
								<Text style={styles.listBullet}>•</Text>
								<Text style={styles.listItemText}>{segment.content}</Text>
							</View>
						);
					case 'ordered_list_item':
						return (
							<View key={key} style={styles.listItem}>
								<Text style={styles.listNumber}>
									{segment.meta?.number || '1'}.
								</Text>
								<Text style={styles.listItemText}>{segment.content}</Text>
							</View>
						);
					case 'code_block':
						return (
							<View key={key} style={styles.codeBlock}>
								{segment.meta?.language && (
									<Text style={styles.codeLanguage}>
										{segment.meta.language}
									</Text>
								)}
								<Text style={styles.codeBlockText}>{segment.content}</Text>
							</View>
						);
					case 'text':
						return (
							<Text key={key} style={styles.paragraph}>
								{segment.content}
							</Text>
						);
					case 'bold':
						return (
							<Text key={key} style={styles.bold}>
								{segment.content}
							</Text>
						);
					case 'italic':
						return (
							<Text key={key} style={styles.italic}>
								{segment.content}
							</Text>
						);
					case 'inline_code':
						return (
							<Text key={key} style={styles.inlineCode}>
								{segment.content}
							</Text>
						);
					default:
						return <Text key={key}>{segment.content}</Text>;
				}
			})}
		</Text>
	);
}

export default function RichTextEditor({
	enableMarkdown = true,
	verticalAlign,
	multiline,
	style,
	...props
}: RichTextEditorProps) {
	const [text, setText] = useState('');
	const [cursorPosition, setCursorPosition] = useState<
		TextInputProps['selection']
	>({ start: 0, end: 0 });
	const textInputRef = useRef<TextInput>(null);

	// 텍스트 변경 핸들러
	const handleChangeText = (newText: string) => {
		setText(newText);
		if (props.onChangeText) {
			props.onChangeText(newText);
		}
	};

	// 선택 영역 변경 핸들러
	const handleSelectionChange = (e: {
		nativeEvent: { selection: TextInputProps['selection'] };
	}) => {
		setCursorPosition(e.nativeEvent.selection);
		if (props.onSelectionChange) {
			props.onSelectionChange(e);
		}
	};

	// 마크다운이 활성화된 경우, 파싱된 텍스트를 표시
	return (
		<View style={{ flex: 1 }}>
			<TextInput
				ref={textInputRef}
				selection={cursorPosition}
				onChangeText={handleChangeText}
				onSelectionChange={handleSelectionChange}
				multiline={multiline || true}
				verticalAlign={verticalAlign || 'top'}
				style={[{ flex: 1 }, style]}
				{...props}
			>
				<MarkdownText text={text} />
			</TextInput>
		</View>
	);
}

const styles = StyleSheet.create({
	markdownContainer: {
		flex: 1,
	},
	paragraph: {
		marginVertical: 8,
		lineHeight: 20,
	},
	bold: {
		fontWeight: 'bold',
	},
	italic: {
		fontStyle: 'italic',
	},
	inlineCode: {
		fontFamily: 'monospace',
		backgroundColor: '#f6f8fa',
		paddingHorizontal: 4,
		borderRadius: 3,
	},
	heading1: {
		fontSize: 24,
		fontWeight: 'bold',
		marginTop: 16,
		marginBottom: 8,
	},
	heading2: {
		fontSize: 20,
		fontWeight: 'bold',
		marginTop: 16,
		marginBottom: 8,
	},
	heading3: {
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 12,
		marginBottom: 6,
	},
	blockquote: {
		borderLeftWidth: 4,
		borderLeftColor: '#ddd',
		paddingLeft: 12,
		marginVertical: 8,
	},
	blockquoteText: {
		fontStyle: 'italic',
	},
	listItem: {
		flexDirection: 'row',
		marginVertical: 4,
	},
	listBullet: {
		width: 16,
		marginRight: 8,
	},
	listNumber: {
		width: 24,
		marginRight: 8,
	},
	listItemText: {
		flex: 1,
	},
	codeBlock: {
		backgroundColor: '#f6f8fa',
		padding: 12,
		borderRadius: 4,
		marginVertical: 8,
	},
	codeLanguage: {
		fontFamily: 'monospace',
		fontSize: 12,
		color: '#666',
		marginBottom: 4,
	},
	codeBlockText: {
		fontFamily: 'monospace',
		fontSize: 14,
	},
});
