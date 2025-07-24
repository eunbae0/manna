# 만나

<img src="./manna_intro_image.png" alt="Manna Intro" style="width:80%;">

> 믿음의 여정을 함께하는 우리들의 소통 공간

## 주요 기능

- Firebase Auth 기반 Google/Apple 소셜 로그인
- 그룹 생성 및 초대 관리, QR코드를 이용한 그룹 참여
- 자유게시판 및 공지사항 CRUD, 이미지 첨부 및 게시글 고정 기능
- Firestore 트리거 기반 Cloud Functions을 이용한 실시간 FCM 푸시 알림
- 설교 노트 오프라인 저장 및 온라인 동기화
- Local 성경 json 파일을 이용한 성경 렌더링 및 바로가긴

## 기술 스택

- React Native & Expo SDK
- TypeScript
- Tailwind CSS (NativeWind)
- React Query v5
- Zustand
- Firebase Firestore, Authentication, Cloud Functions
- react-native-reanimated
- Biome.js
- Amplitude Analytics
- Sentry
- Windsurf, Gemini Code

## 설치 및 실행

```bash
git clone https://github.com/so-group/so-group.git
cd so-group
yarn install

# iOS
npx expo run:ios

# Android
npx expo run:android --variant debug --device
```

## 배포 (bare distribution without EAS)
```bash
# iOS
xed ios

# Android
yarn run build-production:android:local
```

### Cloud Functions 배포

```bash
cd functions
yarn install
yarn run deploy
```

## 구현

- **서비스 레이어**: `##Service` 싱글톤 패턴으로 구현하여 일관된 데이터 접근 및 메모리 효율성 확보
- **API 래퍼**: `withApiLogging`, `handleApiError`를 활용한 일관성 있는 에러 처리 및 로깅
- **Data Fetching**: React Query v5를 통한 캐싱, 상태 관리 및 선언적 프로그래밍
- **Hooks**: `useNotification`으로 네비게이션 기반 알림 처리
- **Cloud Functions**: Firestore 트리거로 실시간 알림 전송 및 Firestore 저장

## 폴더 구조

```
/functions            # Firebase Cloud Functions
/src
  /api                # Firestore 서비스 레이어 및 API 함수
    /...   
  /app
    _layout.tsx       # 파일 기반 라우팅 레이아웃
    /...
  /features           # 도메인 기반 분리
    /...
  /shared             # 공통 컴포넌트, 훅 래퍼, 유틸리티
    /components
    /hooks
    /utils
    /constants
    /types
    /...
  /store              # Zustand 상태 관리
```
