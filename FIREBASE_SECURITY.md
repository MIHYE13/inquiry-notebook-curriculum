# Firebase 보안 가이드 🔒

## ❓ Firebase API 키가 노출되어도 괜찮은가요?

### ✅ **네, 괜찮습니다!**

Firebase의 **클라이언트 측 API 키**는 **의도적으로 공개**되어야 합니다. 이것은 보안 위험이 아닙니다.

---

## 🔍 왜 안전한가요?

### 1. Firebase의 보안 모델

Firebase는 **2단계 보안 시스템**을 사용합니다:

1. **API 키 (공개)**: 프로젝트를 식별하는 용도
   - 누구나 볼 수 있어도 괜찮습니다
   - 브라우저에서 실행되는 앱이므로 어차피 노출됩니다
   - 단순히 "어떤 Firebase 프로젝트를 사용하는지" 알려주는 역할

2. **Firestore Security Rules (실제 보안)**: 데이터 접근을 제어
   - **이것이 실제 보안입니다**
   - 누가 어떤 데이터에 접근할 수 있는지 결정
   - API 키를 알아도 규칙을 통과하지 못하면 데이터 접근 불가

### 2. 브라우저 앱의 특성

웹 앱은 브라우저에서 실행되므로:
- 모든 JavaScript 코드가 사용자에게 보입니다
- 환경 변수도 빌드 시 코드에 포함되어 공개됩니다
- 따라서 API 키를 숨기는 것은 **불가능**합니다

---

## ✅ 올바른 보안 방법

### 1. Firestore Security Rules 설정 (가장 중요!)

Firebase Console에서 Firestore 보안 규칙을 설정하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 학생 데이터 접근 제어
    match /students/{studentId} {
      // 자신의 데이터만 읽고 쓸 수 있도록 제한
      allow read, write: if request.auth != null && request.auth.uid == studentId;
      
      // 또는 비밀번호 기반 접근 (현재 프로젝트 방식)
      allow read, write: if true;  // 테스트용 - 프로덕션에서는 더 엄격하게!
      
      match /entries/{entryId} {
        allow read, write: if true;  // 테스트용
      }
    }
  }
}
```

### 2. .env 파일은 Git에 커밋하지 않기

`.env` 파일은 **로컬 개발 환경 설정**이므로 Git에 커밋하지 않아야 합니다:

```gitignore
# .gitignore에 이미 포함되어 있음
.env
.env.local
.env.production
```

**이유:**
- 로컬 개발 환경 설정을 공유하지 않기 위해
- API 키 보호를 위해서가 아니라, **개인 설정을 공유하지 않기 위해**

### 3. 배포 환경에서는 환경 변수 사용

Netlify 같은 배포 플랫폼에서는:
- 환경 변수로 설정 (Netlify 대시보드에서)
- 빌드 시 코드에 포함되어 공개됨 (이것이 정상입니다!)

---

## ⚠️ 주의사항

### 1. Firestore Security Rules가 중요합니다

API 키를 알아도 **Security Rules**를 통과하지 못하면:
- ❌ 데이터 읽기 불가
- ❌ 데이터 쓰기 불가
- ❌ 데이터 삭제 불가

### 2. 현재 프로젝트의 보안 규칙

현재 프로젝트는 **테스트용 규칙**을 사용하고 있습니다:

```javascript
allow read, write: if true;  // 모든 사용자가 모든 데이터 접근 가능
```

**프로덕션 환경에서는:**
- 인증 시스템 추가 (Firebase Authentication)
- 사용자별 접근 제어
- 더 엄격한 규칙 설정

### 3. OpenAI/Perplexity API 키는 다릅니다

⚠️ **주의**: OpenAI나 Perplexity API 키는 **절대 공개하면 안 됩니다!**

이유:
- 서버 측에서만 사용해야 합니다
- 클라이언트에 노출되면 누구나 사용 가능
- 비용이 발생합니다

**현재 프로젝트의 문제점:**
- OpenAI/Perplexity API 키가 클라이언트에 노출됨
- 누구나 브라우저에서 키를 확인하고 사용 가능
- **비용이 발생할 수 있습니다**

**해결 방법:**
- 서버리스 함수 사용 (Netlify Functions, Firebase Cloud Functions)
- API 키를 서버 측에서만 사용
- 클라이언트는 서버 함수를 호출

---

## 📋 보안 체크리스트

### ✅ 해야 할 것

- [x] `.env` 파일을 `.gitignore`에 추가 (이미 완료)
- [x] Firestore Security Rules 설정
- [ ] 프로덕션 환경에서 더 엄격한 규칙 설정
- [ ] Firebase Console에서 사용량 모니터링
- [ ] API 사용량 제한 설정 (가능한 경우)

### ❌ 하지 말아야 할 것

- [ ] `.env` 파일을 Git에 커밋
- [ ] Firebase API 키를 비밀처럼 취급 (불필요)
- [ ] Security Rules 없이 배포
- [ ] OpenAI/Perplexity API 키를 클라이언트에 노출 (현재 문제)

---

## 🔐 프로덕션 보안 강화 방법

### 1. Firebase Authentication 추가

```javascript
// 사용자 인증 후
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{studentId} {
      // 인증된 사용자만 자신의 데이터 접근
      allow read, write: if request.auth != null && 
                            request.auth.uid == studentId;
      
      match /entries/{entryId} {
        allow read, write: if request.auth != null && 
                              request.auth.uid == studentId;
      }
    }
  }
}
```

### 2. 도메인 제한 (선택사항)

Firebase Console에서:
- 프로젝트 설정 > 일반
- "승인된 도메인"에 허용된 도메인만 추가
- 예: `your-site.netlify.app`, `yourdomain.com`

### 3. API 사용량 제한

Firebase Console에서:
- 프로젝트 설정 > 사용량 및 청구
- 할당량 및 제한 설정
- 예상치 못한 사용량 증가 방지

---

## 💡 FAQ

### Q1: API 키를 GitHub에 올려도 되나요?

**A:** Firebase API 키는 괜찮지만, `.env` 파일 자체는 올리지 마세요.
- `firebaseConfig.ts` 같은 코드 파일에 하드코딩해도 괜찮습니다
- 하지만 `.env` 파일은 개인 설정이므로 Git에 커밋하지 않는 것이 좋습니다

### Q2: 누군가 API 키를 복사해서 사용하면?

**A:** Security Rules를 통과하지 못하면 데이터 접근 불가합니다.
- API 키만으로는 아무것도 할 수 없습니다
- Security Rules가 실제 보안입니다

### Q3: OpenAI API 키도 공개해도 되나요?

**A:** **절대 안 됩니다!**
- OpenAI API 키는 서버 측에서만 사용해야 합니다
- 클라이언트에 노출되면 누구나 사용 가능하고 비용이 발생합니다
- Netlify Functions나 Firebase Cloud Functions 사용 권장

### Q4: 현재 프로젝트는 안전한가요?

**A:** 기본적인 보안은 되어 있지만, 개선이 필요합니다:

**안전한 부분:**
- ✅ Firebase API 키 공개 (정상)
- ✅ `.env` 파일 Git 제외 (정상)
- ✅ Firestore Security Rules 설정 (기본)

**개선이 필요한 부분:**
- ⚠️ OpenAI/Perplexity API 키가 클라이언트에 노출됨
- ⚠️ Security Rules가 너무 느슨함 (`if true`)
- ⚠️ 인증 시스템 없음

---

## 📚 참고 자료

- [Firebase Security Rules 가이드](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase 보안 모범 사례](https://firebase.google.com/docs/rules/best-practices)
- [Vite 환경 변수 가이드](https://vitejs.dev/guide/env-and-mode.html)

---

## 🎯 요약

1. **Firebase API 키 공개 = 정상** ✅
   - 브라우저 앱이므로 어차피 노출됨
   - Security Rules가 실제 보안

2. **.env 파일 Git 제외 = 필수** ✅
   - 로컬 설정을 공유하지 않기 위해
   - 이미 `.gitignore`에 포함됨

3. **Firestore Security Rules = 가장 중요** ⚠️
   - 현재는 테스트용 규칙 사용
   - 프로덕션에서는 더 엄격하게 설정 필요

4. **OpenAI/Perplexity API 키 = 서버 측으로 이동 필요** ❌
   - 현재 클라이언트에 노출됨
   - 서버리스 함수로 이동 권장

---

**결론**: Firebase API 키는 공개되어도 안전합니다. 실제 보안은 Firestore Security Rules로 관리하세요! 🔒

