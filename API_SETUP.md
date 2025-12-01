# API 및 설정 종합 가이드 🔑

## 필요한 API 서비스

이 프로젝트는 3개의 주요 API 서비스를 사용합니다.

---

## 1️⃣ Firebase (필수)

### 용도
- 학생 데이터 저장
- 탐구 노트 저장
- 실시간 동기화

### 가격
- **무료 플랜**: 
  - Firestore 읽기: 50,000/일
  - Firestore 쓰기: 20,000/일
  - 저장: 1GB
- **학생 30명 기준**: 완전 무료

### 설정 방법

1. **Firebase Console 접속**
   - https://console.firebase.google.com/

2. **새 프로젝트 만들기**
   - "프로젝트 추가" 클릭
   - 프로젝트 이름 입력
   - Google Analytics 비활성화 (선택사항)

3. **Firestore Database 활성화**
   - 빌드 > Firestore Database
   - "데이터베이스 만들기"
   - 위치: asia-northeast3 (서울) 선택
   - 보안 규칙: "테스트 모드"로 시작

4. **웹 앱 추가**
   - 프로젝트 설정 (⚙️) > 일반
   - "웹 앱에 Firebase 추가" (</>)
   - 앱 닉네임 입력
   - Firebase Hosting 체크 해제

5. **Config 정보 복사**


6. **환경 변수로 저장**
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

---

## 2️⃣ OpenAI (ChatGPT) - 선택사항

### 용도
- 탐구 주제 추천
- 질문 생성 도움
- 탐구 문제 다듬기
- 생각 정리 도움

### 가격
- **GPT-4o-mini**: 
  - 입력: $0.15 / 1M 토큰
  - 출력: $0.60 / 1M 토큰
- **학생 30명, 하루 10회 사용**: $1-2/월
- **무료 크레딧**: 신규 가입 시 $5 제공

### 설정 방법

1. **OpenAI Platform 가입**
   - https://platform.openai.com/

2. **API Key 발급**
   - Settings > API Keys
   - "Create new secret key" 클릭
   - 이름 입력 (예: inquiry-notebook)
   - 키 복사 (한 번만 표시됨!)

3. **결제 정보 등록**
   - Settings > Billing
   - 결제 방법 추가
   - 사용량 한도 설정 (예: $10/월)

4. **환경 변수 설정**
```env
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_OPENAI_MODEL=gpt-4o-mini
```

### 비용 절감 팁
- 모델: `gpt-4o-mini` 사용 (가장 저렴)
- `max_tokens` 제한: 500
- 캐싱 전략 사용

---

## 3️⃣ Perplexity - 선택사항

### 용도
- 최신 과학 정보 검색
- 배경 지식 제공
- 탐구 방법 예시
- 과학적 설명

### 가격
- **2024년 기준**: 베타 서비스
- 가격 정책 확인 필요
- API 접근은 신청 후 승인

### 설정 방법

1. **Perplexity 계정 생성**
   - https://www.perplexity.ai/

2. **API 접근 신청**
   - API 베타 프로그램 신청
   - 승인 대기 (보통 1-3일)

3. **API Key 발급**
   - 대시보드에서 API 키 생성

4. **환경 변수 설정**
```env
VITE_PERPLEXITY_API_KEY=pplx-...
VITE_PERPLEXITY_API_ENDPOINT=https://api.perplexity.ai/chat/completions
```

### 대체 옵션
Perplexity API를 사용할 수 없는 경우:
- Google Custom Search API
- Bing Search API
- 또는 AI 기능 없이 기본 노트 기능만 사용

---

## 환경 변수 설정 완전 가이드

### 로컬 개발

1. **`.env` 파일 생성**
```bash
cp .env.example .env
```

2. **모든 키 입력**
```env
# Firebase (필수)
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# OpenAI (선택)
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_OPENAI_MODEL=gpt-4o-mini

# Perplexity (선택)
VITE_PERPLEXITY_API_KEY=pplx-...
VITE_PERPLEXITY_API_ENDPOINT=https://api.perplexity.ai/chat/completions
```

3. **개발 서버 실행**
```bash
npm run dev
```

### Netlify 배포

1. **Netlify Dashboard**
   - Site settings > Environment variables

2. **변수 추가**
   - Key: `VITE_FIREBASE_API_KEY`
   - Value: 실제 키
   - 모든 변수에 대해 반복

3. **재배포**
   - Deploys > Trigger deploy

---

## 보안 체크리스트

### ✅ 해야 할 것

- [x] `.gitignore`에 `.env` 포함
- [x] API 키를 코드에 하드코딩하지 않기
- [x] Firebase 보안 규칙 설정
- [x] OpenAI 사용량 한도 설정
- [x] 프로덕션 빌드 테스트

### ❌ 하지 말아야 할 것

- [ ] `.env` 파일을 Git에 커밋
- [ ] API 키를 코드에 직접 작성
- [ ] 모든 권한을 공개로 설정
- [ ] 사용량 모니터링 무시

---

## 최소 설정으로 시작하기

AI 기능 없이 기본 노트만 사용:

```env
# Firebase만 필수
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# 나머지는 나중에 추가 가능
```

이렇게 하면:
- ✅ 탐구 노트 작성 가능
- ✅ 데이터 저장/불러오기 가능
- ✅ 그림 그리기 가능
- ❌ AI 도움 버튼은 비활성화

---

## 비용 요약

### 월 예상 비용 (학생 30명 기준)

| 서비스 | 무료 | 유료 |
|--------|------|------|
| Firebase | ✅ $0 | - |
| OpenAI | $5 무료 크레딧 | $1-2/월 |
| Perplexity | 미확인 | 미확인 |
| **총계** | **$0** | **$1-2/월** |

### 학생 100명으로 확장

| 서비스 | 비용 |
|--------|------|
| Firebase | $0-5/월 |
| OpenAI | $5-10/월 |
| Perplexity | TBD |
| **총계** | **$10-20/월** |

---

## 문제 해결

### Firebase 연결 안 됨
```bash
# 1. .env 파일 확인
cat .env

# 2. 개발 서버 재시작
npm run dev
```

### OpenAI 요청 실패
```bash
# API 키 테스트
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $VITE_OPENAI_API_KEY"
```

### 환경 변수가 undefined
```bash
# Vite는 VITE_ 접두사 필요
echo $VITE_FIREBASE_API_KEY  # ✅
echo $FIREBASE_API_KEY       # ❌
```

---

## 지원

- **Firebase**: https://firebase.google.com/support
- **OpenAI**: https://help.openai.com/
- **Perplexity**: https://www.perplexity.ai/hub/faq

---

**준비 완료!** 이제 프로젝트를 시작할 수 있습니다. 🚀
