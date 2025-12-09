/**
 * YouTube Data API 통합 모듈
 * 
 * ✅ 보안 개선: Netlify Functions를 통해 API 키를 서버 사이드에서만 사용합니다.
 * 
 * 기능:
 * - 과학 탐구 관련 동영상 검색
 * - 동영상 정보 가져오기
 * 
 * Netlify 배포 시: Netlify Functions 사용 (API 키는 서버에서만 사용)
 * 로컬 개발 시: VITE_YOUTUBE_API_KEY 환경 변수 사용 (fallback)
 * 
 * 자세한 내용은 NETLIFY_FUNCTIONS_GUIDE.md를 참고하세요.
 */

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
}

export interface YouTubeSearchResponse {
  success: boolean;
  data?: YouTubeVideo[];
  error?: string;
}

// Netlify Functions 엔드포인트
const NETLIFY_FUNCTION_URL = '/.netlify/functions/youtube';

// 로컬 개발용 환경 변수 (fallback)
const LOCAL_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const LOCAL_API_ENDPOINT = 'https://www.googleapis.com/youtube/v3';

// Netlify Functions를 사용할지 로컬 API를 사용할지 결정
// 프로덕션 환경 감지: localhost가 아니거나 netlify.app 도메인인 경우
const isProduction = typeof window !== 'undefined' && (
  window.location.hostname.includes('netlify.app') ||
  window.location.hostname.includes('netlify.com') ||
  (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1'))
);
const USE_NETLIFY_FUNCTIONS = typeof window !== 'undefined' && isProduction;

// 환경 변수 로딩 확인 (디버깅용 - 항상 로그 출력)
if (typeof window !== 'undefined') {
  console.log('📺 YouTube API 설정 확인:', {
    hostname: window.location.hostname,
    isProduction,
    useNetlifyFunctions: USE_NETLIFY_FUNCTIONS,
    hasLocalApiKey: !!LOCAL_API_KEY,
    functionUrl: NETLIFY_FUNCTION_URL,
    env: import.meta.env.MODE
  });
}

/**
 * 과학 탐구 주제와 관련된 YouTube 동영상 검색
 * @param query 검색어 (예: "물의 상태 변화", "식물의 성장")
 * @param maxResults 최대 결과 수 (기본값: 5)
 * @returns YouTube 동영상 목록
 */
export async function searchScienceVideos(
  query: string,
  maxResults: number = 5
): Promise<YouTubeSearchResponse> {
  if (USE_NETLIFY_FUNCTIONS) {
    // Netlify Functions 사용 (프로덕션)
    try {
      const url = `${NETLIFY_FUNCTION_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;
      console.log('📡 Netlify Function 호출 (YouTube):', {
        url,
        method: 'GET',
        hostname: window.location.hostname
      });

      const response = await fetch(url);

      console.log('📡 Netlify Function 응답 (YouTube):', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          const text = await response.text();
          errorData = text ? JSON.parse(text) : {};
        } catch (e) {
          console.error('응답 파싱 오류:', e);
        }
        
        console.error('❌ Netlify Function 오류 (YouTube):', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });

        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(`Netlify Function 오류: ${errorMessage}`);
      }

      const result = await response.json();
      console.log('✅ Netlify Function 성공 (YouTube):', result);
      return result;
    } catch (error) {
      console.error('❌ Netlify Function 호출 오류 (YouTube):', {
        error,
        message: error instanceof Error ? error.message : String(error),
        url: NETLIFY_FUNCTION_URL,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Netlify Function 호출에 실패했습니다.';
      
      // 네트워크 오류인 경우 더 자세한 안내
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        return {
          success: false,
          error: '네트워크 연결을 확인해주세요. Netlify Functions가 배포되었는지 확인하세요.'
        };
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  } else {
    // 로컬 개발 환경 (fallback)
    if (!LOCAL_API_KEY || LOCAL_API_KEY === '') {
      console.warn('⚠️ YouTube API 키가 설정되지 않았습니다.');
      return {
        success: false,
        error: 'YouTube API 키가 설정되지 않았습니다. .env 파일에 VITE_YOUTUBE_API_KEY를 설정하거나 Netlify에 배포하세요.'
      };
    }

    try {
      // 검색어에 "초등학교 과학" 또는 "과학 실험" 키워드 추가
      const searchQuery = `${query} 초등학교 과학 실험`;
      
      const searchUrl = `${LOCAL_API_ENDPOINT}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${maxResults}&key=${LOCAL_API_KEY}`;
      
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json().catch(() => ({}));
        throw new Error(`YouTube API 요청 실패: ${searchResponse.status} - ${errorData.error?.message || '알 수 없는 오류'}`);
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.items || searchData.items.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      // 동영상 ID 목록 추출
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
      
      // 동영상 상세 정보 가져오기 (재생 시간 포함)
      const detailsUrl = `${LOCAL_API_ENDPOINT}/videos?part=snippet,contentDetails&id=${videoIds}&key=${LOCAL_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      
      if (!detailsResponse.ok) {
        // 상세 정보를 가져오지 못해도 검색 결과는 반환
        console.warn('⚠️ 동영상 상세 정보를 가져오지 못했습니다.');
      }

      const detailsData = await detailsResponse.ok ? await detailsResponse.json() : { items: [] };
      
      // 검색 결과와 상세 정보 결합
      const videos: YouTubeVideo[] = searchData.items.map((item: any, index: number) => {
        const details = detailsData.items?.[index];
        const duration = details?.contentDetails?.duration;
        
        // ISO 8601 형식의 재생 시간을 초 단위로 변환
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
          duration: durationFormatted
        };
      });

      return {
        success: true,
        data: videos
      };
    } catch (error) {
      console.error('YouTube API 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }
}

/**
 * 특정 동영상 ID로 동영상 정보 가져오기
 * @param videoId YouTube 동영상 ID
 * @returns 동영상 정보
 */
export async function getVideoInfo(videoId: string): Promise<YouTubeSearchResponse> {
  // 이 함수는 현재 Netlify Function에서 지원하지 않으므로 로컬 API만 사용
  if (!LOCAL_API_KEY || LOCAL_API_KEY === '') {
    return {
      success: false,
      error: 'YouTube API 키가 설정되지 않았습니다. .env 파일에 VITE_YOUTUBE_API_KEY를 설정하거나 Netlify에 배포하세요.'
    };
  }

  try {
    const url = `${LOCAL_API_ENDPOINT}/videos?part=snippet,contentDetails&id=${videoId}&key=${LOCAL_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return {
        success: false,
        error: '동영상을 찾을 수 없습니다.'
      };
    }

    const item = data.items[0];
    const duration = item.contentDetails?.duration;
    
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

    const video: YouTubeVideo = {
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: durationFormatted
    };

    return {
      success: true,
      data: [video]
    };
  } catch (error) {
    console.error('YouTube API 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    };
  }
}

