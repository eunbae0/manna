# 소그룹

![sogroup_graphic_image](./sogroup_graphic_image.png)

> 크리스천을 위한 소그룹 나눔 플랫폼

## 주요 기능

- Firebase Auth 기반 Google/Apple 소셜 로그인
- 그룹 생성 및 초대 관리
- 자유게시판 및 공지사항 CRUD, 게시글 고정 기능
- QR코드를 통한 그룹 참여
- Firestore 트리거 기반 Cloud Functions를 통한 FCM 푸시 알림
- RichTextEditor를 통한 마크다운 지원 입력

## 기술 스택

- React Native & Expo SDK
- TypeScript
- Tailwind CSS (NativeWind)
- React Navigation (file-based routing)
- React Query v5
- Zustand
- Firebase Firestore, Firebase Authentication, Firebase Cloud Functions
- react-native-reanimated
- Biome.js
- Amplitude Analytics
- Sentry

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

### Cloud Functions 로컬 테스트

```bash
cd functions
yarn install
firebase emulators:start --only firestore,functions
```

## 구현

- **서비스 레이어**: `Firestore**Service` 싱글톤 패턴으로 구현하여 일관된 데이터 접근 및 메모리 효율성 확보

- **API 래퍼**: `withApiLogging`, `handleApiError`를 활용한 일관성 있는 에러 처리 및 로깅
- **데이터 페칭**: React Query v5를 통한 캐싱 및 상태 관리
- **훅(Hooks)**: `useNotification`으로 네비게이션 기반 알림 처리
- **Cloud Functions**: Firestore 트리거로 실시간 알림 전송 및 Firestore 저장

## 폴더 구조

```
/functions            # Firebase Cloud Functions
/src
  /api                # Firestore 서비스 레이어 및 API 함수
    /...   
  /app
    _layout.tsx       # 파일 기반 라우팅 레이아웃
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
