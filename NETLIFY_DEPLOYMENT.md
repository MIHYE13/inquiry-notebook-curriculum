# Netlify 배포 문제 해결 가이드 🚀

## ❌ "인터넷 연결이 안된다" 오류 해결 방법

Netlify에 배포한 후 "접속에 실패했어요. 인터넷 연결을 확인하고 다시 시도해주세요." 오류가 발생하는 경우, 대부분 **Firebase 환경 변수가 Netlify에 설정되지 않았기 때문**입니다.

---

## ✅ 해결 방법 (단계별)

### 1단계: Netlify 환경 변수 설정

1. **Netlify 대시보드 접속**
   - https://app.netlify.com/ 접속
   - 배포한 사이트 선택

2. **환경 변수 설정 페이지로 이동**
   - Site settings (사이트 설정) 클릭
   - 왼쪽 메뉴에서 **"Environment variables"** (환경 변수) 클릭

3. **Firebase 환경 변수 추가**
   
   다음 6개의 환경 변수를 모두 추가해야 합니다:

   | 변수 이름 | 설명 | 예시 값 |
   |----------|------|---------|
   | `VITE_FIREBASE_API_KEY` | Firebase API 키 | `AIza...` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | 인증 도메인 | `프로젝트명.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | 프로젝트 ID | `프로젝트-id` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | 스토리지 버킷 | `프로젝트.appspot.com` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | 메시징 발신자 ID | `123456789` |
   | `VITE_FIREBASE_APP_ID` | 앱 ID | `1:123:web:abc` |

   **추가 방법:**
   - "Add a variable" (변수 추가) 버튼 클릭
   - Key에 변수 이름 입력 (예: `VITE_FIREBASE_API_KEY`)
   - Value에 실제 값 입력
   - "Add" 클릭
   - 나머지 5개도 동일하게 반복

4. **선택사항: AI 기능을 사용하는 경우**
   
   ChatGPT API를 사용하는 경우:
   - `VITE_OPENAI_API_KEY`
   - `VITE_OPENAI_API_ENDPOINT` (기본값: `https://api.openai.com/v1/chat/completions`)
   - `VITE_OPENAI_MODEL` (기본값: `gpt-4o-mini`)

   Perplexity API를 사용하는 경우:
   - `VITE_PERPLEXITY_API_KEY`
   - `VITE_PERPLEXITY_API_ENDPOINT` (기본값: `https://api.perplexity.ai/chat/completions`)

### 2단계: 사이트 재배포

환경 변수를 추가한 후 **반드시 재배포**해야 합니다:

1. Netlify 대시보드에서 **"Deploys"** (배포) 탭 클릭
2. **"Trigger deploy"** (배포 트리거) > **"Clear cache and deploy site"** (캐시 지우고 사이트 배포) 클릭
3. 배포가 완료될 때까지 대기 (보통 1-2분)

### 3단계: Firebase 보안 규칙 확인

Firebase Console에서 Firestore 보안 규칙을 확인하세요:

1. **Firebase Console 접속**
   - https://console.firebase.google.com/ 접속
   - 프로젝트 선택

2. **Firestore Database > 규칙 탭**
   - 다음 규칙이 설정되어 있는지 확인:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 학생 데이터 읽기/쓰기 허용
    match /students/{studentId} {
      allow read, write: if true;  // 테스트용 (프로덕션에서는 인증 추가 권장)
      
      // 학생의 탐구 노트 읽기/쓰기 허용
      match /entries/{entryId} {
        allow read, write: if true;
      }
    }
  }
}
```

   ⚠️ **주의**: 위 규칙은 테스트용입니다. 프로덕션에서는 인증을 추가하는 것이 좋습니다.

3. **"게시"** 버튼 클릭하여 규칙 저장

### 4단계: Firebase 도메인 허용 (필요한 경우)

일부 경우 Firebase에서 Netlify 도메인을 허용해야 할 수 있습니다:

1. Firebase Console > 프로젝트 설정 > 일반
2. "승인된 도메인" 섹션 확인
3. Netlify 도메인 (예: `your-site.netlify.app`)이 없으면 추가

---

## 🔍 문제 진단 체크리스트

다음 항목을 확인하세요:

- [ ] Netlify에 `VITE_FIREBASE_API_KEY` 환경 변수가 설정되어 있나요?
- [ ] Netlify에 `VITE_FIREBASE_AUTH_DOMAIN` 환경 변수가 설정되어 있나요?
- [ ] Netlify에 `VITE_FIREBASE_PROJECT_ID` 환경 변수가 설정되어 있나요?
- [ ] Netlify에 `VITE_FIREBASE_STORAGE_BUCKET` 환경 변수가 설정되어 있나요?
- [ ] Netlify에 `VITE_FIREBASE_MESSAGING_SENDER_ID` 환경 변수가 설정되어 있나요?
- [ ] Netlify에 `VITE_FIREBASE_APP_ID` 환경 변수가 설정되어 있나요?
- [ ] 환경 변수 추가 후 재배포를 했나요?
- [ ] Firebase Firestore 보안 규칙이 올바르게 설정되어 있나요?
- [ ] Firebase Console에서 Firestore Database가 활성화되어 있나요?

---

## 🐛 추가 문제 해결

### 문제 1: 환경 변수가 여전히 작동하지 않음

**해결 방법:**
1. 변수 이름이 정확한지 확인 (`VITE_` 접두사 필수!)
2. 값에 공백이나 특수문자가 없는지 확인
3. Netlify 빌드 로그 확인:
   - Deploys 탭 > 최신 배포 > "Deploy log" 클릭
   - 빌드 중 오류가 있는지 확인

### 문제 2: 빌드는 성공하지만 사이트가 작동하지 않음

**해결 방법:**
1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭에서 오류 메시지 확인
3. Network 탭에서 Firebase 요청이 실패하는지 확인

### 문제 3: 로컬에서는 작동하지만 배포 후 작동하지 않음

**원인:** 로컬 `.env` 파일의 값이 Netlify에 설정되지 않음

**해결 방법:**
1. 로컬 `.env` 파일 확인
2. 모든 `VITE_`로 시작하는 변수를 Netlify에 추가
3. 재배포

---

## 📝 환경 변수 설정 예시

### Netlify 환경 변수 설정 화면 예시:

```
변수 이름: VITE_FIREBASE_API_KEY
값: AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567

변수 이름: VITE_FIREBASE_AUTH_DOMAIN
값: my-project.firebaseapp.com

변수 이름: VITE_FIREBASE_PROJECT_ID
값: my-project-12345

변수 이름: VITE_FIREBASE_STORAGE_BUCKET
값: my-project-12345.appspot.com

변수 이름: VITE_FIREBASE_MESSAGING_SENDER_ID
값: 123456789012

변수 이름: VITE_FIREBASE_APP_ID
값: 1:123456789012:web:abcdef123456
```

---

## 🎯 빠른 확인 방법

배포 후 다음을 확인하세요:

1. **브라우저 콘솔 확인**
   - 사이트 접속 후 F12 키 누르기
   - Console 탭에서 Firebase 관련 오류 확인
   - `import.meta.env.VITE_FIREBASE_API_KEY`가 `undefined`인지 확인

2. **Netlify 빌드 로그 확인**
   - Deploys 탭 > 최신 배포 > Deploy log
   - 빌드 중 오류나 경고 확인

3. **Firebase Console 확인**
   - Firestore Database > 데이터 탭
   - 데이터가 저장되는지 확인

---

## 💡 팁

- **환경 변수는 대소문자를 구분합니다.** 정확히 입력하세요.
- **`VITE_` 접두사는 필수입니다.** Vite는 이 접두사가 있는 변수만 클라이언트에 노출합니다.
- **환경 변수를 추가한 후에는 반드시 재배포해야 합니다.**
- **프로덕션 환경에서는 Firebase 보안 규칙을 더 엄격하게 설정하는 것이 좋습니다.**

---

## 📚 관련 문서

- [API_SETUP.md](./API_SETUP.md) - Firebase 설정 상세 가이드
- [FEATURE_STATUS.md](./FEATURE_STATUS.md) - 기능 상태 정리
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 일반적인 문제 해결

---

## 🆘 여전히 문제가 해결되지 않으면

1. Netlify 빌드 로그 전체 내용 확인
2. 브라우저 콘솔의 오류 메시지 확인
3. Firebase Console에서 Firestore 상태 확인
4. 위 내용을 모두 확인한 후 문제를 재현할 수 있는 단계를 정리하여 문의

