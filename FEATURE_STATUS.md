# 기능 상태 정리 📋

이 문서는 현재 프로젝트에서 작동하는 기능과 작동하지 않는 기능을 정리한 것입니다.

## ✅ 작동하는 기능 (API 키 불필요)

### 1. 사용자 인증 및 로그인
- ✅ **학생 로그인**: 이름과 비밀번호로 로그인
- ✅ **교사 로그인**: 인증코드 `cheongdam2025`로 교사 대시보드 접근
- ✅ **자동 계정 생성**: 처음 사용하는 학생은 자동으로 계정 생성
- ⚠️ **필수**: Firebase 설정 필요

### 2. 탐구 노트 작성 (기본 기능)
- ✅ **오늘의 탐구 주제 입력**: 텍스트 입력
- ✅ **진도표에서 차시 선택**: 내장된 진도표에서 차시 선택 가능
- ✅ **선택한 차시 뱃지 표시**: 선택한 단원/차시 정보가 뱃지로 표시
- ✅ **궁금한 내용 (마인드맵)**: 마인드맵 형식으로 생각 정리
- ✅ **궁금한 내용 (텍스트)**: 텍스트로도 입력 가능 (선택사항)
- ✅ **관찰한 내용**: 텍스트 입력
- ✅ **내가 알고 있는 것**: 텍스트 입력
- ✅ **모둠에서 정한 탐구 문제**: 텍스트 입력
- ✅ **탐구 방법**: 텍스트 입력
- ✅ **오늘의 탐구 활동 후 알게 된 것**: 텍스트 입력
- ✅ **그림으로 표현하기**: 캔버스에 그림 그리기 (커서 위치 수정 완료)
- ✅ **자동 저장**: 30초마다 자동 저장

### 3. 표와 그래프 기능
- ✅ **데이터 표 만들기**: 행/열 설정, 데이터 입력, 헤더 설정
- ✅ **막대 그래프 만들기**: 데이터 입력, 색상 선택, 축 레이블 설정
- ✅ **표/그래프 저장**: Firebase에 저장
- ✅ **표/그래프 불러오기**: 저장된 표/그래프 불러오기

### 4. 자료 추가 기능
- ✅ **파일 업로드**: 이미지, PDF 등 파일 업로드
- ✅ **이미지 미리보기**: JPG, PNG 등 이미지 파일 미리보기
- ✅ **PDF 미리보기**: PDF 파일 아이콘 및 "PDF 보기" 버튼
- ✅ **링크 추가**: URL 입력 및 설명 추가
- ✅ **링크 클릭**: 저장된 링크를 클릭하면 새 탭에서 열림
- ✅ **음성 녹음**: 브라우저 마이크로 음성 녹음
- ✅ **음성 재생**: 녹음한 음성 재생
- ✅ **음성 다운로드**: MP3 형식으로 다운로드
- ✅ **파일/링크 삭제**: 업로드한 파일이나 링크 삭제

### 5. 교사 대시보드
- ✅ **전체 학생 목록**: 모든 학생 목록 표시
- ✅ **학생 검색**: 이름으로 학생 검색
- ✅ **학생별 탐구 노트 조회**: 각 학생의 탐구 기록 확인
- ✅ **날짜별 노트 보기**: 날짜별로 정리된 탐구 노트 확인
- ⚠️ **필수**: Firebase 설정 필요

### 6. 데이터 저장 및 불러오기
- ✅ **Firebase 저장**: 모든 탐구 노트 데이터 Firebase에 저장
- ✅ **localStorage 백업**: 오프라인 대비 로컬 저장
- ✅ **데이터 불러오기**: 저장된 탐구 노트 불러오기
- ✅ **날짜별 노트 관리**: 날짜별로 탐구 노트 생성 및 관리
- ⚠️ **필수**: Firebase 설정 필요

---

## ⚠️ 조건부 작동 기능 (API 키 필요)

### 1. AI 도움 기능 (ChatGPT API 필요)

#### 작동 조건
- ✅ `.env` 파일에 `VITE_OPENAI_API_KEY` 설정
- ✅ `.env` 파일에 `VITE_OPENAI_API_ENDPOINT` 설정 (기본값: `https://api.openai.com/v1/chat/completions`)
- ✅ `.env` 파일에 `VITE_OPENAI_MODEL` 설정 (기본값: `gpt-4o-mini`)

#### 작동하는 기능
- ✅ **질문이 잘 떠오르지 않아요**: 궁금한 내용에 대한 질문 생성 도움
- ✅ **관찰이 어려워요**: 관찰 내용 작성 도움
- ✅ **탐구 방법이 생각나지 않아요**: 탐구 방법 제안
- ✅ **알게 된 것을 정리하기 어려워요**: 탐구 결과 정리 도움
- ✅ **과학자의 노트**: 유명 과학자(에디슨, 아인슈타인, 퀴리, 다윈, 뉴턴)와 대화
- ✅ **과학자와의 대화 연속성**: 이전 대화 내용을 기억하고 연속적인 대화 가능

#### 작동하지 않는 경우
- ❌ API 키가 없으면: "OpenAI API 키가 설정되지 않았습니다" 오류 메시지 표시
- ❌ API 키가 잘못되었으면: API 요청 실패 오류
- ❌ 결제 정보가 없으면: OpenAI API 사용 불가

### 2. 최신 과학 정보 검색 (Perplexity API 필요)

#### 작동 조건
- ✅ `.env` 파일에 `VITE_PERPLEXITY_API_KEY` 설정
- ✅ `.env` 파일에 `VITE_PERPLEXITY_API_ENDPOINT` 설정 (기본값: `https://api.perplexity.ai/chat/completions`)

#### 작동하는 기능
- ✅ **배경 지식이 필요해요**: 탐구 주제에 대한 배경 지식 제공
- ✅ **탐구 방법 정보**: 탐구 방법에 대한 정보 검색
- ✅ **비교 정보**: 비교 분석에 필요한 정보 검색

#### 작동하지 않는 경우
- ❌ API 키가 없으면: "Perplexity API 키가 설정되지 않았습니다" 오류 메시지 표시
- ❌ API 키가 잘못되었으면: API 요청 실패 오류
- ⚠️ **참고**: Perplexity API는 베타 서비스로, 신청 후 승인이 필요할 수 있음

---

## ❌ 현재 작동하지 않는 기능

현재 알려진 작동하지 않는 기능은 없습니다.

단, API 키가 설정되지 않은 경우:
- AI 도움 버튼은 클릭 가능하지만, 오류 메시지가 표시됩니다.
- 과학자의 노트는 생성할 수 없습니다.

---

## 📊 기능 작동 요약표

| 기능 | 작동 여부 | 필수 요구사항 | 비고 |
|------|----------|--------------|------|
| 학생 로그인 | ✅ | Firebase | - |
| 교사 로그인 | ✅ | Firebase | 인증코드: `cheongdam2025` |
| 탐구 노트 작성 | ✅ | Firebase | - |
| 마인드맵 | ✅ | 없음 | 브라우저만 필요 |
| 표 만들기 | ✅ | Firebase | 저장 시 필요 |
| 그래프 만들기 | ✅ | Firebase | 저장 시 필요 |
| 그림 그리기 | ✅ | 없음 | 브라우저만 필요 |
| 파일 업로드 | ✅ | Firebase | 저장 시 필요 |
| 이미지 미리보기 | ✅ | 없음 | 브라우저만 필요 |
| PDF 미리보기 | ✅ | 없음 | 브라우저만 필요 |
| 링크 추가/클릭 | ✅ | 없음 | 브라우저만 필요 |
| 음성 녹음 | ✅ | 없음 | 브라우저 마이크 필요 |
| 음성 다운로드 | ✅ | 없음 | 브라우저만 필요 |
| 자동 저장 (30초) | ✅ | Firebase | 저장 시 필요 |
| 교사 대시보드 | ✅ | Firebase | - |
| 진도표 선택 | ✅ | 없음 | 내장 데이터 |
| AI 질문 도움 | ⚠️ | ChatGPT API | API 키 필요 |
| AI 관찰 도움 | ⚠️ | ChatGPT API | API 키 필요 |
| AI 탐구 방법 도움 | ⚠️ | ChatGPT API | API 키 필요 |
| AI 정리 도움 | ⚠️ | ChatGPT API | API 키 필요 |
| 과학자의 노트 | ⚠️ | ChatGPT API | API 키 필요 |
| 배경 지식 검색 | ⚠️ | Perplexity API | API 키 필요 |
| 탐구 방법 정보 | ⚠️ | Perplexity API | API 키 필요 |
| 비교 정보 검색 | ⚠️ | Perplexity API | API 키 필요 |

---

## 🔧 설정 방법

### 최소 설정 (기본 기능만 사용)
```env
# Firebase만 설정하면 기본 기능 모두 사용 가능
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 전체 기능 사용 (AI 기능 포함)
```env
# Firebase (필수)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# OpenAI (선택사항 - AI 도움 기능)
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_OPENAI_MODEL=gpt-4o-mini

# Perplexity (선택사항 - 최신 정보 검색)
VITE_PERPLEXITY_API_KEY=pplx-...
VITE_PERPLEXITY_API_ENDPOINT=https://api.perplexity.ai/chat/completions
```

자세한 설정 방법은 [API_SETUP.md](./API_SETUP.md)를 참고하세요.

---

## 🐛 알려진 제한사항

1. **오프라인 모드**: Firebase 연결이 없으면 데이터 저장이 되지 않습니다. localStorage에 임시 저장은 되지만, 서버 동기화는 불가능합니다.

2. **파일 크기 제한**: Firebase Firestore는 문서 크기 제한(1MB)이 있어, 매우 큰 이미지나 음성 파일은 저장되지 않을 수 있습니다.

3. **브라우저 호환성**: 
   - 음성 녹음은 최신 브라우저(Chrome, Edge, Firefox)에서만 작동합니다.
   - Safari에서는 일부 기능이 제한될 수 있습니다.

4. **API 비용**: 
   - ChatGPT API는 사용량에 따라 비용이 발생합니다.
   - Perplexity API는 베타 서비스로 가격 정책이 변경될 수 있습니다.

---

## 📝 업데이트 이력

- **2024-12-XX**: 초기 기능 상태 문서 작성
- 모든 주요 기능 작동 확인 완료
- API 키 필요 기능 명시

---

## 💡 문제 해결

### AI 기능이 작동하지 않을 때
1. `.env` 파일에 API 키가 올바르게 설정되었는지 확인
2. 개발 서버 재시작 (`npm run dev`)
3. 브라우저 콘솔에서 오류 메시지 확인

### Firebase 연결이 안 될 때
1. `.env` 파일에 Firebase 설정이 올바른지 확인
2. Firebase Console에서 Firestore Database가 활성화되었는지 확인
3. Firebase 보안 규칙 확인

자세한 문제 해결 방법은 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)를 참고하세요.

