import React, { useState, useEffect } from 'react';
import { InquiryEntry, Curriculum, CurriculumLesson, DataTable, BarChartData } from '../types';
import DrawingCanvas from './DrawingCanvas';
import AIHelpButton from './AIHelpButton';
import CurriculumSelector from './CurriculumSelector';
import DataCreatorModal from './DataCreatorModal';
import DataTableCreator from './DataTableCreator';
import BarChartCreator from './BarChartCreator';
import { suggestQuestionsOrHints } from '../api/chatgpt';
import { searchRecentScienceInfo } from '../api/perplexity';
import { addAIHelpLog } from '../utils/firestore';

interface InquiryFormProps {
  entry: InquiryEntry;
  isEditable: boolean;
  studentId: string;
  onSave: (entry: InquiryEntry) => void;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ 
  entry, 
  isEditable, 
  studentId,
  onSave 
}) => {
  const [formData, setFormData] = useState<InquiryEntry>(entry);
  const [newLink, setNewLink] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [showCurriculumSelector, setShowCurriculumSelector] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);

  useEffect(() => {
    setFormData(entry);
  }, [entry]);

  const handleChange = (field: keyof InquiryEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (!isEditable) return;
    
    const timer = setTimeout(() => {
      onSave(formData);
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, isEditable]);

  const handleAddLink = () => {
    if (!newLink.trim()) return;

    const newLinkObj = {
      id: Date.now().toString(),
      url: newLink.trim(),
      description: linkDescription.trim() || undefined
    };

    setFormData(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        links: [...prev.resources.links, newLinkObj]
      }
    }));

    setNewLink('');
    setLinkDescription('');
  };

  const handleRemoveLink = (id: string) => {
    setFormData(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        links: prev.resources.links.filter(link => link.id !== id)
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name
    }));

    setFormData(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        files: [...prev.resources.files, ...newFiles]
      }
    }));
  };

  const handleRemoveFile = (id: string) => {
    setFormData(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        files: prev.resources.files.filter(file => file.id !== id)
      }
    }));
  };

  const handleDrawingSave = (dataUrl: string) => {
    setFormData(prev => ({
      ...prev,
      reflectionDrawingDataUrl: dataUrl
    }));
  };

  const handleSelectCurriculumLesson = (curriculum: Curriculum, lesson: CurriculumLesson) => {
    setFormData(prev => ({
      ...prev,
      todayTopic: lesson.topic,
      selectedLessonInfo: {
        curriculumName: `${curriculum.grade} ${curriculum.subject} ${curriculum.semester}`,
        unit: lesson.unit,
        period: lesson.period,
        topic: lesson.topic
      }
    }));
    setShowCurriculumSelector(false);
  };

  const handleCreateTable = () => {
    setShowTableModal(true);
  };

  const handleEditTable = () => {
    setShowTableModal(true);
  };

  const handleDeleteTable = () => {
    setFormData(prev => ({
      ...prev,
      dataTable: undefined
    }));
  };

  const handleTableSave = (table: DataTable) => {
    setFormData(prev => ({
      ...prev,
      dataTable: table
    }));
  };

  const handleCreateChart = () => {
    setShowChartModal(true);
  };

  const handleEditChart = () => {
    setShowChartModal(true);
  };

  const handleDeleteChart = () => {
    setFormData(prev => ({
      ...prev,
      barChart: undefined
    }));
  };

  const handleChartSave = (chart: BarChartData) => {
    setFormData(prev => ({
      ...prev,
      barChart: chart
    }));
  };

  // AI 도움 핸들러들
  const handleTopicHelp = async () => {
    const result = await suggestQuestionsOrHints('topic', {});
    if (result.success && result.data) {
      await addAIHelpLog(studentId, formData.date, 'chatgpt', {
        field: 'todayTopic',
        prompt: '주제 추천 요청',
        response: result.data
      });
      return result.data;
    }
    throw new Error(result.error || '오류가 발생했습니다');
  };

  const handleQuestionsHelp = async () => {
    const result = await suggestQuestionsOrHints('studentQuestions', {
      todayTopic: formData.todayTopic
    });
    if (result.success && result.data) {
      await addAIHelpLog(studentId, formData.date, 'chatgpt', {
        field: 'questions',
        prompt: formData.todayTopic,
        response: result.data
      });
      return result.data;
    }
    throw new Error(result.error || '오류가 발생했습니다');
  };

  const handleGroupQuestionHelp = async () => {
    const result = await suggestQuestionsOrHints('groupQuestion', {
      groupQuestion: formData.groupQuestion
    });
    if (result.success && result.data) {
      await addAIHelpLog(studentId, formData.date, 'chatgpt', {
        field: 'groupQuestion',
        prompt: formData.groupQuestion,
        response: result.data
      });
      return result.data;
    }
    throw new Error(result.error || '오류가 발생했습니다');
  };

  const handleReflectionHelp = async () => {
    const result = await suggestQuestionsOrHints('reflection', {
      findings: formData.findings,
      todayTopic: formData.todayTopic
    });
    if (result.success && result.data) {
      await addAIHelpLog(studentId, formData.date, 'chatgpt', {
        field: 'reflectionText',
        prompt: formData.findings,
        response: result.data
      });
      return result.data;
    }
    throw new Error(result.error || '오류가 발생했습니다');
  };

  const handleBackgroundInfo = async () => {
    const query = formData.todayTopic || formData.priorKnowledge;
    const result = await searchRecentScienceInfo('background', query);
    if (result.success && result.data) {
      await addAIHelpLog(studentId, formData.date, 'perplexity', {
        purpose: 'background',
        query: query,
        response: result.data
      });
      return result.data;
    }
    throw new Error(result.error || '오류가 발생했습니다');
  };

  const handleMethodInfo = async () => {
    const query = `${formData.todayTopic} ${formData.groupQuestion}`;
    const result = await searchRecentScienceInfo('method', query);
    if (result.success && result.data) {
      await addAIHelpLog(studentId, formData.date, 'perplexity', {
        purpose: 'method',
        query: query,
        response: result.data
      });
      return result.data;
    }
    throw new Error(result.error || '오류가 발생했습니다');
  };

  const handleComparisonInfo = async () => {
    const query = formData.findings;
    const result = await searchRecentScienceInfo('comparison', query);
    if (result.success && result.data) {
      await addAIHelpLog(studentId, formData.date, 'perplexity', {
        purpose: 'comparison',
        query: query,
        response: result.data
      });
      return result.data;
    }
    throw new Error(result.error || '오류가 발생했습니다');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
      {!isEditable && (
        <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-4 py-3 rounded-xl text-center font-bold">
          📖 과거 기록은 읽기만 가능해요. 오늘 날짜를 선택하면 새로운 내용을 작성할 수 있어요!
        </div>
      )}

      <div className="flex justify-between items-center border-b-4 border-gray-200 pb-4">
        <h2 className="text-2xl md:text-3xl font-black text-gray-800">
          {isEditable ? '✏️ 오늘의 탐구 노트' : '📄 탐구 노트 보기'}
        </h2>
        <span className="text-lg font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded-full">
          {formData.date}
        </span>
      </div>

      {/* 1. 오늘의 탐구 주제 */}
      <div className="space-y-3">
        <label className="block text-lg font-bold text-gray-700">
          🎯 오늘의 탐구 주제를 적으세요
        </label>
        {isEditable && (
          <div className="flex flex-wrap gap-2">
            <AIHelpButton
              label="주제 예시 부탁하기"
              icon="💡"
              onHelp={handleTopicHelp}
              disabled={!isEditable}
            />
            <button
              type="button"
              onClick={() => setShowCurriculumSelector(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-green-500 text-green-600 font-bold hover:bg-green-50 transition-colors"
            >
              📚 진도표에서 선택하기
            </button>
          </div>
        )}
        <textarea
          value={formData.todayTopic}
          onChange={(e) => handleChange('todayTopic', e.target.value)}
          disabled={!isEditable}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all resize-none"
          rows={2}
          placeholder="예: 식물의 성장 관찰하기"
        />
        {formData.selectedLessonInfo && (
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs md:text-sm font-semibold text-blue-700">
              <span className="text-[11px] md:text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">
                진도표
              </span>
              <span>
                {formData.selectedLessonInfo.curriculumName} · {formData.selectedLessonInfo.unit} ·{' '}
                {formData.selectedLessonInfo.period}차시
              </span>
            </span>
          </div>
        )}
      </div>

      {/* 2. 궁금한 내용 */}
      <div className="space-y-3">
        <label className="block text-lg font-bold text-gray-700">
          ❓ 궁금한 내용을 적으세요
        </label>
        {isEditable && formData.todayTopic && (
          <AIHelpButton
            label="질문이 잘 떠오르지 않아요"
            icon="🤔"
            onHelp={handleQuestionsHelp}
            disabled={!isEditable}
          />
        )}
        <textarea
          value={formData.questions}
          onChange={(e) => handleChange('questions', e.target.value)}
          disabled={!isEditable}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all resize-none"
          rows={3}
          placeholder="무엇이 궁금한가요?"
        />
      </div>

      {/* 3. 관찰한 내용 */}
      <div className="space-y-3">
        <label className="block text-lg font-bold text-gray-700">
          👀 관찰한 내용을 적으세요
        </label>
        <textarea
          value={formData.observations}
          onChange={(e) => handleChange('observations', e.target.value)}
          disabled={!isEditable}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all resize-none"
          rows={4}
          placeholder="보고, 듣고, 느낀 것을 자세히 적어보세요"
        />
      </div>

      {/* 4. 내가 알고 있는 것 */}
      <div className="space-y-3">
        <label className="block text-lg font-bold text-gray-700">
          💭 탐구 내용과 관련하여 내가 알고 있는 것을 적으세요
        </label>
        {isEditable && (formData.todayTopic || formData.priorKnowledge) && (
          <AIHelpButton
            label="배경 지식 더 알아보기"
            icon="📚"
            onHelp={handleBackgroundInfo}
            disabled={!isEditable}
          />
        )}
        <textarea
          value={formData.priorKnowledge}
          onChange={(e) => handleChange('priorKnowledge', e.target.value)}
          disabled={!isEditable}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all resize-none"
          rows={3}
          placeholder="이미 알고 있는 지식이나 경험을 적어보세요"
        />
      </div>

      {/* 5. 우리 모둠의 탐구 문제 */}
      <div className="space-y-3">
        <label className="block text-lg font-bold text-gray-700">
          👥 우리 모둠에서 정한 탐구 문제는?
        </label>
        {isEditable && (
          <AIHelpButton
            label="탐구 문제 다듬기"
            icon="✨"
            onHelp={handleGroupQuestionHelp}
            disabled={!isEditable}
          />
        )}
        <textarea
          value={formData.groupQuestion}
          onChange={(e) => handleChange('groupQuestion', e.target.value)}
          disabled={!isEditable}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all resize-none"
          rows={2}
          placeholder="모둠에서 함께 정한 탐구 문제를 적어보세요"
        />
      </div>

      {/* 6. 탐구 방법 */}
      <div className="space-y-3">
        <label className="block text-lg font-bold text-gray-700">
          🔬 탐구 방법을 적으세요
        </label>
        {isEditable && formData.todayTopic && formData.groupQuestion && (
          <AIHelpButton
            label="비슷한 탐구 방법 찾아보기"
            icon="🔍"
            onHelp={handleMethodInfo}
            disabled={!isEditable}
          />
        )}
        <textarea
          value={formData.methods}
          onChange={(e) => handleChange('methods', e.target.value)}
          disabled={!isEditable}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all resize-none"
          rows={4}
          placeholder="어떻게 탐구할 계획인가요?"
        />
      </div>

      {/* 7. 알게 된 사실 */}
      <div className="space-y-3">
        <label className="block text-lg font-bold text-gray-700">
          💡 오늘의 탐구활동 후에 알게 된 사실을 적으세요
        </label>
        {isEditable && formData.findings && (
          <AIHelpButton
            label="과학자들은 뭐라고 말할까?"
            icon="🧑‍🔬"
            onHelp={handleComparisonInfo}
            disabled={!isEditable}
          />
        )}
        <textarea
          value={formData.findings}
          onChange={(e) => handleChange('findings', e.target.value)}
          disabled={!isEditable}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all resize-none"
          rows={4}
          placeholder="탐구를 통해 새롭게 알게 된 것들을 적어보세요"
        />
      </div>

      {/* 9. 표 만들기 섹션 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h3 className="text-xl font-black text-gray-800 mb-2">
          📊 실험 데이터 표 만들기
        </h3>

        {formData.dataTable ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <DataTableCreator
                initialData={formData.dataTable}
                onSave={handleTableSave}
                editable={false}
              />
            </div>
            {isEditable && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleEditTable}
                  className="h-12 px-6 rounded-xl bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  ✏️ 표 수정
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTable}
                  className="h-12 px-6 rounded-xl bg-red-100 text-red-600 font-bold text-lg hover:bg-red-200 transition-all"
                >
                  ❌ 표 삭제
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              아직 표를 만들지 않았어요. 실험에서 모은 데이터를 표로 정리해 보아요.
            </p>
            {isEditable && (
              <button
                type="button"
                onClick={handleCreateTable}
                className="h-12 px-6 rounded-xl bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full md:w-auto"
              >
                📊 표 만들기
              </button>
            )}
          </div>
        )}
      </div>

      {/* 10. 그래프 만들기 섹션 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h3 className="text-xl font-black text-gray-800 mb-2">
          📈 실험 결과 그래프 그리기
        </h3>

        {formData.barChart ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <BarChartCreator
                initialData={formData.barChart}
                onSave={handleChartSave}
                editable={false}
              />
            </div>
            {isEditable && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleEditChart}
                  className="h-12 px-6 rounded-xl bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  ✏️ 그래프 수정
                </button>
                <button
                  type="button"
                  onClick={handleDeleteChart}
                  className="h-12 px-6 rounded-xl bg-red-100 text-red-600 font-bold text-lg hover:bg-red-200 transition-all"
                >
                  ❌ 그래프 삭제
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              아직 그래프를 만들지 않았어요. 위에서 만든 표를 보고, 막대그래프로 나타내 보아요.
            </p>
            {isEditable && (
              <button
                type="button"
                onClick={handleCreateChart}
                className="h-12 px-6 rounded-xl bg-green-500 text-white font-bold text-lg hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full md:w-auto"
              >
                📈 그래프 만들기
              </button>
            )}
          </div>
        )}
      </div>

      {/* 11. 변화된 나의 생각 */}
      <div className="space-y-3">
        <label className="block text-lg font-bold text-gray-700">
          🎨 오늘의 탐구 활동 후에 변화된 나의 생각을 그림, 또는 글로 적으세요
        </label>
        {isEditable && (
          <AIHelpButton
            label="나의 생각 정리 도움받기"
            icon="💬"
            onHelp={handleReflectionHelp}
            disabled={!isEditable}
          />
        )}
        <textarea
          value={formData.reflectionText}
          onChange={(e) => handleChange('reflectionText', e.target.value)}
          disabled={!isEditable}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all resize-none"
          rows={4}
          placeholder="생각이나 느낌을 자유롭게 표현해보세요"
        />

        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">그림으로도 표현해보세요!</p>
          <DrawingCanvas
            initialDataUrl={formData.reflectionDrawingDataUrl}
            onSave={handleDrawingSave}
            disabled={!isEditable}
          />
        </div>
      </div>

      {/* 자료 모으기 */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-black text-gray-800">
          📎 탐구와 관련된 자료(사진, 문서, 링크 등)를 추가해 보세요
        </h3>

        {isEditable && (
          <div className="space-y-4">
            <div>
              <label htmlFor="file-input" className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all">
                📁 파일 추가하기
              </label>
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-sm text-gray-600 mt-2">
                * 주의: 실제 파일은 저장되지 않고, 파일 이름만 기록됩니다.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="웹 링크 주소 (예: https://...)"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400"
              />
              <input
                type="text"
                value={linkDescription}
                onChange={(e) => setLinkDescription(e.target.value)}
                placeholder="링크 설명 (선택사항)"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400"
              />
              <button
                onClick={handleAddLink}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-bold hover:bg-green-600 transition-colors"
              >
                링크 추가
              </button>
            </div>
          </div>
        )}

        {formData.resources.files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-gray-700">📂 첨부된 파일</h4>
            {formData.resources.files.map(file => (
              <div key={file.id} className="flex justify-between items-center bg-white p-3 rounded-lg border-2 border-gray-200">
                <span className="text-gray-700">📄 {file.name}</span>
                {isEditable && (
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-xl"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {formData.resources.links.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-gray-700">🔗 저장된 링크</h4>
            {formData.resources.links.map(link => (
              <div key={link.id} className="flex justify-between items-center bg-white p-3 rounded-lg border-2 border-gray-200">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-semibold underline break-all"
                >
                  🌐 {link.description || link.url}
                </a>
                {isEditable && (
                  <button
                    onClick={() => handleRemoveLink(link.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-xl ml-2"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditable && (
        <div className="text-center space-y-3 pt-6 border-t-4 border-gray-200">
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-12 rounded-xl text-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            💾 저장하기
          </button>
          <p className="text-sm text-gray-600">
            * 자동으로 저장되지만, 저장 버튼을 눌러서 직접 저장할 수도 있어요!
          </p>
        </div>
      )}

      {showCurriculumSelector && (
        <CurriculumSelector
          onSelectLesson={handleSelectCurriculumLesson}
          onClose={() => setShowCurriculumSelector(false)}
        />
      )}

      <DataCreatorModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        title="📊 실험 데이터 표 만들기"
      >
        <DataTableCreator
          initialData={formData.dataTable}
          onSave={handleTableSave}
          editable={isEditable}
        />
      </DataCreatorModal>

      <DataCreatorModal
        isOpen={showChartModal}
        onClose={() => setShowChartModal(false)}
        title="📈 실험 결과 그래프 그리기"
      >
        <BarChartCreator
          initialData={formData.barChart}
          onSave={handleChartSave}
          editable={isEditable}
        />
      </DataCreatorModal>
    </div>
  );
};

export default InquiryForm;
