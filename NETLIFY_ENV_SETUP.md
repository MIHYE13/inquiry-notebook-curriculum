# Netlify 환경 변수 설정 가이드 (Netlify Functions 사용) 🔒

## ✅ 보안 개선 완료!

이제 OpenAI, Perplexity, YouTube API 키가 **서버 사이드에서만** 사용됩니다. 클라이언트에 노출되지 않습니다!

---

## 📋 Netlify 환경 변수 설정 방법

### 1단계: Netlify 대시보드 접속

1. https://app.netlify.com/ 접속
2. 배포한 사이트 선택
3. **Site settings** (사이트 설정) 클릭
4. 왼쪽 메뉴에서 **"Environment variables"** (환경 변수) 클릭

### 2단계: Firebase 환경 변수 설정 (필수)

다음 6개의 환경 변수를 추가하세요. **`VITE_` 접두사를 유지**합니다:

| 변수 이름 | 설명 | 예시 값 |
|----------|------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API 키 | `AIza...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | 인증 도메인 | `프로젝트명.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | 프로젝트 ID | `프로젝트-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | 스토리지 버킷 | `프로젝트.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 메시징 발신자 ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | 앱 ID | `1:123:web:abc` |

### 3단계: API 키 환경 변수 설정 (서버 사이드용)

**중요**: 이 변수들은 **`VITE_` 접두사 없이** 설정합니다! (서버 사이드에서만 사용)

| 변수 이름 | 설명 | 예시 값 |
|----------|------|---------|
| `OPENAI_API_KEY` | OpenAI API 키 | `sk-...` |
| `PERPLEXITY_API_KEY` | Perplexity API 키 | `pplx-...` |
| `YOUTUBE_API_KEY` | YouTube Data API 키 | `AIza...` |

**설정 방법:**
1. "Add a variable" (변수 추가) 버튼 클릭
2. **Key**: `OPENAI_API_KEY` (VITE_ 없이!)
3. **Value**: 실제 API 키 값 입력
4. "Add" 클릭
5. 나머지 변수들도 동일하게 반복

---

## 🔒 보안 비교

### ❌ 이전 방식 (클라이언트 사이드)
```
브라우저 → 직접 OpenAI API 호출
         → API 키가 JavaScript 파일에 포함됨
         → 누구나 볼 수 있음
         → 비용 발생 위험
```

### ✅ 현재 방식 (서버 사이드)
```
브라우저 → Netlify Function 호출 (API 키 없음)
         → Netlify Function → OpenAI API 호출 (API 키 사용)
         → API 키는 서버에서만 사용
         → 브라우저에서는 볼 수 없음
         → 비용 안전
```

---

## 📝 환경 변수 체크리스트

### Firebase (클라이언트 사이드 - VITE_ 접두사 필요)
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`

### API 키 (서버 사이드 - VITE_ 접두사 없음!)
- [ ] `OPENAI_API_KEY` (ChatGPT 사용 시)
- [ ] `PERPLEXITY_API_KEY` (Perplexity 사용 시)
- [ ] `YOUTUBE_API_KEY` (YouTube 검색 사용 시)

---

## 🚀 배포 및 테스트

### 1. 환경 변수 설정 후 재배포

환경 변수를 추가한 후 **반드시 재배포**해야 합니다:

1. Netlify 대시보드에서 **"Deploys"** (배포) 탭 클릭
2. **"Trigger deploy"** (배포 트리거) > **"Clear cache and deploy site"** (캐시 지우고 사이트 배포) 클릭
3. 배포가 완료될 때까지 대기 (보통 2-3분)

### 2. 테스트

배포 후 다음을 확인하세요:

1. **브라우저 개발자 도구 열기** (F12)
2. **Sources** 탭에서 JavaScript 파일 검색
3. `OPENAI_API_KEY`, `PERPLEXITY_API_KEY`, `YOUTUBE_API_KEY` 검색
4. **결과가 없어야 합니다!** (API 키가 클라이언트에 노출되지 않음)

---

## 🐛 문제 해결

### 문제 1: "Netlify Function 호출에 실패했습니다"

**원인**: Netlify Functions가 제대로 배포되지 않았거나 환경 변수가 설정되지 않음

**해결 방법:**
1. Netlify 빌드 로그 확인: Deploys > 최신 배포 > Deploy log
2. Functions가 빌드되었는지 확인: `netlify/functions/` 디렉토리 확인
3. 환경 변수가 올바르게 설정되었는지 확인 (`VITE_` 접두사 없이!)
4. 재배포

### 문제 2: "API 키가 설정되지 않았습니다"

**원인**: 환경 변수 이름이 잘못되었거나 값이 비어있음

**해결 방법:**
1. 환경 변수 이름 확인:
   - Firebase: `VITE_FIREBASE_API_KEY` (VITE_ 필요)
   - API 키: `OPENAI_API_KEY` (VITE_ 없음!)
2. 값이 비어있지 않은지 확인
3. 재배포

### 문제 3: 로컬 개발 환경에서 작동하지 않음

**원인**: 로컬 개발 환경에서는 Netlify Functions를 사용하지 않고 `.env` 파일을 사용합니다.

**해결 방법:**
1. `.env` 파일에 다음 변수 추가:
   ```env
   VITE_OPENAI_API_KEY=sk-...
   VITE_PERPLEXITY_API_KEY=pplx-...
   VITE_YOUTUBE_API_KEY=...
   ```
2. 개발 서버 재시작: `npm run dev`

---

## 💡 팁

1. **환경 변수는 대소문자를 구분합니다.** 정확히 입력하세요.
2. **Firebase 변수는 `VITE_` 접두사가 필요합니다.** (클라이언트에서 사용)
3. **API 키 변수는 `VITE_` 접두사가 없어야 합니다.** (서버에서만 사용)
4. **환경 변수를 추가한 후에는 반드시 재배포해야 합니다.**
5. **로컬 개발 시에는 `.env` 파일을 사용합니다.**

---

## 📚 관련 문서

- [NETLIFY_FUNCTIONS_GUIDE.md](./NETLIFY_FUNCTIONS_GUIDE.md) - Netlify Functions 상세 가이드
- [FIREBASE_SECURITY.md](./FIREBASE_SECURITY.md) - Firebase 보안 가이드
- [ENV_SETUP.md](./ENV_SETUP.md) - 로컬 개발 환경 변수 설정

---

## 🎯 요약

1. **Firebase 변수**: `VITE_` 접두사 필요 (클라이언트에서 사용)
2. **API 키 변수**: `VITE_` 접두사 없음 (서버에서만 사용)
3. **환경 변수 설정 후**: 반드시 재배포 필요
4. **로컬 개발**: `.env` 파일 사용 (VITE_ 접두사 필요)

이제 API 키가 안전하게 보호됩니다! 🔒

