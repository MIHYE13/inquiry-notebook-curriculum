import { AIHelpType, AIResponse } from '../types';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const API_ENDPOINT = import.meta.env.VITE_OPENAI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
const MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

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
