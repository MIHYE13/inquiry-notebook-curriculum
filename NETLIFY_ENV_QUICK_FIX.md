# Netlify 환경 변수 빠른 해결 가이드 ⚡

## 🚨 현재 문제

콘솔에 다음 에러가 표시됩니다:
```
Netlify Function 오류: OpenAI API 키가 설정되지 않았습니다. Netlify 환경 변수를 확인해주세요.
```

이것은 Netlify 환경 변수에 `OPENAI_API_KEY`가 설정되지 않았거나, 재배포가 되지 않았음을 의미합니다.

---

## ✅ 해결 방법 (5분 안에 완료)

### 1단계: Netlify 대시보드 접속

1. https://app.netlify.com/ 접속
2. 로그인
3. 사이트 선택 (예: `1210sciencewepapp`)

### 2단계: 환경 변수 페이지로 이동

1. 왼쪽 메뉴에서 **"Site settings"** (사이트 설정) 클릭
2. 왼쪽 하위 메뉴에서 **"Environment variables"** (환경 변수) 클릭

### 3단계: API 키 환경 변수 추가

**중요**: `VITE_` 접두사 없이 추가해야 합니다!

#### 3-1. OPENAI_API_KEY 추가

1. **"Add a variable"** (변수 추가) 버튼 클릭
2. **Key** 입력: `OPENAI_API_KEY` (대문자, VITE_ 없이!)
3. **Value** 입력: 실제 OpenAI API 키 (예: `sk-...`)
4. **Scopes** 선택: **"All scopes"** 또는 **"Functions"** 선택
5. **"Add variable"** 클릭

#### 3-2. PERPLEXITY_API_KEY 추가 (Perplexity 사용 시)

1. 다시 **"Add a variable"** 클릭
2. **Key**: `PERPLEXITY_API_KEY`
3. **Value**: 실제 Perplexity API 키 (예: `pplx-...`)
4. **Scopes**: **"All scopes"** 또는 **"Functions"**
5. **"Add variable"** 클릭

#### 3-3. YOUTUBE_API_KEY 추가 (YouTube 검색 사용 시)

1. 다시 **"Add a variable"** 클릭
2. **Key**: `YOUTUBE_API_KEY`
3. **Value**: 실제 YouTube Data API 키 (예: `AIza...`)
4. **Scopes**: **"All scopes"** 또는 **"Functions"**
5. **"Add variable"** 클릭

### 4단계: 환경 변수 확인

환경 변수 목록에 다음이 보여야 합니다:

✅ **서버 사이드 변수** (VITE_ 없음):
- `OPENAI_API_KEY`
- `PERPLEXITY_API_KEY` (사용 시)
- `YOUTUBE_API_KEY` (사용 시)

✅ **클라이언트 사이드 변수** (VITE_ 있음):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### 5단계: 재배포 (필수!)

환경 변수를 추가한 후 **반드시 재배포**해야 합니다:

1. 상단 메뉴에서 **"Deploys"** (배포) 탭 클릭
2. **"Trigger deploy"** (배포 트리거) 버튼 클릭
3. **"Clear cache and deploy site"** (캐시 지우고 사이트 배포) 선택
4. 배포가 완료될 때까지 대기 (약 2-3분)

### 6단계: 테스트

1. 브라우저에서 사이트 새로고침 (Ctrl+F5 또는 Cmd+Shift+R)
2. 개발자 도구 열기 (F12)
3. Console 탭 확인
4. AI 기능 테스트 (예: "질문이 잘 떠오르지 않아요" 버튼 클릭)

**성공 시**:
- ✅ `✅ Netlify Function 성공` 메시지 표시
- ✅ AI 응답이 정상적으로 표시됨

**실패 시**:
- ❌ 여전히 에러 메시지 표시
- → 아래 "문제 해결" 섹션 참고

---

## 🔍 환경 변수 확인 방법

### Netlify Functions 로그 확인

1. Netlify 대시보드 → **Functions** 탭
2. `chatgpt` 함수 클릭
3. **Logs** 탭 확인
4. 최근 호출 로그에서 에러 메시지 확인

### 환경 변수가 제대로 설정되었는지 확인

Netlify Functions 로그에서:
- `OpenAI API key not configured` → 환경 변수가 없음
- `OpenAI API error: 401` → API 키가 잘못됨
- `OpenAI API error: 429` → API 사용량 초과

---

## ❌ 자주 하는 실수

### 실수 1: VITE_ 접두사 포함

❌ **잘못된 예**:
- `VITE_OPENAI_API_KEY` ← 이렇게 하면 안 됩니다!

✅ **올바른 예**:
- `OPENAI_API_KEY` ← VITE_ 없이!

### 실수 2: Scopes 설정 누락

❌ **잘못된 예**:
- Scopes를 설정하지 않음

✅ **올바른 예**:
- Scopes: **"All scopes"** 또는 **"Functions"** 선택

### 실수 3: 재배포 안 함

❌ **잘못된 예**:
- 환경 변수만 추가하고 재배포 안 함

✅ **올바른 예**:
- 환경 변수 추가 → **반드시 재배포** (Clear cache and deploy site)

### 실수 4: 대소문자 오류

❌ **잘못된 예**:
- `openai_api_key` (소문자)
- `Openai_Api_Key` (혼합)

✅ **올바른 예**:
- `OPENAI_API_KEY` (대문자, 언더스코어)

---

## 🐛 문제 해결

### 문제 1: 환경 변수를 추가했는데도 에러가 계속 발생

**해결 방법**:
1. 환경 변수 이름 확인 (대소문자 정확히)
2. Scopes 확인 (All scopes 또는 Functions)
3. 재배포 확인 (Clear cache and deploy site)
4. 브라우저 캐시 지우기 (Ctrl+Shift+Delete)

### 문제 2: Functions 탭에 함수가 보이지 않음

**해결 방법**:
1. `netlify/functions` 디렉토리에 파일이 있는지 확인
2. `netlify.toml`에 `[functions]` 설정이 있는지 확인
3. Git에 커밋 및 푸시 확인
4. Netlify 배포 로그 확인

### 문제 3: API 키는 있는데 401 에러 발생

**해결 방법**:
1. API 키가 유효한지 확인 (OpenAI 대시보드에서 확인)
2. API 키에 충분한 크레딧이 있는지 확인
3. API 키가 만료되지 않았는지 확인

---

## 📋 체크리스트

환경 변수 설정 후 확인:

- [ ] Netlify 대시보드 접속
- [ ] Site settings → Environment variables 이동
- [ ] `OPENAI_API_KEY` 추가 (VITE_ 없이!)
- [ ] Scopes: "All scopes" 또는 "Functions" 선택
- [ ] 재배포 실행 (Clear cache and deploy site)
- [ ] 배포 완료 대기 (2-3분)
- [ ] 브라우저 새로고침 (Ctrl+F5)
- [ ] 개발자 도구 Console 확인
- [ ] AI 기능 테스트

---

## 💡 빠른 참조

### 환경 변수 이름 정리

| 용도 | 변수 이름 | VITE_ 접두사 | Scopes |
|------|----------|-------------|--------|
| Firebase | `VITE_FIREBASE_API_KEY` | ✅ 필요 | All scopes |
| Firebase | `VITE_FIREBASE_AUTH_DOMAIN` | ✅ 필요 | All scopes |
| Firebase | `VITE_FIREBASE_PROJECT_ID` | ✅ 필요 | All scopes |
| Firebase | `VITE_FIREBASE_STORAGE_BUCKET` | ✅ 필요 | All scopes |
| Firebase | `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ 필요 | All scopes |
| Firebase | `VITE_FIREBASE_APP_ID` | ✅ 필요 | All scopes |
| OpenAI | `OPENAI_API_KEY` | ❌ 없음 | Functions |
| Perplexity | `PERPLEXITY_API_KEY` | ❌ 없음 | Functions |
| YouTube | `YOUTUBE_API_KEY` | ❌ 없음 | Functions |

---

## 📞 추가 도움

문제가 해결되지 않으면:

1. **Netlify Functions 로그** 확인
   - Functions 탭 → chatgpt 함수 → Logs

2. **배포 로그** 확인
   - Deploys 탭 → 최신 배포 → Deploy log

3. **브라우저 콘솔 로그** 전체 복사
   - F12 → Console → 전체 선택 → 복사

4. **환경 변수 스크린샷** (키 이름만, 값은 제외)
   - Site settings → Environment variables

이 정보들을 함께 확인하면 더 정확한 진단이 가능합니다!

