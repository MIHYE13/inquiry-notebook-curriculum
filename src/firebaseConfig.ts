/**
 * Firebase 설정 모듈
 * 
 * ✅ 필수 설정: Firebase는 모든 데이터 저장 기능에 필요합니다.
 * 
 * 🔒 보안 참고사항:
 * - Firebase 클라이언트 API 키는 공개되어도 안전합니다 (브라우저 앱이므로 어차피 노출됨)
 * - 실제 보안은 Firestore Security Rules로 관리됩니다
 * - .env 파일에 키를 저장하고 Git에 커밋하지 마세요 (.env는 .gitignore에 포함됨)
 * - .env.example 파일은 템플릿으로만 사용하세요 (실제 키 없음)
 * - Netlify 배포 시에는 Netlify 환경 변수에 설정해야 합니다
 * - 자세한 내용은 ENV_SETUP.md와 FIREBASE_SECURITY.md를 참고하세요
 * 
 * 환경 변수 설정:
 * 1. .env.example을 .env로 복사: cp .env.example .env
 * 2. .env 파일에 Firebase Console에서 복사한 실제 값 입력
 * 3. 개발 서버 실행: npm run dev
 * 
 * 환경 변수 목록:
 * - VITE_FIREBASE_API_KEY: Firebase API 키 (필수)
 * - VITE_FIREBASE_AUTH_DOMAIN: 인증 도메인 (필수)
 * - VITE_FIREBASE_PROJECT_ID: 프로젝트 ID (필수)
 * - VITE_FIREBASE_STORAGE_BUCKET: 스토리지 버킷 (필수)
 * - VITE_FIREBASE_MESSAGING_SENDER_ID: 메시징 발신자 ID (필수)
 * - VITE_FIREBASE_APP_ID: 앱 ID (필수)
 * 
 * 기능:
 * - 학생 데이터 저장
 * - 탐구 노트 저장
 * - 실시간 동기화
 * - 교사 대시보드 데이터 조회
 * 
 * Firebase 설정이 없으면 대부분의 기능이 작동하지 않습니다.
 * 자세한 내용은 FEATURE_STATUS.md를 참고하세요.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';

// Firebase 설정은 환경 변수에서 가져옵니다
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef'
};

// 환경 변수 로딩 확인 (디버깅용 - 개발 환경에서만)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('🔥 Firebase 설정 확인:', {
    hasApiKey: !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your-api-key',
    hasAuthDomain: !!firebaseConfig.authDomain && firebaseConfig.authDomain !== 'your-project.firebaseapp.com',
    hasProjectId: !!firebaseConfig.projectId && firebaseConfig.projectId !== 'your-project-id',
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });
}

// Firebase 설정 유효성 검사
const isFirebaseConfigured = () => {
  const isConfigured = firebaseConfig.apiKey !== 'your-api-key' &&
                       firebaseConfig.apiKey !== '' &&
                       firebaseConfig.authDomain !== 'your-project.firebaseapp.com' &&
                       firebaseConfig.authDomain !== '' &&
                       firebaseConfig.projectId !== 'your-project-id' &&
                       firebaseConfig.projectId !== '';
  
  if (!isConfigured) {
    console.error('❌ Firebase 환경 변수가 설정되지 않았습니다!');
    console.error('현재 설정:', {
      apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : '없음',
      authDomain: firebaseConfig.authDomain || '없음',
      projectId: firebaseConfig.projectId || '없음'
    });
    console.error('Netlify 환경 변수를 확인하세요:');
    console.error('- VITE_FIREBASE_API_KEY');
    console.error('- VITE_FIREBASE_AUTH_DOMAIN');
    console.error('- VITE_FIREBASE_PROJECT_ID');
    console.error('- VITE_FIREBASE_STORAGE_BUCKET');
    console.error('- VITE_FIREBASE_MESSAGING_SENDER_ID');
    console.error('- VITE_FIREBASE_APP_ID');
  }
  
  return isConfigured;
};

// Firebase 초기화
let app;
try {
  app = initializeApp(firebaseConfig);
  
  // 설정이 올바른지 확인
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase 환경 변수가 설정되지 않았습니다. Netlify 환경 변수를 확인하세요.');
  } else {
    console.log('✅ Firebase 초기화 성공:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });
  }
} catch (error: any) {
  console.error('❌ Firebase 초기화 실패:', error);
  console.error('에러 상세:', {
    code: error.code,
    message: error.message,
    stack: error.stack
  });
  throw error;
}

// Firestore 인스턴스
export const db = getFirestore(app);

// 네트워크 상태 관리 함수
export const enableFirestoreNetwork = async () => {
  try {
    await enableNetwork(db);
    console.log('✅ Firestore 네트워크 활성화됨');
  } catch (error) {
    console.error('❌ Firestore 네트워크 활성화 실패:', error);
  }
};

export const disableFirestoreNetwork = async () => {
  try {
    await disableNetwork(db);
    console.log('⚠️ Firestore 네트워크 비활성화됨');
  } catch (error) {
    console.error('❌ Firestore 네트워크 비활성화 실패:', error);
  }
};

// 초기화 시 네트워크 활성화 시도
enableFirestoreNetwork().catch(console.error);

export default app;
