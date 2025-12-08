import React, { useState } from 'react';
import { ScientistNote as ScientistNoteType, InquiryEntry } from '../types';
import { generateScientistNote } from '../api/chatgpt';
import { addAIHelpLog } from '../utils/firestore';

/**
 * 과학자의 노트 컴포넌트
 * 
 * ⚠️ 작동 조건: ChatGPT API 키가 .env 파일에 설정되어 있어야 합니다.
 * - VITE_OPENAI_API_KEY: OpenAI API 키 (필수)
 * - VITE_OPENAI_API_ENDPOINT: API 엔드포인트 (기본값: https://api.openai.com/v1/chat/completions)
 * - VITE_OPENAI_MODEL: 사용할 모델 (기본값: gpt-4o-mini)
 * 
 * 기능:
 * - 유명 과학자(에디슨, 아인슈타인, 퀴리, 다윈, 뉴턴)와 대화형 상호작용
 * - 대화 연속성 유지 (이전 대화 내용 기억)
 * - 탐구 내용에 대한 과학자의 코멘트 및 질문
 * 
 * API 키가 없으면 오류 메시지가 표시됩니다.
 * 자세한 내용은 FEATURE_STATUS.md를 참고하세요.
 */
interface ScientistNoteProps {
  entry: InquiryEntry;
  studentId: string;
  isEditable: boolean;
  onSave: (note: ScientistNoteType) => void;
}

const SCIENTISTS = [
  { name: '에디슨', icon: '💡', description: '발명왕 에디슨' },
  { name: '아인슈타인', icon: '🧠', description: '물리학자 아인슈타인' },
  { name: '퀴리', icon: '🔬', description: '과학자 마리 퀴리' },
  { name: '다윈', icon: '🌿', description: '생물학자 찰스 다윈' },
  { name: '뉴턴', icon: '🍎', description: '물리학자 아이작 뉴턴' }
];

const ScientistNote: React.FC<ScientistNoteProps> = ({
  entry,
  studentId,
  isEditable,
  onSave
}) => {
  const [selectedScientist, setSelectedScientist] = useState<string>('에디슨');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateNote = async () => {
    if (!isEditable) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateScientistNote(selectedScientist, {
        todayTopic: entry.todayTopic,
        questions: entry.questions,
        observations: entry.observations,
        findings: entry.findings,
        methods: entry.methods
      });

      if (result.success && result.data) {
        const scientist = SCIENTISTS.find(s => s.name === selectedScientist);
        const newNote: ScientistNoteType = {
          scientistName: selectedScientist,
          scientistIcon: scientist?.icon || '👨‍🔬',
          messages: [
            {
              role: 'scientist',
              content: result.data,
              timestamp: new Date().toISOString()
            }
          ],
          createdAt: new Date().toISOString()
        };

        await addAIHelpLog(studentId, entry.date, 'chatgpt', {
          field: 'scientistNote',
          prompt: `과학자 ${selectedScientist}의 노트 생성`,
          response: result.data
        });

        onSave(newNote);
      } else {
        setError(result.error || '과학자의 노트를 생성하지 못했어요.');
      }
    } catch (err) {
      console.error('과학자 노트 생성 오류:', err);
      setError('오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddStudentMessage = async (message: string) => {
    if (!isEditable || !entry.scientistNote || !message.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      // 학생 메시지 추가
      const studentMessage = {
        role: 'student' as const,
        content: message.trim(),
        timestamp: new Date().toISOString()
      };

      const updatedNote: ScientistNoteType = {
        ...entry.scientistNote,
        messages: [
          ...entry.scientistNote.messages,
          studentMessage
        ]
      };

      // 먼저 학생 메시지만 저장 (UI 업데이트)
      onSave(updatedNote);

      // 과학자 응답 생성
      const conversationHistory = entry.scientistNote.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const result = await generateScientistNote(
        entry.scientistNote.scientistName,
        {
          todayTopic: entry.todayTopic,
          questions: entry.questions,
          observations: entry.observations,
          findings: entry.findings,
          methods: entry.methods
        },
        [...conversationHistory, { role: 'student' as const, content: message.trim() }]
      );

      if (result.success && result.data) {
        // 과학자 응답 추가
        const finalNote: ScientistNoteType = {
          ...updatedNote,
          messages: [
            ...updatedNote.messages,
            {
              role: 'scientist',
              content: result.data,
              timestamp: new Date().toISOString()
            }
          ]
        };

        await addAIHelpLog(studentId, entry.date, 'chatgpt', {
          field: 'scientistNote',
          prompt: `과학자 ${entry.scientistNote.scientistName}와의 대화: ${message.trim()}`,
          response: result.data
        });

        onSave(finalNote);
      } else {
        setError(result.error || '과학자의 응답을 받지 못했어요.');
        // 학생 메시지는 이미 저장되었으므로 그대로 유지
      }
    } catch (err) {
      console.error('과학자 응답 생성 오류:', err);
      setError('오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (entry.scientistNote) {
    const scientist = SCIENTISTS.find(s => s.name === entry.scientistNote!.scientistName);
    
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-yellow-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{entry.scientistNote.scientistIcon}</span>
          <div>
            <h3 className="text-xl font-black text-gray-800">
              {entry.scientistNote.scientistName}의 노트
            </h3>
            <p className="text-sm text-gray-600">{scientist?.description}</p>
          </div>
        </div>

        {/* 대화 내용 */}
        <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
          {entry.scientistNote.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'scientist' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'scientist'
                    ? 'bg-white border-2 border-yellow-300 text-gray-800'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {msg.role === 'scientist' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{entry.scientistNote!.scientistIcon}</span>
                    <span className="font-bold text-sm">{entry.scientistNote!.scientistName}</span>
                  </div>
                )}
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 학생 메시지 입력 (편집 가능할 때만) */}
        {isEditable && (
          <div className="border-t-2 border-yellow-300 pt-4">
            {isGenerating && (
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                과학자가 답변을 생각하고 있어요...
              </div>
            )}
            {error && (
              <div className="mb-3 bg-red-100 border-2 border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm">
                ⚠️ {error}
              </div>
            )}
            <StudentMessageInput
              onSend={handleAddStudentMessage}
              disabled={isGenerating}
            />
          </div>
        )}

        {isEditable && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => onSave(entry.scientistNote!)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-colors"
            >
              💾 저장
            </button>
            <button
              type="button"
              onClick={() => onSave(undefined as any)}
              className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
            >
              ❌ 삭제
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-yellow-200">
      <h3 className="text-xl font-black text-gray-800 mb-4">
        👨‍🔬 과학자의 노트
      </h3>
      <p className="text-gray-600 mb-4">
        유명한 과학자들이 오늘 탐구한 내용에 대해 코멘트해줄 거예요!
      </p>

      {isEditable ? (
        <div className="space-y-4">
          {/* 과학자 선택 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              어떤 과학자와 대화할까요?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SCIENTISTS.map((scientist) => (
                <button
                  key={scientist.name}
                  type="button"
                  onClick={() => setSelectedScientist(scientist.name)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedScientist === scientist.name
                      ? 'bg-yellow-500 text-white border-yellow-600 shadow-lg'
                      : 'bg-white border-gray-300 hover:border-yellow-400'
                  }`}
                >
                  <div className="text-2xl mb-1">{scientist.icon}</div>
                  <div className="text-sm font-bold">{scientist.name}</div>
                  <div className="text-xs opacity-80">{scientist.description}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerateNote}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-6 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                과학자가 생각 중...
              </span>
            ) : (
              `✨ ${selectedScientist}와 대화 시작하기`
            )}
          </button>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          아직 과학자의 노트가 없어요
        </div>
      )}
    </div>
  );
};

// 학생 메시지 입력 컴포넌트
interface StudentMessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const StudentMessageInput: React.FC<StudentMessageInputProps> = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="과학자에게 질문하거나 이야기해보세요..."
        disabled={disabled}
        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        전송
      </button>
    </form>
  );
};

export default ScientistNote;

