import React, { useState, useEffect } from 'react';
import { InquiryEntry } from '../types';
import { getEntry, getAllEntries, saveEntry } from '../utils/firestore';
import InquiryForm from './InquiryForm';
import EntryList from './EntryList';
import Toast from './Toast';

interface MainScreenProps {
  studentId: string;
  studentName: string;
  onLogout: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ studentId, studentName, onLogout }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [currentEntry, setCurrentEntry] = useState<InquiryEntry | null>(null);
  const [allEntries, setAllEntries] = useState<InquiryEntry[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAllEntries();
  }, [studentId]);

  useEffect(() => {
    loadEntry(selectedDate);
  }, [selectedDate, studentId]);

  function getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  function isToday(date: string): boolean {
    return date === getTodayDate();
  }

  async function loadAllEntries() {
    try {
      const entries = await getAllEntries(studentId);
      setAllEntries(entries);
    } catch (error) {
      console.error('기록 목록 불러오기 실패:', error);
      showToastMessage('기록 목록을 불러오지 못했어요.');
    }
  }

  async function loadEntry(date: string) {
    setIsLoading(true);
    try {
      const entry = await getEntry(studentId, date);
      if (entry) {
        setCurrentEntry(entry);
      } else {
        setCurrentEntry(createEmptyEntry(date));
      }
    } catch (error) {
      console.error('기록 불러오기 실패:', error);
      setCurrentEntry(createEmptyEntry(date));
    } finally {
      setIsLoading(false);
    }
  }

  function createEmptyEntry(date: string): InquiryEntry {
    return {
      date,
      todayTopic: '',
      questions: '',
      observations: '',
      priorKnowledge: '',
      groupQuestion: '',
      methods: '',
      findings: '',
      reflectionText: '',
      dataTable: undefined,
      barChart: undefined,
      resources: {
        files: [],
        links: []
      }
    };
  }

  async function handleSave(entry: InquiryEntry) {
    try {
      await saveEntry(studentId, entry);
      setCurrentEntry(entry);
      
      // 목록 갱신
      const updatedEntries = allEntries.filter(e => e.date !== entry.date);
      setAllEntries([entry, ...updatedEntries].sort((a, b) => b.date.localeCompare(a.date)));
      
      showToastMessage('저장되었습니다! ✅');
    } catch (error) {
      console.error('저장 실패:', error);
      showToastMessage('저장에 실패했어요. 다시 시도해주세요.');
    }
  }

  function showToastMessage(message: string) {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  function handleDateChange(date: string) {
    const today = getTodayDate();
    if (date > today) {
      showToastMessage('미래 날짜는 선택할 수 없어요!');
      return;
    }
    setSelectedDate(date);
  }

  function handleTodayClick() {
    setSelectedDate(getTodayDate());
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔬</span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800">
              온라인 탐구 성장 노트
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full font-bold text-sm">
              📅 {getTodayDate()}
            </span>
            <span className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-full font-bold text-sm">
              👤 4학년 {studentName}
            </span>
            <button
              onClick={onLogout}
              className="bg-white border-2 border-red-500 text-red-500 px-4 py-2 rounded-full font-bold text-sm hover:bg-red-500 hover:text-white transition-colors"
            >
              나가기
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Date Selector */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-black text-gray-800 mb-4">
                📆 날짜 선택
              </h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                max={getTodayDate()}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 mb-3"
              />
              <button
                onClick={handleTodayClick}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                오늘로 이동 🎯
              </button>
            </div>

            {/* Entry List */}
            <div className="bg-white rounded-2xl shadow-lg p-6 max-h-[600px] overflow-y-auto">
              <h2 className="text-xl font-black text-gray-800 mb-4">
                📚 이전 탐구 기록
              </h2>
              <EntryList
                entries={allEntries}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>
          </aside>

          {/* Content Area */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="animate-spin text-6xl mb-4">⏳</div>
                <p className="text-xl font-bold text-gray-600">불러오는 중...</p>
              </div>
            ) : currentEntry ? (
              <InquiryForm
                entry={currentEntry}
                isEditable={isToday(selectedDate)}
                studentId={studentId}
                onSave={handleSave}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-xl font-bold text-gray-600">
                  날짜를 선택해주세요
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Toast */}
      {showToast && <Toast message={toastMessage} />}
    </div>
  );
};

export default MainScreen;
