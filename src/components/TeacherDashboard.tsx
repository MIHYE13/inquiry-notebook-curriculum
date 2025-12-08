import React, { useState, useEffect } from 'react';
import { StudentNotebook, InquiryEntry } from '../types';
import { getAllStudents, getStudentEntries } from '../utils/firestore';
import InquiryForm from './InquiryForm';

interface TeacherDashboardProps {
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
  const [students, setStudents] = useState<StudentNotebook[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentNotebook | null>(null);
  const [studentEntries, setStudentEntries] = useState<InquiryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<InquiryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentEntries(selectedStudent.studentId);
    }
  }, [selectedStudent]);

  async function loadStudents() {
    setIsLoading(true);
    try {
      const allStudents = await getAllStudents();
      setStudents(allStudents);
    } catch (error) {
      console.error('학생 목록 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadStudentEntries(studentId: string) {
    setIsLoading(true);
    try {
      const entries = await getStudentEntries(studentId);
      setStudentEntries(entries);
      if (entries.length > 0) {
        setSelectedEntry(entries[0]);
      } else {
        setSelectedEntry(null);
      }
    } catch (error) {
      console.error('탐구 노트 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredStudents = students.filter(student =>
    student.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">👨‍🏫</span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800">
              교사용 대시보드
            </h1>
          </div>
          <button
            onClick={onLogout}
            className="bg-white border-2 border-red-500 text-red-500 px-4 py-2 rounded-full font-bold text-sm hover:bg-red-500 hover:text-white transition-colors"
          >
            나가기
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center mb-6">
            <div className="animate-spin text-6xl mb-4">⏳</div>
            <p className="text-xl font-bold text-gray-600">불러오는 중...</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 학생 목록 사이드바 */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-black text-gray-800 mb-4">
                👥 학생 목록 ({students.length}명)
              </h2>
              
              {/* 검색 */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="학생 이름 검색..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 mb-4"
              />

              {/* 학생 목록 */}
              <div className="max-h-[600px] overflow-y-auto space-y-2">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? '검색 결과가 없습니다' : '등록된 학생이 없습니다'}
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <button
                      key={student.studentId}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedStudent?.studentId === student.studentId
                          ? 'bg-blue-500 text-white border-blue-600 shadow-lg'
                          : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <div className="font-bold text-lg mb-1">{student.studentName}</div>
                      <div className={`text-sm ${
                        selectedStudent?.studentId === student.studentId ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        ID: {student.studentId.substring(0, 8)}...
                      </div>
                      <div className={`text-xs mt-1 ${
                        selectedStudent?.studentId === student.studentId ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        최근 수정: {new Date(student.lastModified).toLocaleDateString('ko-KR')}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* 탐구 노트 목록 및 내용 */}
          <main className="lg:col-span-3 space-y-6">
            {selectedStudent ? (
              <>
                {/* 학생 정보 및 탐구 노트 목록 */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-black text-gray-800">
                      📚 {selectedStudent.studentName}님의 탐구 노트
                    </h2>
                    <span className="text-sm text-gray-600">
                      총 {studentEntries.length}개
                    </span>
                  </div>

                  {/* 탐구 노트 목록 */}
                  {studentEntries.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto">
                      {studentEntries.map((entry) => (
                        <button
                          key={entry.date}
                          onClick={() => setSelectedEntry(entry)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            selectedEntry?.date === entry.date
                              ? 'bg-purple-500 text-white border-purple-600'
                              : 'bg-gray-50 border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          <div className="font-bold text-sm">{entry.date}</div>
                          <div className={`text-xs mt-1 ${
                            selectedEntry?.date === entry.date ? 'text-purple-100' : 'text-gray-600'
                          }`}>
                            {entry.todayTopic || '주제 없음'}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      아직 작성한 탐구 노트가 없습니다
                    </div>
                  )}
                </div>

                {/* 선택한 탐구 노트 내용 */}
                {selectedEntry ? (
                  <InquiryForm
                    entry={selectedEntry}
                    isEditable={false}
                    studentId={selectedStudent.studentId}
                    onSave={() => {}}
                  />
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-xl font-bold text-gray-600">
                      탐구 노트를 선택해주세요
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-xl font-bold text-gray-600">
                  왼쪽에서 학생을 선택해주세요
                </p>
                <p className="text-gray-500 mt-2">
                  학생의 탐구 노트를 확인하고 관리할 수 있습니다
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

