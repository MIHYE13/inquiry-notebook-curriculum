/**
 * OpenAI ChatGPT API 통합 모듈
 * 
 * ⚠️ 작동 조건: OpenAI API 키가 .env 파일에 설정되어 있어야 합니다.
 * - VITE_OPENAI_API_KEY: OpenAI API 키 (필수)
 * - VITE_OPENAI_API_ENDPOINT: API 엔드포인트 (기본값: https://api.openai.com/v1/chat/completions)
 * - VITE_OPENAI_MODEL: 사용할 모델 (기본값: gpt-4o-mini)
 * 
 * 기능:
 * - 탐구 주제 추천
 * - 질문 생성 도움
 * - 탐구 문제 다듬기
 * - 생각 정리 도움
 * - 과학자의 노트 생성 (대화형)
 * 
 * API 키가 없으면 오류 메시지가 반환됩니다.
 * 자세한 내용은 FEATURE_STATUS.md를 참고하세요.
 */
import { AIHelpType, AIResponse } from '../types';

// 환경 변수 로딩 (런타임에서 확인)
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const API_ENDPOINT = import.meta.env.VITE_OPENAI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
const MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

// 환경 변수 로딩 확인 (디버깅용 - 개발 환경에서만)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('🤖 ChatGPT API 설정 확인:', {
    hasApiKey: !!API_KEY,
    apiKeyLength: API_KEY ? API_KEY.length : 0,
    apiKeyPrefix: API_KEY ? API_KEY.substring(0, 10) + '...' : '없음',
    endpoint: API_ENDPOINT,
    model: MODEL
  });
}

// 과학자의 노트 생성 (대화 컨텍스트 포함)
export async function generateScientistNote(
  scientistName: string,
  entryData: {
    todayTopic: string;
    questions: string;
    observations: string;
    findings: string;
    methods: string;
  },
  conversationHistory?: Array<{ role: 'scientist' | 'student'; content: string }>
): Promise<AIResponse> {
  if (!API_KEY || API_KEY === '') {
    return {
      success: false,
      error: 'OpenAI API 키가 설정되지 않았습니다.'
    };
  }

  try {
    const scientistPrompts: Record<string, string> = {
      '에디슨': '너는 발명왕 토마스 에디슨이야. 실험과 관찰을 중시하며, 실용적인 발명에 관심이 많아. 초등학교 4학년 학생에게 친근하고 격려하는 말투로 대화해줘.',
      '아인슈타인': '너는 물리학자 알베르트 아인슈타인이야. 호기심과 질문을 중요하게 생각하며, 학생들의 탐구 정신을 칭찬해줘. 초등학교 4학년 학생에게 친근하고 격려하는 말투로 대화해줘.',
      '퀴리': '너는 과학자 마리 퀴리야. 관찰과 실험을 통해 진실을 찾는 것을 좋아해. 초등학교 4학년 학생에게 친근하고 격려하는 말투로 대화해줘.',
      '다윈': '너는 생물학자 찰스 다윈이야. 자연을 관찰하고 패턴을 찾는 것을 좋아해. 초등학교 4학년 학생에게 친근하고 격려하는 말투로 대화해줘.',
      '뉴턴': '너는 물리학자 아이작 뉴턴이야. 자연 현상을 관찰하고 원리를 찾는 것을 좋아해. 초등학교 4학년 학생에게 친근하고 격려하는 말투로 대화해줘.'
    };

    const systemPrompt = scientistPrompts[scientistName] || scientistPrompts['에디슨'];

    // 대화 히스토리가 있으면 대화 형식, 없으면 초기 코멘트
    let messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      // 대화 히스토리가 있으면 이전 대화를 포함
      const historyMessages = conversationHistory.map(msg => ({
        role: msg.role === 'scientist' ? 'assistant' as const : 'user' as const,
        content: msg.content
      }));
      messages = [...messages, ...historyMessages];
    } else {
      // 초기 코멘트
      const userPrompt = `초등학교 4학년 학생이 오늘 과학 탐구를 했어.

탐구 주제: ${entryData.todayTopic || '없음'}
궁금한 내용: ${entryData.questions || '없음'}
관찰한 내용: ${entryData.observations || '없음'}
탐구 방법: ${entryData.methods || '없음'}
알게 된 사실: ${entryData.findings || '없음'}

이 학생의 탐구 내용을 보고, 과학자의 입장에서 친근하게 대화형으로 코멘트해줘. 
- 학생의 탐구 과정을 칭찬해줘
- 과학적 사실이나 원리를 간단히 설명해줘
- 더 탐구해볼 만한 질문을 제시해줘
- 초등학교 4학년 수준에 맞게 쉽고 재미있게 설명해줘

대화 형식으로 3-5문장 정도로 답변해줘.`;
      
      messages.push({
        role: 'user',
        content: userPrompt
      });
    }

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '응답을 받지 못했습니다.';

    return {
      success: true,
      data: aiResponse
    };
  } catch (error) {
    console.error('ChatGPT API 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    };
  }
}

export async function suggestQuestionsOrHints(
  type: AIHelpType,
  currentData: {
    todayTopic?: string;
    questions?: string;
    groupQuestion?: string;
    findings?: string;
    priorKnowledge?: string;
  }
): Promise<AIResponse> {
  if (!API_KEY || API_KEY === '') {
    return {
      success: false,
      error: 'OpenAI API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.'
    };
  }

  try {
    const prompt = buildPrompt(type, currentData);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: '너는 초등학교 4학년 학생들의 과학 탐구를 돕는 친절한 선생님이야. 학생들이 이해하기 쉽게, 따뜻하고 격려하는 말투로 답변해줘. 답변은 2-4문장 정도로 간결하게 해줘.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '응답을 받지 못했습니다.';

    return {
      success: true,
      data: aiResponse
    };
  } catch (error) {
    console.error('ChatGPT API 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    };
  }
}

function buildPrompt(
  type: AIHelpType,
  data: {
    todayTopic?: string;
    questions?: string;
    groupQuestion?: string;
    findings?: string;
    priorKnowledge?: string;
  }
): string {
  switch (type) {
    case 'topic':
      return `초등학교 4학년 학생이 과학 탐구를 할 수 있는 흥미로운 주제 3가지를 추천해줘. 
각 주제는 간단하게 한 줄로 설명해줘. 학교나 집에서 쉽게 할 수 있는 주제로 부탁해.`;

    case 'studentQuestions':
      const topic = data.todayTopic || '과학 탐구';
      return `"${topic}"에 대해 초등학교 4학년 학생이 궁금해할 만한 질문 3가지를 만들어줘. 
각 질문은 관찰이나 실험으로 답을 찾을 수 있는 것으로 해줘.`;

    case 'groupQuestion':
      const groupQ = data.groupQuestion || '';
      if (groupQ) {
        return `초등학교 4학년 학생이 작성한 탐구 문제가 있어: "${groupQ}"
이 질문을 과학적 탐구 질문으로 다듬어줘. 구체적이고 측정 가능하며, 실험이나 관찰로 답을 찾을 수 있게 만들어줘.`;
      } else {
        return `좋은 과학 탐구 문제를 만드는 방법을 초등학교 4학년 수준에서 설명해줘. 
예시와 함께 3가지 팁을 알려줘.`;
      }

    case 'reflection':
      const findings = data.findings || data.priorKnowledge || '';
      if (findings) {
        return `초등학교 4학년 학생이 탐구 후 이런 내용을 발견했어: "${findings}"
학생이 자신의 생각 변화를 잘 정리할 수 있도록 3가지 질문을 해줘. 
예: "처음에 생각했던 것과 다른 점은?", "친구들과 의견이 달랐던 부분은?" 같은 질문들이야.`;
      } else {
        return `초등학교 4학년 학생이 탐구 활동 후 자신의 생각을 돌아볼 수 있는 질문 3가지를 만들어줘.
생각의 변화, 새로운 발견, 더 알고 싶은 것 등을 스스로 생각해볼 수 있는 질문으로 만들어줘.`;
      }

    default:
      return '과학 탐구를 도와주세요.';
  }
}
