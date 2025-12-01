import { PerplexityPurpose, AIResponse } from '../types';

const API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY || '';
const API_ENDPOINT = import.meta.env.VITE_PERPLEXITY_API_ENDPOINT || 'https://api.perplexity.ai/chat/completions';

export async function searchRecentScienceInfo(
  purpose: PerplexityPurpose,
  query: string
): Promise<AIResponse> {
  if (!API_KEY || API_KEY === '') {
    return {
      success: false,
      error: 'Perplexity API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.'
    };
  }

  try {
    const prompt = buildSearchPrompt(purpose, query);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: '너는 초등학교 4학년 학생들을 위한 과학 자료 도우미야. 최신 정보를 찾아서 초등학생이 이해할 수 있게 쉽고 짧게 설명해줘. 답변은 4-6문장으로 해줘.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.3,
        return_citations: true
      })
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0]?.message?.content || '응답을 받지 못했습니다.';

    // 인용 출처가 있다면 추가
    if (data.citations && data.citations.length > 0) {
      const citations = data.citations.slice(0, 3).map((url: string, idx: number) => {
        return `${idx + 1}. ${url}`;
      }).join('\n');
      aiResponse += `\n\n📚 참고 자료:\n${citations}`;
    }

    return {
      success: true,
      data: aiResponse
    };
  } catch (error) {
    console.error('Perplexity API 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    };
  }
}

function buildSearchPrompt(purpose: PerplexityPurpose, query: string): string {
  switch (purpose) {
    case 'background':
      return `"${query}"에 대한 기본 개념을 초등학교 4학년 학생이 이해할 수 있게 설명해줘. 
쉬운 단어를 사용하고, 일상생활의 예시를 들어서 설명해줘.`;

    case 'method':
      return `"${query}"와 관련된 탐구나 실험을 초등학교 4학년 수준에서 할 수 있는 방법 2-3가지를 알려줘. 
학교나 집에서 안전하게 할 수 있는 방법으로 설명해줘.`;

    case 'comparison':
      return `"${query}"에 대해 과학자들은 어떻게 설명하는지 초등학교 4학년 학생이 이해할 수 있게 알려줘. 
최신 과학 정보를 포함해서 간단하게 설명해줘.`;

    default:
      return query;
  }
}
