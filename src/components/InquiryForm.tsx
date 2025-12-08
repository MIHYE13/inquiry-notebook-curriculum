import React, { useState, useEffect } from 'react';
import { InquiryEntry, Curriculum, CurriculumLesson, DataTable, BarChartData, ScientistNote, MindMapNode } from '../types';
import DrawingCanvas from './DrawingCanvas';
import AIHelpButton from './AIHelpButton';
import CurriculumSelector from './CurriculumSelector';
import DataCreatorModal from './DataCreatorModal';
import DataTableCreator from './DataTableCreator';
import BarChartCreator from './BarChartCreator';
import ScientistNoteComponent from './ScientistNote';
import MindMap from './MindMap';
import VoiceRecorder from './VoiceRecorder';
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

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!isEditable) return;
    
    // 중요한 필드가 변경되었을 때만 자동 저장
    const hasContent = 
      formData.todayTopic.trim() ||
      formData.questions.trim() ||
      formData.observations.trim() ||
      formData.findings.trim() ||
      formData.reflectionText.trim() ||
      formData.mindMapNodes ||
      formData.dataTable ||
      formData.barChart ||
      formData.scientistNote;
    
    if (!hasContent) return;
    
    const timer = setInterval(() => {
      onSave(formData);
    }, 30000); // 30초마다 저장

    return () => clearInterval(timer);
  }, [formData, isEditable, onSave]);

  // URL 정규화 함수
  const normalizeUrl = (url: string): string => {
    if (!url || typeof url !== 'string') return '';
    
    let normalized = url.trim();
    
    // 빈 문자열 체크
    if (!normalized) return '';
    
    // 이미 http:// 또는 https://로 시작하는지 확인
    if (normalized.match(/^https?:\/\//i)) {
      return normalized;
    }
    
    // http:// 또는 https://가 없으면 https:// 추가
    return 'https://' + normalized;
  };

  const handleAddLink = () => {
    if (!newLink.trim()) return;

    const normalizedUrl = normalizeUrl(newLink.trim());
    
    // URL 유효성 검사
    if (!normalizedUrl) {
      alert('유효한 링크 주소를 입력해주세요.');
      return;
    }

    try {
      // URL 객체 생성으로 유효성 검사
      new URL(normalizedUrl);
    } catch {
      alert('유효하지 않은 링크 주소입니다. 올바른 형식으로 입력해주세요. (예: https://example.com)');
      return;
    }

    const newLinkObj = {
      id: Date.now().toString(),
      url: normalizedUrl,
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filePromises = Array.from(files).map((file): Promise<{
      id: string;
      name: string;
      type: string;
      dataUrl?: string;
      size: number;
    }> => {
      return new Promise((resolve) => {
        const id = Date.now().toString() + Math.random();
        const fileType = file.type;
        const fileSize = file.size;

        // 이미지나 PDF 파일인 경우 미리보기 데이터 생성
        if (fileType.startsWith('image/') || fileType === 'application/pdf') {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id,
              name: file.name,
              type: fileType,
              dataUrl: reader.result as string,
              size: fileSize
            });
          };
          reader.onerror = () => {
            resolve({
              id,
              name: file.name,
              type: fileType,
              size: fileSize
            });
          };
          reader.readAsDataURL(file);
        } else {
          // 다른 파일 타입은 이름만 저장
          resolve({
            id,
            name: file.name,
            type: fileType,
            size: fileSize
          });
        }
      });
    });

    const newFiles = await Promise.all(filePromises);

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

  const handleScientistNoteSave = (note: ScientistNote | undefined) => {
    setFormData(prev => ({
      ...prev,
      scientistNote: note
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

      {/* 2. 궁금한 내용 (마인드맵) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-lg font-bold text-gray-700">
            ❓ 궁금한 내용을 마인드맵으로 정리해보세요
          </label>
          {isEditable && formData.todayTopic && (
            <AIHelpButton
              label="질문이 잘 떠오르지 않아요"
              icon="🤔"
              onHelp={handleQuestionsHelp}
              disabled={!isEditable}
            />
          )}
        </div>
        
        <MindMap
          initialData={formData.mindMapNodes}
          onSave={(nodes: MindMapNode[]) => {
            // 마인드맵 노드들을 텍스트로 변환해서 questions에도 저장 (호환성)
            const questionsText = nodes
              .filter(n => n.id !== 'center' && n.id !== nodes[0]?.id)
              .map(n => n.text)
              .join('\n');
            
            setFormData(prev => ({
              ...prev,
              mindMapNodes: nodes,
              questions: questionsText || prev.questions
            }));
          }}
          editable={isEditable}
          placeholder="중앙에 주제를 적고, 주변에 궁금한 내용을 추가해보세요"
        />
        
        {/* 기존 텍스트 입력 (보조용, 선택사항) */}
        {isEditable && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-semibold">
              📝 텍스트로도 입력하기 (선택사항)
            </summary>
            <textarea
              value={formData.questions}
              onChange={(e) => handleChange('questions', e.target.value)}
              className="w-full mt-2 px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 transition-all resize-none"
              rows={3}
              placeholder="마인드맵 대신 텍스트로 입력할 수도 있어요"
            />
          </details>
        )}
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

      {/* 과학자의 노트 */}
      <div className="space-y-4">
        <ScientistNoteComponent
          entry={formData}
          studentId={studentId}
          isEditable={isEditable}
          onSave={handleScientistNoteSave}
        />
      </div>

      {/* 자료 모으기 */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-black text-gray-800">
          📎 탐구와 관련된 자료(사진, 문서, 링크 등)를 추가해 보세요
        </h3>

        {/* 음성 녹음 섹션 */}
        <VoiceRecorder
          initialAudioUrl={formData.voiceRecording ? `data:${formData.voiceRecording.mimeType};base64,${formData.voiceRecording.audioData}` : undefined}
          onSave={async (audioBlob) => {
            if (audioBlob) {
              // Blob을 base64로 변환
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64data = (reader.result as string).split(',')[1];
                setFormData(prev => ({
                  ...prev,
                  voiceRecording: {
                    audioData: base64data,
                    mimeType: audioBlob.type || 'audio/webm;codecs=opus',
                    createdAt: new Date().toISOString()
                  }
                }));
              };
              reader.readAsDataURL(audioBlob);
            } else {
              setFormData(prev => ({
                ...prev,
                voiceRecording: undefined
              }));
            }
          }}
          editable={isEditable}
        />

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
                * 이미지와 PDF 파일은 미리보기로 표시됩니다. 파일 크기는 5MB 이하로 권장합니다.
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
          <div className="space-y-4">
            <h4 className="font-bold text-gray-700">📂 첨부된 파일</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.resources.files.map(file => {
                const isImage = file.type?.startsWith('image/');
                const isPDF = file.type === 'application/pdf';
                
                return (
                  <div
                    key={file.id}
                    className="relative bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                  >
                    {/* 미리보기 */}
                    {isImage && file.dataUrl ? (
                      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={file.dataUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : isPDF && file.dataUrl ? (
                      <div className="aspect-square bg-red-50 flex flex-col items-center justify-center p-4">
                        <div className="text-6xl mb-2">📄</div>
                        <p className="text-xs text-center text-gray-600 font-semibold break-words">
                          PDF 파일
                        </p>
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 flex flex-col items-center justify-center p-4">
                        <div className="text-6xl mb-2">📎</div>
                        <p className="text-xs text-center text-gray-600 font-semibold break-words">
                          {file.name}
                        </p>
                      </div>
                    )}

                    {/* 파일 정보 */}
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-700 truncate" title={file.name}>
                        {file.name}
                      </p>
                      {file.size && (
                        <p className="text-xs text-gray-500 mt-1">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>

                    {/* 삭제 버튼 */}
                    {isEditable && (
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 font-bold text-sm"
                        title="삭제"
                      >
                        ×
                      </button>
                    )}

                    {/* PDF 미리보기 버튼 (PDF인 경우) */}
                    {isPDF && file.dataUrl && (
                      <a
                        href={file.dataUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 left-2 right-2 bg-blue-500 text-white text-xs font-bold py-1 px-2 rounded-lg hover:bg-blue-600 transition-colors text-center"
                      >
                        📖 PDF 보기
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {formData.resources.links.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-gray-700">🔗 저장된 링크</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.resources.links.map(link => {
                // URL 정규화 함수 사용
                const normalizedUrl = normalizeUrl(link.url || '');

                // 유효하지 않은 URL인 경우 처리
                if (!normalizedUrl) {
                  return (
                    <div
                      key={link.id}
                      className="relative bg-white rounded-xl border-2 border-red-200 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl flex-shrink-0">⚠️</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-red-600 text-sm mb-1">
                            유효하지 않은 링크
                          </p>
                          <p className="text-xs text-gray-500 break-words">
                            {link.url || '(링크 없음)'}
                          </p>
                        </div>
                      </div>
                      {isEditable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveLink(link.id);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 font-bold text-sm z-10"
                          title="삭제"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={link.id}
                    className="relative bg-white rounded-xl border-2 border-blue-200 p-4 hover:border-blue-400 hover:shadow-md transition-all group"
                  >
                    <a
                      href={normalizedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block cursor-pointer"
                      onClick={(e) => {
                        // URL이 유효한지 최종 확인
                        try {
                          new URL(normalizedUrl); // URL 유효성 검사
                          // 유효한 URL이면 정상적으로 열림 (기본 동작)
                          console.log('링크 열기:', normalizedUrl);
                        } catch (error) {
                          e.preventDefault();
                          console.error('유효하지 않은 URL:', normalizedUrl, error);
                          alert('유효하지 않은 링크 주소입니다: ' + link.url);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl flex-shrink-0">🌐</div>
                        <div className="flex-1 min-w-0">
                          {link.description ? (
                            <>
                              <p className="font-bold text-gray-800 text-sm mb-1 break-words">
                                {link.description}
                              </p>
                              <p className="text-xs text-gray-500 truncate" title={normalizedUrl}>
                                {normalizedUrl}
                              </p>
                            </>
                          ) : (
                            <p className="font-semibold text-blue-600 text-sm break-words" title={normalizedUrl}>
                              {normalizedUrl}
                            </p>
                          )}
                          <div className="mt-2 text-xs text-blue-500 font-semibold flex items-center gap-1">
                            <span>클릭하여 링크 열기</span>
                            <span>→</span>
                          </div>
                        </div>
                      </div>
                    </a>
                    {isEditable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation(); // 링크 클릭 이벤트 전파 방지
                          handleRemoveLink(link.id);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 font-bold text-sm z-10"
                        title="삭제"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
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
