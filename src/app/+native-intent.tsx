export function redirectSystemPath({ path }) {
  try {
      const url = new URL(path, 'manna://');
      
      // AppsFlyer OneLink 감지 및 처리
      // params에 af_deeplink가 있으면 홈으로 리다이렉션
      if (url.searchParams.get('af_deeplink') === 'true') {
        return '/';
      }
      
      // 기본 host가 'af'이기 때문에 다른 url로 라우팅되는 문제 발생
      // 따라서 홈으로 리다이렉션
      if (url.host === 'af') {
        return '/';
      }
      
      return path;
  } catch {
    return '/';
  }
}
