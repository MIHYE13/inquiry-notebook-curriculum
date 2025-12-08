# Netlify Functions를 사용한 API 키 보안 가이드 🔒

## ❓ 왜 필요한가요?

현재 프로젝트는 **클라이언트 사이드 앱**이므로, `VITE_*` 환경 변수는 빌드 시 JavaScript 파일에 포함되어 브라우저에서 볼 수 있습니다.

- ✅ **Firebase API 키**: 노출되어도 안전 (Security Rules로 보호)
- ❌ **OpenAI/Perplexity/YouTube API 키**: 노출되면 위험 (비용 발생 가능)

## ✅ 해결 방법: Netlify Functions

Netlify Functions를 사용하면 API 키를 **서버 사이드에서만** 사용할 수 있습니다.

---

## 📋 구현 방법

### 1단계: Netlify Functions 디렉토리 생성

```bash
mkdir -p netlify/functions
```

### 2단계: ChatGPT API 함수 생성

`netlify/functions/chatgpt.ts` 파일 생성:

```typescript
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { messages, model = 'gpt-4o-mini' } = JSON.parse(event.body || '{}');

    // 환경 변수에서 API 키 가져오기 (서버 사이드에서만 접근 가능)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured' }),
      };
    }

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '응답을 받지 못했습니다.';

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
    console.error('ChatGPT API error:', error);
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
```

### 3단계: Perplexity API 함수 생성

`netlify/functions/perplexity.ts` 파일 생성:

```typescript
import { Handler } from '@netlify/functions';

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
    const { messages } = JSON.parse(event.body || '{}');

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Perplexity API key not configured' }),
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
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0]?.message?.content || '응답을 받지 못했습니다.';

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
```

### 4단계: YouTube API 함수 생성

`netlify/functions/youtube.ts` 파일 생성:

```typescript
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const query = event.queryStringParameters?.q || '';
    const maxResults = parseInt(event.queryStringParameters?.maxResults || '5', 10);

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'YouTube API key not configured' }),
      };
    }

    const searchQuery = `${query} 초등학교 과학 실험`;
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${maxResults}&key=${apiKey}`;

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          data: [],
        }),
      };
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = detailsResponse.ok ? await detailsResponse.json() : { items: [] };

    const videos = searchData.items.map((item: any, index: number) => {
      const details = detailsData.items?.[index];
      const duration = details?.contentDetails?.duration;
      
      let durationSeconds = 0;
      if (duration) {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (match) {
          const hours = parseInt(match[1] || '0', 10);
          const minutes = parseInt(match[2] || '0', 10);
          const seconds = parseInt(match[3] || '0', 10);
          durationSeconds = hours * 3600 + minutes * 60 + seconds;
        }
      }
      
      const durationFormatted = durationSeconds > 0 
        ? `${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, '0')}`
        : undefined;

      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: durationFormatted,
      };
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        data: videos,
      }),
    };
  } catch (error) {
    console.error('YouTube API error:', error);
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
```

### 5단계: 패키지 설치

```bash
npm install --save-dev @netlify/functions @types/node
```

### 6단계: TypeScript 설정 업데이트

`tsconfig.json`에 추가:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "target": "ES2020",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*", "netlify/functions/**/*"]
}
```

### 7단계: 클라이언트 코드 수정

`src/api/chatgpt.ts` 수정:

```typescript
// 기존 코드 대신 Netlify Function 호출
export async function suggestQuestionsOrHints(
  type: AIHelpType,
  currentData: { ... }
): Promise<AIResponse> {
  try {
    const prompt = buildPrompt(type, currentData);
    
    // Netlify Function 호출 (API 키 없이)
    const response = await fetch('/.netlify/functions/chatgpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: '너는 초등학교 4학년 학생들의 과학 탐구를 돕는 친절한 선생님이야...',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'gpt-4o-mini',
      }),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('ChatGPT API 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}
```

### 8단계: Netlify 환경 변수 설정

Netlify 대시보드에서 환경 변수 이름 변경:

**기존 (클라이언트):**
- `VITE_OPENAI_API_KEY` ❌ (제거)

**새로운 (서버):**
- `OPENAI_API_KEY` ✅ (Netlify Functions에서만 사용)
- `PERPLEXITY_API_KEY` ✅
- `YOUTUBE_API_KEY` ✅

**중요**: `VITE_` 접두사를 제거하면 클라이언트에 노출되지 않습니다!

---

## 🔒 보안 비교

### ❌ 현재 방식 (클라이언트 사이드)
```
브라우저 → 직접 OpenAI API 호출
         → API 키가 JavaScript 파일에 포함됨
         → 누구나 볼 수 있음
         → 비용 발생 위험
```

### ✅ 개선된 방식 (서버 사이드)
```
브라우저 → Netlify Function 호출 (API 키 없음)
         → Netlify Function → OpenAI API 호출 (API 키 사용)
         → API 키는 서버에서만 사용
         → 브라우저에서는 볼 수 없음
         → 비용 안전
```

---

## 📋 체크리스트

- [ ] `netlify/functions` 디렉토리 생성
- [ ] ChatGPT Function 생성
- [ ] Perplexity Function 생성
- [ ] YouTube Function 생성
- [ ] `@netlify/functions` 패키지 설치
- [ ] 클라이언트 코드 수정 (API 키 제거)
- [ ] Netlify 환경 변수 설정 (`VITE_` 접두사 제거)
- [ ] 테스트 및 배포

---

## 💡 장점

1. **보안**: API 키가 클라이언트에 노출되지 않음
2. **비용 안전**: API 키를 악용할 수 없음
3. **유연성**: 서버 사이드에서 추가 검증/제한 가능
4. **모니터링**: Netlify Functions 로그로 사용량 추적 가능

---

## ⚠️ 주의사항

- Netlify Functions는 무료 플랜에서도 사용 가능하지만, 호출 횟수 제한이 있습니다
- 함수 실행 시간 제한: 10초 (무료 플랜), 26초 (Pro 플랜)
- 함수가 많아지면 빌드 시간이 증가할 수 있습니다

---

## 🎯 결론

Netlify Functions를 사용하면 API 키를 안전하게 보호할 수 있습니다. 특히 OpenAI/Perplexity 같은 유료 API는 반드시 서버 사이드로 이동하는 것이 좋습니다!

