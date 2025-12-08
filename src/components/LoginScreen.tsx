import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (name: string, code: string) => void;
  onTeacherLogin?: () => void;
  isLoading?: boolean;
}

const TEACHER_CODE = 'cheongdam2025';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onTeacherLogin, isLoading = false }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (!code.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    // 교사 인증번호 체크
    if (code.trim() === TEACHER_CODE && onTeacherLogin) {
      setError('');
      onTeacherLogin();
      return;
    }

    setError('');
    onLogin(name.trim(), code.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce">🔬</div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-3">
            온라인 탐구 성장 노트
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            과학 탐구의 모든 과정을 기록해보세요!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-lg font-bold text-gray-700 mb-2">
              이름
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-xl border-3 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 transition-all"
              placeholder="홍길동"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-lg font-bold text-gray-700 mb-2">
              비밀번호 {onTeacherLogin && <span className="text-sm text-gray-500 font-normal">(교사는 인증번호 입력)</span>}
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 text-xl border-3 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 transition-all"
              placeholder={onTeacherLogin ? "학생: 1234 / 교사: 인증번호" : "1234"}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl text-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                접속 중...
              </span>
            ) : (
              '시작하기 🚀'
            )}
          </button>
        </form>

        <div className="mt-6 bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-4">
          <p className="text-sm text-gray-700 text-center leading-relaxed">
            💡 처음 사용하는 경우, 원하는 이름과 비밀번호를 입력하면 자동으로 새 노트가 만들어져요!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
