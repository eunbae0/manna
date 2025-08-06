from firebase_functions import https_fn
from firebase_admin import initialize_app
from ytmusicapi import YTMusic
import json

# Firebase 초기화
initialize_app()

# YTMusic 클라이언트 생성
ytmusic = YTMusic()

@https_fn.on_call()
def search_ytmusic(req: https_fn.CallableRequest) -> dict:
    """
    YouTube Music 검색 Callable Function
    """
    try:
        # 요청 데이터에서 파라미터 가져오기
        data = req.data
        query = data.get('query')
        limit = data.get('limit', 10)
        
        if not query:
            raise https_fn.HttpsError('invalid-argument', '검색어가 필요합니다.')
        
        # YouTube Music에서 검색 수행
        search_results = ytmusic.search(query, filter="songs", limit=limit)
        
        # 결과 포맷팅
        formatted_results = []
        for result in search_results:
            formatted_result = {
                "title": result.get("title", ""),
                "artist": result.get("artists", [{}])[0].get("name", "") if result.get("artists") else "",
                "album": result.get("album", {}).get("name", "") if result.get("album") else "",
                "duration": result.get("duration_seconds", 0),
                "thumbnail": result.get("thumbnails", [{}])[-1].get("url", "") if result.get("thumbnails") else "",
                "video_id": result.get("videoId", ""),
                "youtube_url": f"https://www.youtube.com/watch?v={result.get('videoId', '')}" if result.get("videoId") else "",
                "youtube_music_url": f"https://music.youtube.com/watch?v={result.get('videoId', '')}" if result.get("videoId") else ""
            }
            formatted_results.append(formatted_result)
        
        return {
            "success": True,
            "query": query,
            "results": formatted_results,
            "count": len(formatted_results)
        }
        
    except Exception as e:
        raise https_fn.HttpsError('internal', str(e))
