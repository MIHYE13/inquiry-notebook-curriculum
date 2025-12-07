import React, { useEffect } from 'react';

interface DataCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  saveButtonText?: string;
}

const DataCreatorModal: React.FC<DataCreatorModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  saveButtonText = '저장하기'
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSaveClick = () => {
    if (onSave) {
      onSave();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden mx-4 md:mx-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-4 bg-white border-t border-gray-200 flex flex-col md:flex-row gap-3 md:gap-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full md:w-auto h-12 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-bold text-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200"
          >
            ❌ 취소
          </button>
          {onSave && (
            <button
              type="button"
              onClick={handleSaveClick}
              className="w-full md:w-auto h-12 px-6 rounded-xl bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              💾 {saveButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataCreatorModal;


