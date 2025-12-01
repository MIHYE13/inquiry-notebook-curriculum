# 프로젝트 구조 및 문제 해결 가이드

## 📁 프로젝트 구조

```
inquiry-notebook-firebase/
├── src/
│   ├── api/
│   │   ├── chatgpt.ts           # ChatGPT API 통신
│   │   └── perplexity.ts        # Perplexity API 통신
│   ├── components/
│   │   ├── AIHelpButton.tsx     # AI 도움 버튼
│   │   ├── DrawingCanvas.tsx    # 그림 그리기 캔버스
│   │   ├── EntryList.tsx        # 탐구 기록 목록
│   │   ├── InquiryForm.tsx      # 탐구 노트 입력 폼
│   │   ├── LoginScreen.tsx      # 로그인 화면
│   │   ├── MainScreen.tsx       # 메인 화면
│   │   └── Toast.tsx            # 토스트 알림
│   ├── utils/
│   │   └── firestore.ts         # Firestore 데이터베이스 유틸
│   ├── App.tsx                  # 메인 앱 컴포넌트
│   ├── main.tsx                 # 진입점
│   ├── index.css                # Tailwind CSS
│   ├── types.ts                 # TypeScript 타입 정의
│   └── firebaseConfig.ts        # Firebase 초기화
├── index.html                   # HTML 템플릿
├── package.json                 # 의존성 관리
├── tsconfig.json                # TypeScript 설정
├── tailwind.config.js           # Tailwind CSS 설정
├── postcss.config.js            # PostCSS 설정
├── vite.config.ts               # Vite 빌드 설정
├── netlify.toml                 # Netlify 배포 설정
├── .env.example                 # 환경 변수 예시
├── .gitignore                   # Git 무시 파일
└── README.md                    # 프로젝트 문서
```

## 🐛 자주 발생하는 문제 및 해결 방법

### 1. 빌드 오류

#### 문제: "Cannot find module 'firebase'"
**원인**: Firebase 패키지가 설치되지 않음
**해결**:
```bash
npm install firebase
```

#### 문제: "Tailwind classes not working"
**원인**: Tailwind CSS가 제대로 설정되지 않음
**해결**:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 문제: TypeScript 오류
**원인**: 타입 정의 누락
**해결**:
```bash
npm install --save-dev @types/node
```

### 2. Firebase 연결 오류

#### 문제: "Firebase: Error (auth/api-key-not-valid)"
**해결**:
1. `.env` 파일 확인
2. Firebase Console에서 API 키 재확인
3. 개발 서버 재시작

#### 문제: "Missing or insufficient permissions"
**해결**:
1. Firebase Console > Firestore Database > 규칙
2. 다음 규칙 적용:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // 테스트용
    }
  }
}
```

#### 문제: Firestore 초기화 실패
**해결**:
1. 프로젝트 ID 확인
2. Firestore Database가 활성화되었는지 확인
3. 네트워크 연결 확인

### 3. AI API 오류

#### 문제: "OpenAI API 키가 설정되지 않았습니다"
**해결**:
1. `.env` 파일에 `VITE_OPENAI_API_KEY` 추가
2. 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)

#### 문제: "429 Too Many Requests"
**원인**: API 요청 제한 초과
**해결**:
1. OpenAI 대시보드에서 사용량 확인
2. Rate limit 확인 및 업그레이드
3. 요청 빈도 조절

#### 문제: "401 Unauthorized"
**원인**: API 키가 유효하지 않음
**해결**:
1. API 키 재발급
2. 환경 변수 업데이트
3. 청구 정보 확인 (크레딧 잔액)

### 4. 배포 오류 (Netlify)

#### 문제: "Build failed"
**해결**:
1. `package.json`의 build script 확인
2. Netlify 환경 변수 설정 확인
3. Node 버전 확인 (netlify.toml에서 설정)

#### 문제: "Page not found" (404)
**해결**:
1. `netlify.toml` 파일 확인
2. redirects 설정 추가:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 문제: 환경 변수가 작동하지 않음
**해결**:
1. Netlify 대시보드 > Site settings > Environment variables
2. 모든 `VITE_` 변수 추가
3. 재배포

### 5. 성능 문제

#### 문제: 페이지 로딩이 느림
**해결**:
1. 불필요한 의존성 제거
2. 이미지 최적화
3. Code splitting 적용
4. Firebase 인덱스 추가

#### 문제: AI 응답이 느림
**원인**: API 응답 시간
**해결**:
1. 로딩 인디케이터 명확히 표시
2. Timeout 설정
3. 에러 핸들링 개선

### 6. 데이터 손실 문제

#### 문제: 작성한 내용이 사라짐
**원인**: 자동 저장 실패
**해결**:
1. localStorage 백업 확인
2. Firestore 연결 상태 확인
3. 자동 저장 로직 디버깅

#### 문제: 그림이 저장되지 않음
**원인**: Base64 데이터 크기 제한
**해결**:
1. 캔버스 크기 축소
2. 이미지 품질 조정
3. Firebase Storage 사용 고려

### 7. 사용자 경험 문제

#### 문제: 모바일에서 사용하기 어려움
**해결**:
1. 반응형 디자인 확인
2. 터치 이벤트 처리 개선
3. 폰트 크기 조정

#### 문제: AI 도움말이 부적절함
**해결**:
1. 프롬프트 개선
2. Temperature 조정
3. System message 수정

## 🔍 디버깅 팁

### 1. 브라우저 개발자 도구 활용
```javascript
// Console에서 확인
console.log('Firebase initialized:', firebase.apps.length > 0);
console.log('Environment:', import.meta.env);
```

### 2. Firestore 데이터 확인
Firebase Console > Firestore Database에서 직접 데이터 확인

### 3. 네트워크 요청 모니터링
브라우저 DevTools > Network 탭에서 API 요청 상태 확인

### 4. localStorage 확인
```javascript
// Console에서 실행
console.log('Current student:', localStorage.getItem('currentStudent'));
```

## 📊 성능 최적화

### 1. Firestore 쿼리 최적화
- 필요한 필드만 가져오기
- 인덱스 활용
- 캐싱 전략

### 2. API 호출 최적화
- Debounce 적용
- 요청 캐싱
- 병렬 처리 제한

### 3. 번들 크기 최적화
```bash
# 번들 분석
npm run build
npx vite-bundle-visualizer
```

### 4. 이미지 최적화
- WebP 포맷 사용
- Lazy loading
- 적절한 크기로 리사이징

## 🚀 프로덕션 체크리스트

배포 전 확인사항:

- [ ] 모든 환경 변수 설정 완료
- [ ] Firebase 보안 규칙 설정
- [ ] API 키 사용량 제한 설정
- [ ] 에러 핸들링 구현
- [ ] 로딩 상태 표시
- [ ] 모바일 반응형 테스트
- [ ] 브라우저 호환성 테스트
- [ ] 성능 테스트 (Lighthouse)
- [ ] 보안 점검
- [ ] 백업 전략 수립

## 📞 지원

문제가 지속되면:
1. GitHub Issues에 버그 리포트
2. README.md의 FAQ 확인
3. Firebase/OpenAI/Perplexity 공식 문서 참조

---

이 문서는 지속적으로 업데이트됩니다.
