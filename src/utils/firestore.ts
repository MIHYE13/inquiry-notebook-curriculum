import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { StudentNotebook, InquiryEntry } from '../types';

// 학생 ID 생성 (이름 + 코드를 해시하여 사용)
export function generateStudentId(name: string, code: string): string {
  return btoa(`${name}:${code}`).replace(/[^a-zA-Z0-9]/g, '');
}

// 학생 정보 가져오기 또는 생성
export async function getOrCreateStudent(
  name: string,
  code: string
): Promise<StudentNotebook> {
  try {
    const studentId = generateStudentId(name, code);
    const studentRef = doc(db, 'students', studentId);
    const studentSnap = await getDoc(studentRef);

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

      await setDoc(studentRef, {
        studentName: name,
        studentCode: code,
        createdAt: now,
        lastModified: now
      });

      return newStudent;
    }
  } catch (error) {
    console.error('학생 정보 가져오기/생성 오류:', error);
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
    const entrySnap = await getDoc(entryRef);

    if (entrySnap.exists()) {
      return entrySnap.data() as InquiryEntry;
    }
    return null;
  } catch (error) {
    console.error('탐구 노트 가져오기 오류:', error);
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

// 탐구 노트 저장
export async function saveEntry(
  studentId: string,
  entry: InquiryEntry
): Promise<void> {
  try {
    const entryRef = doc(db, 'students', studentId, 'entries', entry.date);
    await setDoc(entryRef, entry, { merge: true });

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
      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (e) {
      console.warn('localStorage 저장 실패:', e);
    }
  } catch (error) {
    console.error('탐구 노트 저장 오류:', error);
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
