import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event, _context) => {
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

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter "q" is required' }),
      };
    }

    // 환경 변수에서 API 키 가져오기 (서버 사이드에서만 접근 가능)
    // VITE_ 접두사 없이 사용
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error('YouTube API key not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'YouTube API 키가 설정되지 않았습니다. Netlify 환경 변수를 확인해주세요.' 
        }),
      };
    }

    const searchQuery = `${query} 초등학교 과학 실험`;
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${maxResults}&key=${apiKey}`;

    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      const errorData = await searchResponse.json().catch(() => ({}));
      console.error('YouTube API error:', searchResponse.status, errorData);
      throw new Error(`YouTube API error: ${searchResponse.status} - ${errorData.error?.message || '알 수 없는 오류'}`);
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

