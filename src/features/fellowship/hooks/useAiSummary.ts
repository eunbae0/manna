import { GEMINI_API_URL } from '@/shared/constants/url';
import { useMutation } from '@tanstack/react-query';

export function useAiSummary() {
	return useMutation({
		mutationFn: (text: string) => generateAiSummary(text),
	});
}

// Gemini AI 요약을 위한 프롬프트
const SUMMARY_PROMPT = `
당신은 교회 소그룹 나눔 내용을 요약하는 AI 도우미입니다. 교회에서 설교 말씀을 듣고 한가지 나눔 주제 제시어에 대해 답변한 것입니다.
답변은 음성으로 인식했기 때문에 구문 오류가 있을 수 있습니다.
아래 입력한 내용을 두 가지 다른 스타일로 요약해주세요:

1. 입력한 내용을 기반으로 해서 음성 인식 오류를 수정한 올바른 문장으로, 최대한 내용을 바뀌지 않도록 하는 요약을 작성해주세요
2. 간결하고 핵심만 담은 요약을 50자 이내로 작성해주세요

녹음 내용:
{text}

각 요약에는 번호를 꼭 제거해주세요. 제거하지 않으면 안됩니다. 그리고 두가지 요약 내용을 plain text로, '+'로 구분해서 제공해주세요.
`;

async function generateAiSummary(text: string): Promise<string[]> {
	const response = await fetch(GEMINI_API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			contents: [
				{
					parts: [
						{
							text: SUMMARY_PROMPT.replace('{text}', text),
						},
					],
				},
			],
		}),
	});
	const data = await response.json();
	let summaries: string[] = [];
	try {
		if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
			summaries = data.candidates[0].content.parts[0].text
				.split('+')
				.map((text: string) => text.trim());
		} else {
			throw new Error('API 응답 형식이 올바르지 않습니다');
		}
	} catch (error) {
		throw new Error(`AI 응답 처리 오류: ${error}`);
	}
	return summaries;
}
