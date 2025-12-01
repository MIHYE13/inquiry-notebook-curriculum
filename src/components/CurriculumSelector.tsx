import React, { useState } from 'react';
import { Curriculum, CurriculumLesson } from '../types';
import { ALL_CURRICULUMS, getAllUnits, getLessonsByUnit } from '../utils/curriculum';

interface CurriculumSelectorProps {
  onSelectLesson: (curriculum: Curriculum, lesson: CurriculumLesson) => void;
  onClose: () => void;
}

const CurriculumSelector: React.FC<CurriculumSelectorProps> = ({ onSelectLesson, onClose }) => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCurriculumSelect = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    setSelectedUnit('');
  };

  const handleLessonClick = (lesson: CurriculumLesson) => {
    if (selectedCurriculum) {
      onSelectLesson(selectedCurriculum, lesson);
    }
  };

  const getFilteredLessons = () => {
    if (!selectedCurriculum) return [];
    
    let lessons = selectedUnit 
      ? getLessonsByUnit(selectedCurriculum.id, selectedUnit)
      : selectedCurriculum.lessons;

    if (searchQuery) {
      lessons = lessons.filter(lesson =>
        lesson.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return lessons;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black mb-2">📚 진도표에서 차시 선택</h2>
              <p className="text-blue-100">오늘 수업할 차시를 선택하여 탐구 노트를 시작하세요</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar - 진도표 선택 */}
          <div className="w-80 bg-gray-50 p-6 overflow-y-auto border-r-2 border-gray-200">
            <h3 className="text-xl font-black text-gray-800 mb-4">📖 진도표 선택</h3>
            <div className="space-y-3">
              {ALL_CURRICULUMS.map(curriculum => (
                <button
                  key={curriculum.id}
                  onClick={() => handleCurriculumSelect(curriculum)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedCurriculum?.id === curriculum.id
                      ? 'bg-blue-500 text-white border-blue-600 shadow-lg'
                      : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div className="font-bold text-lg mb-1">{curriculum.grade}</div>
                  <div className={`text-sm ${
                    selectedCurriculum?.id === curriculum.id ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    {curriculum.subject} · {curriculum.semester}
                  </div>
                  <div className={`text-xs mt-2 ${
                    selectedCurriculum?.id === curriculum.id ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    총 {curriculum.lessons.length}차시
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedCurriculum ? (
              <>
                {/* Filters */}
                <div className="p-6 bg-white border-b-2 border-gray-200">
                  <div className="flex gap-4 items-center mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="차시 주제나 핵심어로 검색..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 text-lg"
                      />
                    </div>
                  </div>

                  {/* Unit Filter */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedUnit('')}
                      className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                        selectedUnit === ''
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      전체
                    </button>
                    {getAllUnits(selectedCurriculum.id).map(unit => (
                      <button
                        key={unit}
                        onClick={() => setSelectedUnit(unit)}
                        className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                          selectedUnit === unit
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lessons List */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getFilteredLessons().map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        className="text-left p-5 bg-white rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                              {lesson.period}차시
                            </span>
                          </div>
                          <svg 
                            className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>

                        <h4 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {lesson.topic}
                        </h4>

                        <div className="text-sm text-gray-600 mb-3">
                          📚 {lesson.unit}
                        </div>

                        {lesson.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {lesson.keywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-semibold"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}

                        {lesson.learningGoals && (
                          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            🎯 {lesson.learningGoals}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {getFilteredLessons().length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-xl text-gray-600">검색 결과가 없습니다.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-6">📚</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    왼쪽에서 진도표를 선택하세요
                  </h3>
                  <p className="text-gray-600">
                    학기별 진도표를 선택하면 차시 목록이 나타납니다
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumSelector;
