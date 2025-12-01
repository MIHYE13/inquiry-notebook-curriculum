import React from 'react';
import { InquiryEntry } from '../types';

interface EntryListProps {
  entries: InquiryEntry[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const EntryList: React.FC<EntryListProps> = ({ entries, selectedDate, onSelectDate }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-gray-600 leading-relaxed">
          아직 작성한 기록이 없어요.<br />
          오늘부터 탐구를 시작해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(entry => (
        <button
          key={entry.date}
          onClick={() => onSelectDate(entry.date)}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
            selectedDate === entry.date
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-600 shadow-lg'
              : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md'
          }`}
        >
          <div className="font-bold text-sm mb-2">
            📅 {entry.date}
          </div>
          <div className={`font-bold mb-1 ${selectedDate === entry.date ? 'text-white' : 'text-gray-800'}`}>
            {entry.todayTopic || '(주제 없음)'}
          </div>
          {entry.todayTopic && entry.questions && (
            <div className={`text-sm line-clamp-2 ${selectedDate === entry.date ? 'text-blue-100' : 'text-gray-600'}`}>
              {entry.questions.substring(0, 60)}
              {entry.questions.length > 60 ? '...' : ''}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default EntryList;
