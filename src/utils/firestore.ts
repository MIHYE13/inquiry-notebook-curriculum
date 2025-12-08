import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { StudentNotebook, InquiryEntry } from '../types';

// 학생 ID 생성 (이름 + 코드). 한글 등 유니코드도 안전하게 처리
export function generateStudentId(name: string, code: string): string {
  const raw = `${name}:${code}`;
  const base64 = btoa(
    encodeURIComponent(raw).replace(/%([0-9A-F]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
  );
  return base64.replace(/[^a-zA-Z0-9]/g, '');
}

// 학생 정보 가져오기 또는 생성
export async function getOrCreateStudent(
  name: string,
  code: string
): Promise<StudentNotebook> {
  try {
    const studentId = generateStudentId(name, code);
    const studentRef = doc(db, 'students', studentId);
    
    // 네트워크가 오프라인인 경우 재시도
    let studentSnap;
    try {
      studentSnap = await getDoc(studentRef);
    } catch (error: any) {
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        console.warn('⚠️ Firestore가 오프라인 상태입니다. 네트워크 연결을 확인하세요.');
        // 네트워크 재연결 시도
        const { enableFirestoreNetwork } = await import('../firebaseConfig');
        await enableFirestoreNetwork();
        // 재시도
        studentSnap = await getDoc(studentRef);
      } else {
        throw error;
      }
    }

    if (studentSnap.exists()) {
      const data = studentSnap.data();
      return {
        studentId,
        studentName: data.studentName,
        studentCode: data.studentCode,
        createdAt: data.createdAt,
        lastModified: data.lastModified
      };
    } else {
      // 새 학생 생성
      const now = new Date().toISOString();
      const newStudent: StudentNotebook = {
        studentId,
        studentName: name,
        studentCode: code,
        createdAt: now,
        lastModified: now
      };

      try {
        await setDoc(studentRef, {
          studentName: name,
          studentCode: code,
          createdAt: now,
          lastModified: now
        });
      } catch (error: any) {
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          console.warn('⚠️ Firestore가 오프라인 상태입니다. 네트워크 연결을 확인하세요.');
          const { enableFirestoreNetwork } = await import('../firebaseConfig');
          await enableFirestoreNetwork();
          // 재시도
          await setDoc(studentRef, {
            studentName: name,
            studentCode: code,
            createdAt: now,
            lastModified: now
          });
        } else {
          throw error;
        }
      }

      return newStudent;
    }
  } catch (error: any) {
    console.error('학생 정보 가져오기/생성 오류:', error);
    console.error('에러 상세:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    // 더 구체적인 에러 메시지
    if (error.code === 'unavailable' || error.message?.includes('offline')) {
      throw new Error('인터넷 연결을 확인해주세요. Firebase에 연결할 수 없습니다.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Firebase 보안 규칙을 확인해주세요. Firestore Database > 규칙에서 접근 권한을 확인하세요.');
    } else if (error.code === 'invalid-argument' || error.message?.includes('400') || error.message?.includes('Bad Request')) {
      throw new Error('Firebase 설정이 올바르지 않습니다. Netlify 환경 변수를 확인하세요.');
    } else if (error.code === 'not-found' || error.message?.includes('404')) {
      throw new Error('Firebase 프로젝트를 찾을 수 없습니다. 프로젝트 ID를 확인하세요.');
    }
    
    throw error;
  }
}

// 특정 날짜의 탐구 노트 가져오기
export async function getEntry(
  studentId: string,
  date: string
): Promise<InquiryEntry | null> {
  try {
    const entryRef = doc(db, 'students', studentId, 'entries', date);
    
    let entrySnap;
    try {
      entrySnap = await getDoc(entryRef);
    } catch (error: any) {
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        console.warn('⚠️ Firestore가 오프라인 상태입니다. 네트워크 연결을 확인하세요.');
        // 네트워크 재연결 시도
        const { enableFirestoreNetwork } = await import('../firebaseConfig');
        await enableFirestoreNetwork();
        // 재시도
        entrySnap = await getDoc(entryRef);
      } else {
        throw error;
      }
    }

    if (entrySnap.exists()) {
      return entrySnap.data() as InquiryEntry;
    }
    return null;
  } catch (error: any) {
    console.error('탐구 노트 가져오기 오류:', error);
    console.error('에러 상세:', {
      code: error.code,
      message: error.message
    });
    
    if (error.code === 'unavailable' || error.message?.includes('offline')) {
      throw new Error('인터넷 연결을 확인해주세요.');
    } else if (error.code === 'invalid-argument' || error.message?.includes('400') || error.message?.includes('Bad Request')) {
      throw new Error('Firebase 설정이 올바르지 않습니다. Netlify 환경 변수를 확인하세요.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Firebase 보안 규칙을 확인해주세요.');
    }
    
    throw error;
  }
}

// 모든 탐구 노트 가져오기
export async function getAllEntries(studentId: string): Promise<InquiryEntry[]> {
  try {
    const entriesRef = collection(db, 'students', studentId, 'entries');
    const q = query(entriesRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    const entries: InquiryEntry[] = [];
    querySnapshot.forEach((doc) => {
      entries.push(doc.data() as InquiryEntry);
    });

    return entries;
  } catch (error) {
    console.error('모든 탐구 노트 가져오기 오류:', error);
    return [];
  }
}

// 데이터 정리 함수 (undefined 제거 및 직렬화 가능한 형태로 변환)
function sanitizeEntry(entry: InquiryEntry): any {
  const cleaned: any = {
    date: entry.date,
    todayTopic: entry.todayTopic || '',
    questions: entry.questions || '',
    observations: entry.observations || '',
    priorKnowledge: entry.priorKnowledge || '',
    groupQuestion: entry.groupQuestion || '',
    methods: entry.methods || '',
    findings: entry.findings || '',
    reflectionText: entry.reflectionText || '',
    resources: {
      files: entry.resources?.files || [],
      links: entry.resources?.links || []
    }
  };

  // 선택적 필드들 추가 (값이 있을 때만)
  if (entry.reflectionDrawingDataUrl) {
    cleaned.reflectionDrawingDataUrl = entry.reflectionDrawingDataUrl;
  }

  if (entry.selectedLessonInfo) {
    cleaned.selectedLessonInfo = entry.selectedLessonInfo;
  }

  if (entry.dataTable) {
    cleaned.dataTable = entry.dataTable;
  }

  if (entry.barChart) {
    cleaned.barChart = entry.barChart;
  }

  if (entry.scientistNote) {
    cleaned.scientistNote = entry.scientistNote;
  }

  if (entry.aiHelpLogs) {
    cleaned.aiHelpLogs = entry.aiHelpLogs;
  }

  return cleaned;
}

// 탐구 노트 저장
export async function saveEntry(
  studentId: string,
  entry: InquiryEntry
): Promise<void> {
  try {
    // 데이터 정리
    const cleanedEntry = sanitizeEntry(entry);

    // Firebase에 저장
    const entryRef = doc(db, 'students', studentId, 'entries', entry.date);
    await setDoc(entryRef, cleanedEntry, { merge: true });

    // 학생의 lastModified 업데이트
    const studentRef = doc(db, 'students', studentId);
    await setDoc(
      studentRef,
      { lastModified: new Date().toISOString() },
      { merge: true }
    );

    // localStorage에도 백업
    try {
      const cacheKey = `entry_${studentId}_${entry.date}`;
      localStorage.setItem(cacheKey, JSON.stringify(cleanedEntry));
    } catch (e) {
      console.warn('localStorage 저장 실패:', e);
    }
  } catch (error: any) {
    console.error('탐구 노트 저장 오류:', error);
    
    // 더 자세한 에러 정보 로깅
    if (error.code) {
      console.error('Firebase 에러 코드:', error.code);
      console.error('Firebase 에러 메시지:', error.message);
    }
    
    // localStorage에 임시 저장 (오프라인 대비)
    try {
      const cacheKey = `entry_${studentId}_${entry.date}_pending`;
      const cleanedEntry = sanitizeEntry(entry);
      localStorage.setItem(cacheKey, JSON.stringify({
        ...cleanedEntry,
        _pending: true,
        _error: error.message || '저장 실패'
      }));
    } catch (e) {
      console.warn('임시 저장 실패:', e);
    }
    
    throw error;
  }
}

// localStorage에서 캐시된 데이터 가져오기 (오프라인 대비)
export function getCachedEntry(studentId: string, date: string): InquiryEntry | null {
  try {
    const cacheKey = `entry_${studentId}_${date}`;
    const cached = localStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.warn('캐시 읽기 실패:', e);
    return null;
  }
}

// AI 도움 로그 추가
export async function addAIHelpLog(
  studentId: string,
  date: string,
  type: 'chatgpt' | 'perplexity',
  logData: {
    field?: string;
    prompt?: string;
    purpose?: string;
    query?: string;
    response: string;
  }
): Promise<void> {
  try {
    const entry = await getEntry(studentId, date);
    if (!entry) return;

    const aiHelpLogs = entry.aiHelpLogs || { chatgpt: [], perplexity: [] };
    const timestamp = new Date().toISOString();

    if (type === 'chatgpt') {
      aiHelpLogs.chatgpt = aiHelpLogs.chatgpt || [];
      aiHelpLogs.chatgpt.push({
        field: logData.field || '',
        prompt: logData.prompt || '',
        response: logData.response,
        createdAt: timestamp
      });
    } else if (type === 'perplexity') {
      aiHelpLogs.perplexity = aiHelpLogs.perplexity || [];
      aiHelpLogs.perplexity.push({
        purpose: logData.purpose || '',
        query: logData.query || '',
        response: logData.response,
        createdAt: timestamp
      });
    }

    const entryRef = doc(db, 'students', studentId, 'entries', date);
    await setDoc(entryRef, { aiHelpLogs }, { merge: true });
  } catch (error) {
    console.error('AI 도움 로그 추가 오류:', error);
  }
}

// 모든 학생 목록 가져오기 (교사용)
export async function getAllStudents(): Promise<StudentNotebook[]> {
  try {
    const studentsRef = collection(db, 'students');
    const querySnapshot = await getDocs(studentsRef);

    const students: StudentNotebook[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      students.push({
        studentId: doc.id,
        studentName: data.studentName,
        studentCode: data.studentCode,
        createdAt: data.createdAt,
        lastModified: data.lastModified
      });
    });

    // 이름순으로 정렬
    return students.sort((a, b) => a.studentName.localeCompare(b.studentName));
  } catch (error) {
    console.error('모든 학생 목록 가져오기 오류:', error);
    return [];
  }
}

// 특정 학생의 모든 탐구 노트 가져오기 (교사용 - 이미 getAllEntries가 있지만 명시적으로)
export async function getStudentEntries(studentId: string): Promise<InquiryEntry[]> {
  return getAllEntries(studentId);
}
