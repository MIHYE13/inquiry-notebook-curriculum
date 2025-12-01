# 빠른 시작 가이드 ⚡

## 5분 안에 시작하기

### 1️⃣ 프로젝트 준비 (1분)

```bash
# 프로젝트 폴더로 이동
cd inquiry-notebook-firebase

# 의존성 설치
npm install
```

### 2️⃣ Firebase 설정 (2분)

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: inquiry-notebook)
4. Firestore Database 만들기
   - 빌드 > Firestore Database > 데이터베이스 만들기
   - 테스트 모드로 시작
5. 웹 앱 추가
   - 프로젝트 설정 > 일반 > "웹 앱에 Firebase 추가"
   - Config 정보 복사

### 3️⃣ 환경 변수 설정 (1분)

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일 열어서 Firebase Config 붙여넣기:

```env
VITE_FIREBASE_API_KEY=복사한_API_키
VITE_FIREBASE_AUTH_DOMAIN=프로젝트명.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=프로젝트_ID
# ... 나머지 정보
```

### 4️⃣ 개발 서버 실행 (1분)

```bash
npm run dev
```

브라우저가 자동으로 열립니다! 🎉

## ✅ AI 기능은 나중에 설정 가능

AI 기능 없이도 기본 탐구 노트는 작동합니다.

AI 기능 추가하려면:
1. [OpenAI](https://platform.openai.com/)에서 API 키 발급
2. [Perplexity](https://www.perplexity.ai/)에서 API 키 발급
3. `.env` 파일에 추가

## 🚀 Netlify 배포 (5분)

### 방법 1: GitHub + Netlify (추천)

1. GitHub에 저장소 생성 및 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/사용자명/저장소명.git
git push -u origin main
```

2. [Netlify](https://netlify.com) 로그인
3. "Add new site" > "Import from Git"
4. GitHub 저장소 선택
5. Build settings 자동 감지됨
6. "Environment variables" 탭에서 `.env` 내용 추가
7. "Deploy" 클릭

완료! 🎊

## 📱 테스트 계정

테스트용 학생 계정:
- 이름: 테스트
- 비밀번호: 1234

## 🆘 문제 발생 시

가장 흔한 문제와 해결:

### 빌드 오류
```bash
npm install
npm run dev
```

### Firebase 연결 안됨
- `.env` 파일 확인
- Firebase Console에서 설정 재확인

### 화면이 안 나옴
- 브라우저 콘솔(F12) 확인
- 에러 메시지 확인

## 📚 더 자세한 정보

- **전체 문서**: [README.md](./README.md)
- **문제 해결**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**궁금한 점이 있으신가요?**  
GitHub Issues에 질문을 남겨주세요!
