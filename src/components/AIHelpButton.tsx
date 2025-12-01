import React, { useState } from 'react';

interface AIHelpButtonProps {
  label: string;
  icon: string;
  onHelp: () => Promise<string>;
  disabled?: boolean;
}

const AIHelpButton: React.FC<AIHelpButtonProps> = ({ 
  label, 
  icon, 
  onHelp, 
  disabled = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    setResponse(null);
    setShowResponse(false);

    try {
      const result = await onHelp();
      setResponse(result);
      setShowResponse(true);
    } catch (error) {
      setResponse('도움을 받는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
      setShowResponse(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            AI가 생각 중...
          </>
        ) : (
          <>
            <span className="mr-2">{icon}</span>
            {label}
          </>
        )}
      </button>

      {showResponse && response && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center text-amber-800 font-bold text-sm mb-2">
              <span className="text-lg mr-2">🤖</span>
              AI 도움
            </div>
            <button
              onClick={() => setShowResponse(false)}
              className="text-amber-600 hover:text-amber-800 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {response}
          </div>
          <div className="text-xs text-amber-700 bg-amber-100 rounded-lg p-2 mt-2">
            💡 위 내용은 참고용이에요. 그대로 따라 쓰지 말고, 나만의 말로 바꿔서 적어 보세요.
          </div>
        </div>
      )}
    </div>
  );
};

export default AIHelpButton;
