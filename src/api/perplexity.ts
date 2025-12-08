/**
 * Perplexity API 통합 모듈
 * 
 * ✅ 보안 개선: Netlify Functions를 통해 API 키를 서버 사이드에서만 사용합니다.
 * 
 * 기능:
 * - 최신 과학 정보 검색
 * - 배경 지식 제공
 * - 탐구 방법 정보 검색
 * - 비교 정보 검색
 * 
 * Netlify 배포 시: Netlify Functions 사용 (API 키는 서버에서만 사용)
 * 로컬 개발 시: VITE_PERPLEXITY_API_KEY 환경 변수 사용 (fallback)
 * 
 * 자세한 내용은 NETLIFY_FUNCTIONS_GUIDE.md를 참고하세요.
 */
import { PerplexityPurpose, AIResponse } from '../types';

// Netlify Functions 엔드포인트
const NETLIFY_FUNCTION_URL = '/.netlify/functions/perplexity';

// 로컬 개발용 환경 변수 (fallback)
const LOCAL_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY || '';
const LOCAL_API_ENDPOINT = import.meta.env.VITE_PERPLEXITY_API_ENDPOINT || 'https://api.perplexity.ai/chat/completions';

// Netlify Functions를 사용할지 로컬 API를 사용할지 결정
const USE_NETLIFY_FUNCTIONS = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

// 환경 변수 로딩 확인 (디버깅용 - 개발 환경에서만)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('🔍 Perplexity API 설정 확인:', {
    useNetlifyFunctions: USE_NETLIFY_FUNCTIONS,
    hasLocalApiKey: !!LOCAL_API_KEY,
    functionUrl: NETLIFY_FUNCTION_URL
  });
}

export async function searchRecentScienceInfo(
  purpose: PerplexityPurpose,
  query: string
): Promise<AIResponse> {
  try {
    const prompt = buildSearchPrompt(purpose, query);

    const messages = [
      {
        role: 'system',
        content: '너는 초등학교 4학년 학생들을 위한 과학 자료 도우미야. 최신 정보를 찾아서 초등학생이 이해할 수 있게 쉽고 짧게 설명해줘. 답변은 4-6문장으로 해줘.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    if (USE_NETLIFY_FUNCTIONS) {
      // Netlify Functions 사용 (프로덕션)
      try {
        const response = await fetch(NETLIFY_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Netlify Function 오류: ${response.status} - ${errorData.error || '알 수 없는 오류'}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Netlify Function 호출 오류:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Netlify Function 호출에 실패했습니다.'
        };
      }
    } else {
      // 로컬 개발 환경 (fallback)
      if (!LOCAL_API_KEY || LOCAL_API_KEY === '') {
        return {
          success: false,
          error: 'Perplexity API 키가 설정되지 않았습니다. .env 파일에 VITE_PERPLEXITY_API_KEY를 설정하거나 Netlify에 배포하세요.'
        };
      }

      try {
        const response = await fetch(LOCAL_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LOCAL_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages,
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
