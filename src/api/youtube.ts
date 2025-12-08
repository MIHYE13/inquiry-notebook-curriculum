/**
 * YouTube Data API 통합 모듈
 * 
 * ⚠️ 작동 조건: YouTube Data API 키가 .env 파일에 설정되어 있어야 합니다.
 * - VITE_YOUTUBE_API_KEY: YouTube Data API 키 (필수)
 * 
 * 기능:
 * - 과학 탐구 관련 동영상 검색
 * - 동영상 정보 가져오기
 * 
 * API 키가 없으면 오류 메시지가 반환됩니다.
 * 자세한 내용은 FEATURE_STATUS.md를 참고하세요.
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

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const API_ENDPOINT = 'https://www.googleapis.com/youtube/v3';

// 환경 변수 로딩 확인 (디버깅용)
if (typeof window !== 'undefined') {
  console.log('📺 YouTube API 설정 확인:', {
    hasApiKey: !!API_KEY,
    apiKeyLength: API_KEY ? API_KEY.length : 0,
    apiKeyPrefix: API_KEY ? API_KEY.substring(0, 10) + '...' : '없음'
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
  if (!API_KEY || API_KEY === '') {
    console.warn('⚠️ YouTube API 키가 설정되지 않았습니다.');
    return {
      success: false,
      error: 'YouTube API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.'
    };
  }

  try {
    // 검색어에 "초등학교 과학" 또는 "과학 실험" 키워드 추가
    const searchQuery = `${query} 초등학교 과학 실험`;
    
    const searchUrl = `${API_ENDPOINT}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${maxResults}&key=${API_KEY}`;
    
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
    const detailsUrl = `${API_ENDPOINT}/videos?part=snippet,contentDetails&id=${videoIds}&key=${API_KEY}`;
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

/**
 * 특정 동영상 ID로 동영상 정보 가져오기
 * @param videoId YouTube 동영상 ID
 * @returns 동영상 정보
 */
export async function getVideoInfo(videoId: string): Promise<YouTubeSearchResponse> {
  if (!API_KEY || API_KEY === '') {
    return {
      success: false,
      error: 'YouTube API 키가 설정되지 않았습니다.'
    };
  }

  try {
    const url = `${API_ENDPOINT}/videos?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`;
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

