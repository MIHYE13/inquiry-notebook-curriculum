import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages array is required' }),
      };
    }

    // 환경 변수에서 API 키 가져오기 (서버 사이드에서만 접근 가능)
    // VITE_ 접두사 없이 사용
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      console.error('Perplexity API key not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Perplexity API 키가 설정되지 않았습니다. Netlify 환경 변수를 확인해주세요.' 
        }),
      };
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages,
        max_tokens: 600,
        temperature: 0.3,
        return_citations: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Perplexity API error:', response.status, errorData);
      throw new Error(`Perplexity API error: ${response.status} - ${errorData.error?.message || '알 수 없는 오류'}`);
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
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        data: aiResponse,
      }),
    };
  } catch (error) {
    console.error('Perplexity API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      }),
    };
  }
};

