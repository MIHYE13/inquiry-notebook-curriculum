# .env 파일을 Netlify에 한 번에 업로드하기 🚀

## ⚠️ 중요: .env 파일을 Git에 올리면 안 됩니다!

`.env` 파일은 **절대 Git에 커밋하지 마세요**. 이미 `.gitignore`에 포함되어 있습니다.

---

## ✅ 방법 1: Netlify CLI 사용 (가장 쉬움!)

Netlify CLI를 사용하면 `.env` 파일의 모든 환경 변수를 한 번에 업로드할 수 있습니다.

### 1단계: Netlify CLI 설치

```bash
npm install -g netlify-cli
```

### 2단계: Netlify에 로그인

```bash
netlify login
```

브라우저가 열리면 Netlify 계정으로 로그인하세요.

### 3단계: 사이트 연결

```bash
# 프로젝트 디렉토리에서 실행
netlify link
```

또는 사이트 ID를 직접 지정:

```bash
netlify link --id YOUR_SITE_ID
```

### 4단계: .env 파일 업로드

```bash
# .env 파일의 모든 변수를 한 번에 업로드
netlify env:import .env
```

**중요**: Netlify Functions용 API 키는 `VITE_` 접두사 없이 설정해야 합니다!

`.env` 파일에 다음과 같이 있다면:
```env
VITE_OPENAI_API_KEY=sk-...
```

Netlify에는 `OPENAI_API_KEY`로 업로드되어야 합니다. 

**해결 방법**: `.env` 파일을 수정하거나, 업로드 후 Netlify 대시보드에서 수동으로 이름 변경

### 5단계: 확인

```bash
# 업로드된 환경 변수 확인
netlify env:list
```

---

## ✅ 방법 2: Netlify CLI로 하나씩 설정

`.env` 파일을 직접 읽어서 하나씩 설정:

```bash
# Firebase 변수 (VITE_ 접두사 유지)
netlify env:set VITE_FIREBASE_API_KEY "your-api-key"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "your-domain"
netlify env:set VITE_FIREBASE_PROJECT_ID "your-project-id"
netlify env:set VITE_FIREBASE_STORAGE_BUCKET "your-bucket"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "your-sender-id"
netlify env:set VITE_FIREBASE_APP_ID "your-app-id"

# API 키 변수 (VITE_ 접두사 제거!)
netlify env:set OPENAI_API_KEY "sk-..." --context production
netlify env:set PERPLEXITY_API_KEY "pplx-..." --context production
netlify env:set YOUTUBE_API_KEY "AIza..." --context production
```

---

## ✅ 방법 3: Netlify 대시보드에서 수동 설정

1. **Netlify 대시보드 접속**
   - https://app.netlify.com/
   - 사이트 선택

2. **환경 변수 페이지로 이동**
   - Site settings → Environment variables

3. **.env 파일 열기**
   - 로컬 `.env` 파일을 텍스트 에디터로 열기

4. **하나씩 복사해서 추가**
   - "Add a variable" 클릭
   - Key와 Value를 `.env` 파일에서 복사해서 붙여넣기
   - **주의**: API 키는 `VITE_` 접두사 제거!

---

## 🔄 .env 파일 변환 스크립트

`.env` 파일의 `VITE_OPENAI_API_KEY`를 `OPENAI_API_KEY`로 변환하는 스크립트:

```bash
# PowerShell (Windows)
Get-Content .env | ForEach-Object {
    if ($_ -match '^VITE_(OPENAI|PERPLEXITY|YOUTUBE)_API_KEY=') {
        $_ -replace '^VITE_', ''
    } else {
        $_
    }
} | Out-File .env.netlify
```

```bash
# Bash (Mac/Linux)
grep -v '^VITE_\(OPENAI\|PERPLEXITY\|YOUTUBE\)_API_KEY=' .env > .env.netlify
sed 's/^VITE_\(OPENAI\|PERPLEXITY\|YOUTUBE\)_API_KEY=/OPENAI_API_KEY=/' .env >> .env.netlify
```

그 다음:
```bash
netlify env:import .env.netlify
```

---

## 📋 체크리스트

업로드 후 확인:

### Firebase 변수 (VITE_ 접두사 필요)
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`

### API 키 변수 (VITE_ 접두사 없음!)
- [ ] `OPENAI_API_KEY` (ChatGPT 사용 시)
- [ ] `PERPLEXITY_API_KEY` (Perplexity 사용 시)
- [ ] `YOUTUBE_API_KEY` (YouTube 검색 사용 시)

---

## 🚀 재배포

환경 변수를 추가한 후 **반드시 재배포**해야 합니다:

```bash
# Netlify CLI로 재배포
netlify deploy --prod
```

또는 Netlify 대시보드에서:
1. **Deploys** 탭
2. **Trigger deploy** → **Clear cache and deploy site**

---

## 💡 팁

1. **환경 변수는 대소문자를 구분합니다** - 정확히 입력하세요
2. **Scopes 설정**: API 키는 "All scopes" 또는 "Functions"로 설정
3. **로컬 개발**: `.env` 파일은 그대로 사용 (VITE_ 접두사 유지)
4. **프로덕션**: Netlify 환경 변수 사용 (API 키는 VITE_ 없이)

---

## 🐛 문제 해결

### "netlify: command not found"
```bash
npm install -g netlify-cli
```

### "You're not logged in"
```bash
netlify login
```

### "Site not linked"
```bash
netlify link
```

### 환경 변수가 적용되지 않음
1. 재배포 확인
2. Scopes 확인 (All scopes 또는 Functions)
3. 변수 이름 확인 (대소문자 정확히)

---

## 📚 관련 문서

- [NETLIFY_ENV_SETUP.md](./NETLIFY_ENV_SETUP.md) - 상세 환경 변수 설정 가이드
- [NETLIFY_FUNCTIONS_GUIDE.md](./NETLIFY_FUNCTIONS_GUIDE.md) - Netlify Functions 가이드
- [ENV_SETUP.md](./ENV_SETUP.md) - 로컬 개발 환경 변수 설정

