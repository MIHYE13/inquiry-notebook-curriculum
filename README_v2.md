# 온라인 탐구 성장 노트 v2.0 (진도표 통합 버전)

초등학교 4학년 학생들을 위한 **진도표 기반 AI 과학 탐구 노트** 웹 애플리케이션입니다.

## 🆕 v2.0 새로운 기능

### 📚 진도표 통합 기능
- **진도표에서 차시 선택**: 학기별 진도표에서 오늘 배울 차시를 바로 선택
- **자동 주제 설정**: 선택한 차시의 주제가 자동으로 탐구 노트에 입력
- **핵심어 제공**: 각 차시의 핵심어가 자동으로 표시
- **학습 목표 연동**: 차시별 학습 목표가 노트에 포함
- **4학년 전 학기 지원**: 1학기, 2학기 전체 진도표 내장 (총 46개 차시)

## 🚀 빠른 시작

```bash
cd inquiry-notebook-v2
npm install
cp .env.example .env
# .env 파일에 API 키 입력
npm run dev
```

## 📚 진도표 사용법

### 1단계: 진도표에서 차시 선택
<img src="https://via.placeholder.com/800x400/667eea/ffffff?text=진도표+선택+화면" alt="진도표 선택" />

1. 메인 화면 왼쪽 "📚 진도표에서 차시 선택" 버튼 클릭
2. 학기 선택 (4학년 1학기 or 2학기)
3. 대단원 필터 또는 검색으로 차시 찾기
4. 원하는 차시 카드 클릭

### 2단계: 자동 생성된 탐구 노트 확인
- ✅ 차시 주제가 "오늘의 탐구 주제"에 자동 입력
- ✅ 핵심어가 "궁금한 내용"에 제시
- ✅ 학습 목표가 "내가 알고 있는 것"에 입력

### 3단계: 탐구 활동 기록
- 🤖 AI 도움 버튼으로 질문 확장
- 📝 관찰 내용 상세 기록
- 🎨 그림으로 표현
- 📎 자료 추가

## 📋 기능 상태

현재 프로젝트의 작동하는 기능과 작동하지 않는 기능을 확인하려면 [FEATURE_STATUS.md](./FEATURE_STATUS.md)를 참고하세요.

### 빠른 요약
- ✅ **기본 기능**: Firebase만 설정하면 모든 기본 기능 사용 가능
- ⚠️ **AI 기능**: ChatGPT/Perplexity API 키 필요 (선택사항)
- ✅ **작동하는 기능**: 로그인, 탐구 노트 작성, 표/그래프, 마인드맵, 음성 녹음, 파일 업로드 등
- ⚠️ **조건부 작동**: AI 도움 기능, 과학자의 노트, 최신 정보 검색 (API 키 필요)

## 📚 추가 문서

- [FEATURE_STATUS.md](./FEATURE_STATUS.md) - 상세한 기능 상태 정리
- [API_SETUP.md](./API_SETUP.md) - API 설정 가이드
- [QUICKSTART.md](./QUICKSTART.md) - 빠른 시작 가이드
- [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) - Netlify 배포 문제 해결 가이드
- [FIREBASE_SECURITY.md](./FIREBASE_SECURITY.md) - Firebase 보안 가이드 (API 키 노출 관련)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 일반적인 문제 해결
