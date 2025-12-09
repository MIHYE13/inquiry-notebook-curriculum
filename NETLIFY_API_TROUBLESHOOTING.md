# Netlify API 호출 문제 해결 가이드 🔧

## 문제 진단

Netlify에 배포한 웹앱에서 AI 기능이 작동하지 않는 경우, 다음 단계를 따라 문제를 진단하세요.

---

## 1️⃣ 브라우저 콘솔 확인

### 개발자 도구 열기
1. 배포된 사이트 접속
2. **F12** 키 누르기 (또는 우클릭 > "검사")
3. **Console** 탭 열기

### 확인할 로그

#### ✅ 정상 작동 시
```
🤖 ChatGPT API 설정 확인: {
  hostname: "your-site.netlify.app",
  isProduction: true,
  useNetlifyFunctions: true,
  hasLocalApiKey: false,
  functionUrl: "/.netlify/functions/chatgpt",
  env: "production"
}
```

#### ❌ 문제가 있는 경우

**케이스 1: Netlify Functions를 사용하지 않음**
```
useNetlifyFunctions: false
```
→ **원인**: 프로덕션 환경 감지 실패
→ **해결**: 코드가 최신 버전으로 배포되었는지 확인

**케이스 2: 함수 호출 실패**
```
❌ Netlify Function 호출 오류: Failed to fetch
```
→ **원인**: Netlify Functions가 배포되지 않았거나 경로가 잘못됨
→ **해결**: 아래 "2️⃣ Netlify Functions 배포 확인" 참고

**케이스 3: API 키 오류**
```
Netlify Function 오류: OpenAI API 키가 설정되지 않았습니다
```
→ **원인**: Netlify 환경 변수가 설정되지 않음
→ **해결**: 아래 "3️⃣ 환경 변수 확인" 참고

---

## 2️⃣ Netlify Functions 배포 확인

### Netlify 대시보드에서 확인

1. **Netlify 대시보드 접속**
   - https://app.netlify.com

2. **사이트 선택** → **Functions** 탭 클릭

3. **함수 목록 확인**
   - ✅ `chatgpt` 함수가 있어야 함
   - ✅ `perplexity` 함수가 있어야 함
   - ✅ `youtube` 함수가 있어야 함

### 함수가 없는 경우

**원인**: `netlify/functions` 디렉토리가 배포되지 않음

**해결 방법**:

1. **`netlify.toml` 확인**
```toml
[functions]
  directory = "netlify/functions"
```

2. **로컬에서 빌드 테스트**
```bash
npm run build
```

3. **Git에 커밋 및 푸시**
```bash
git add .
git commit -m "Add Netlify Functions"
git push
```

4. **Netlify 자동 배포 확인**
   - Netlify가 자동으로 재배포를 시작합니다
   - 배포 로그에서 Functions 빌드 확인

---

## 3️⃣ 환경 변수 확인

### Netlify 대시보드에서 확인

1. **사이트 설정** → **Environment variables** 클릭

2. **필수 환경 변수 확인**

#### 서버 사이드 (Netlify Functions용)
- ✅ `OPENAI_API_KEY` (VITE_ 접두사 없음!)
- ✅ `PERPLEXITY_API_KEY` (VITE_ 접두사 없음!)
- ✅ `YOUTUBE_API_KEY` (VITE_ 접두사 없음!)

#### 클라이언트 사이드 (Firebase용)
- ✅ `VITE_FIREBASE_API_KEY`
- ✅ `VITE_FIREBASE_AUTH_DOMAIN`
- ✅ `VITE_FIREBASE_PROJECT_ID`
- ✅ `VITE_FIREBASE_STORAGE_BUCKET`
- ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `VITE_FIREBASE_APP_ID`

### 환경 변수 설정 방법

1. **Netlify 대시보드** → **Site settings** → **Environment variables**

2. **Add a variable** 클릭

3. **변수 추가**
   - **Key**: `OPENAI_API_KEY` (VITE_ 없이!)
   - **Value**: 실제 API 키
   - **Scopes**: `All scopes` 또는 `Functions` 선택

4. **저장 후 재배포**
   - **Deploys** 탭 → **Trigger deploy** → **Clear cache and deploy site**

---

## 4️⃣ 네트워크 요청 확인

### Network 탭에서 확인

1. **개발자 도구** → **Network** 탭

2. **AI 기능 사용** (예: AI 도움 버튼 클릭)

3. **요청 확인**
   - `/.netlify/functions/chatgpt` 요청 찾기
   - 클릭하여 상세 정보 확인

### 정상 응답
- **Status**: `200 OK`
- **Response**: `{ "success": true, "data": "..." }`

### 오류 응답

**케이스 1: 404 Not Found**
```
Status: 404
```
→ **원인**: Functions가 배포되지 않음
→ **해결**: "2️⃣ Netlify Functions 배포 확인" 참고

**케이스 2: 500 Internal Server Error**
```
Status: 500
Response: { "error": "OpenAI API 키가 설정되지 않았습니다" }
```
→ **원인**: 환경 변수가 설정되지 않음
→ **해결**: "3️⃣ 환경 변수 확인" 참고

**케이스 3: CORS 오류**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
→ **원인**: CORS 헤더 설정 문제
→ **해결**: Functions 코드의 CORS 헤더 확인

---

## 5️⃣ 배포 로그 확인

### Netlify 배포 로그 확인

1. **Netlify 대시보드** → **Deploys** 탭

2. **최신 배포** 클릭

3. **Build log** 확인

### 확인할 항목

#### ✅ 정상 빌드
```
Functions directory: netlify/functions
Functions bundling: chatgpt, perplexity, youtube
```

#### ❌ 빌드 오류

**케이스 1: TypeScript 오류**
```
error TS2307: Cannot find module '@netlify/functions'
```
→ **해결**: `npm install @netlify/functions` 실행 후 재배포

**케이스 2: 함수 빌드 실패**
```
Functions bundling failed
```
→ **해결**: Functions 코드의 문법 오류 확인

---

## 6️⃣ 빠른 체크리스트

배포 전 확인 사항:

- [ ] `netlify/functions` 디렉토리에 함수 파일이 있음
- [ ] `netlify.toml`에 `[functions]` 설정이 있음
- [ ] `package.json`에 `@netlify/functions`가 설치됨
- [ ] Netlify에 환경 변수가 설정됨 (VITE_ 접두사 없이!)
- [ ] Git에 커밋 및 푸시 완료
- [ ] Netlify 배포가 성공적으로 완료됨
- [ ] Functions 탭에서 함수가 보임
- [ ] 브라우저 콘솔에서 `useNetlifyFunctions: true` 확인

---

## 7️⃣ 일반적인 문제 해결

### 문제: "Failed to fetch" 오류

**원인**: 
- Functions가 배포되지 않음
- 잘못된 URL 경로

**해결**:
1. Netlify Functions 탭에서 함수 확인
2. 브라우저 콘솔에서 실제 호출 URL 확인
3. `/.netlify/functions/chatgpt` 경로가 맞는지 확인

### 문제: "API 키가 설정되지 않았습니다"

**원인**: 
- 환경 변수 이름이 잘못됨 (VITE_ 접두사 포함)
- 환경 변수가 Functions 스코프에 없음

**해결**:
1. 환경 변수 이름 확인 (VITE_ 없이!)
2. Scopes를 `All scopes` 또는 `Functions`로 설정
3. 재배포 실행

### 문제: 함수는 보이지만 응답이 없음

**원인**: 
- 함수 내부 오류
- API 키는 있지만 잘못된 키

**해결**:
1. Netlify Functions 로그 확인
2. API 키 유효성 확인
3. 함수 코드의 에러 처리 확인

---

## 8️⃣ 디버깅 팁

### 로컬에서 Functions 테스트

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로컬 개발 서버 실행
netlify dev
```

### Functions 로그 확인

1. **Netlify 대시보드** → **Functions** 탭
2. 함수 클릭 → **Logs** 확인
3. 실시간 로그 확인 가능

### 브라우저 콘솔 활용

모든 API 호출이 콘솔에 로그로 출력됩니다:
- `📡 Netlify Function 호출`: 요청 시작
- `📡 Netlify Function 응답`: 응답 받음
- `✅ Netlify Function 성공`: 성공
- `❌ Netlify Function 오류`: 오류 발생

---

## 9️⃣ 추가 도움

문제가 해결되지 않으면:

1. **브라우저 콘솔 로그** 전체 복사
2. **Netlify Functions 로그** 확인
3. **Network 탭** 스크린샷
4. **환경 변수 설정** 스크린샷 (키 이름만, 값은 제외)

이 정보들을 함께 확인하면 더 정확한 진단이 가능합니다!

