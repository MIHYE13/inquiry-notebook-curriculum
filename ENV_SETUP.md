# 환경 변수 설정 가이드 🔐

이 프로젝트는 `.env` 파일을 사용하여 Firebase 및 API 키를 관리합니다.

## 📋 설정 방법

### 1단계: .env 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성하세요:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Mac/Linux
cp .env.example .env
```

또는 직접 `.env` 파일을 생성하고 아래 내용을 복사하세요.

### 2단계: Firebase 설정 정보 입력

1. **Firebase Console 접속**
   - https://console.firebase.google.com/ 접속
   - 프로젝트 선택 (또는 새 프로젝트 생성)

2. **웹 앱 설정 정보 가져오기**
   - 프로젝트 설정 (⚙️) > 일반 탭
   - "웹 앱에 Firebase 추가" (</>) 클릭
   - 앱 닉네임 입력 후 등록
   - Config 정보 복사

3. **.env 파일에 입력**
   ```env
   VITE_FIREBASE_API_KEY=복사한_apiKey_값
   VITE_FIREBASE_AUTH_DOMAIN=복사한_authDomain_값
   VITE_FIREBASE_PROJECT_ID=복사한_projectId_값
   VITE_FIREBASE_STORAGE_BUCKET=복사한_storageBucket_값
   VITE_FIREBASE_MESSAGING_SENDER_ID=복사한_messagingSenderId_값
   VITE_FIREBASE_APP_ID=복사한_appId_값
   ```

### 3단계: 개발 서버 실행

```bash
npm run dev
```

이제 로컬에서 Firebase가 정상적으로 작동합니다!

---

## 🚀 Netlify 배포 시 설정

**중요**: Netlify에 배포할 때는 환경 변수를 Netlify 대시보드에 설정해야 합니다.

### 방법 1: Netlify 대시보드에서 설정 (권장)

1. **Netlify 대시보드 접속**
   - https://app.netlify.com/ 접속
   - 사이트 선택

2. **환경 변수 설정**
   - Site settings > Environment variables
   - `.env` 파일의 값들을 하나씩 추가:
     - `VITE_FIREBASE_API_KEY` = `.env` 파일의 값
     - `VITE_FIREBASE_AUTH_DOMAIN` = `.env` 파일의 값
     - `VITE_FIREBASE_PROJECT_ID` = `.env` 파일의 값
     - `VITE_FIREBASE_STORAGE_BUCKET` = `.env` 파일의 값
     - `VITE_FIREBASE_MESSAGING_SENDER_ID` = `.env` 파일의 값
     - `VITE_FIREBASE_APP_ID` = `.env` 파일의 값

3. **재배포**
   - Deploys > Trigger deploy > Clear cache and deploy site

### 방법 2: Netlify CLI 사용 (고급)

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 환경 변수 설정
netlify env:set VITE_FIREBASE_API_KEY "your-api-key"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "your-domain"
# ... 나머지 변수들도 동일하게 설정

# 배포
netlify deploy --prod
```

---

## 🔒 보안 주의사항

### ✅ 해야 할 것

- [x] `.env` 파일을 `.gitignore`에 추가 (이미 완료됨)
- [x] `.env.example` 파일만 Git에 커밋 (실제 키 없이 템플릿만)
- [x] Netlify 환경 변수에 실제 키 값 설정
- [x] Firebase 보안 규칙 설정

### ❌ 하지 말아야 할 것

- [ ] `.env` 파일을 Git에 커밋
- [ ] `.env` 파일을 GitHub에 업로드
- [ ] 환경 변수를 코드에 하드코딩
- [ ] 공개 저장소에 실제 키 값 공유

---

## 📝 .env 파일 예시

```env
# Firebase 설정 (필수)
VITE_FIREBASE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project-12345
VITE_FIREBASE_STORAGE_BUCKET=my-project-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# OpenAI 설정 (선택사항)
VITE_OPENAI_API_KEY=sk-proj-abc123...
VITE_OPENAI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_OPENAI_MODEL=gpt-4o-mini

# Perplexity 설정 (선택사항)
VITE_PERPLEXITY_API_KEY=pplx-abc123...
VITE_PERPLEXITY_API_ENDPOINT=https://api.perplexity.ai/chat/completions

# YouTube Data API 설정 (선택사항)
VITE_YOUTUBE_API_KEY=your-youtube-api-key-here
```

---

## 🐛 문제 해결

### 문제: 환경 변수가 작동하지 않음

**해결 방법:**
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 변수 이름이 `VITE_`로 시작하는지 확인
3. 개발 서버 재시작 (`npm run dev`)
4. 빌드 시에는 Netlify 환경 변수 확인

### 문제: Netlify 배포 후 작동하지 않음

**해결 방법:**
1. Netlify 환경 변수가 모두 설정되어 있는지 확인
2. 변수 이름이 정확한지 확인 (`VITE_` 접두사 필수)
3. 재배포 (환경 변수 추가 후 필수)

---

## 💡 팁

- **로컬 개발**: `.env` 파일 사용
- **Netlify 배포**: Netlify 환경 변수 사용
- **환경 변수 변경 후**: 개발 서버 재시작 필요
- **빌드 시**: Netlify 환경 변수가 빌드에 포함됨

---

## 📚 관련 문서

- [API_SETUP.md](./API_SETUP.md) - Firebase 설정 상세 가이드
- [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) - Netlify 배포 가이드
- [FIREBASE_SECURITY.md](./FIREBASE_SECURITY.md) - Firebase 보안 가이드


