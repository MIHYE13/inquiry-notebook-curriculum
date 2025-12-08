import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import MainScreen from './components/MainScreen';
import TeacherDashboard from './components/TeacherDashboard';
import { getOrCreateStudent } from './utils/firestore';

function App() {
  const [currentStudent, setCurrentStudent] = useState<{
    id: string;
    name: string;
    code: string;
  } | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // localStorage에서 이전 세션 복원 시도
    const savedStudent = localStorage.getItem('currentStudent');
    const savedIsTeacher = localStorage.getItem('isTeacher') === 'true';
    
    if (savedIsTeacher) {
      setIsTeacher(true);
    } else if (savedStudent) {
      try {
        const student = JSON.parse(savedStudent);
        setCurrentStudent(student);
      } catch (e) {
        console.error('세션 복원 실패:', e);
        localStorage.removeItem('currentStudent');
      }
    }
  }, []);

  const handleLogin = async (name: string, code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const student = await getOrCreateStudent(name, code);
      const studentData = {
        id: student.studentId,
        name: student.studentName,
        code: student.studentCode
      };

      setCurrentStudent(studentData);
      localStorage.setItem('currentStudent', JSON.stringify(studentData));
    } catch (error) {
      console.error('로그인 실패:', error);
      setError('접속에 실패했어요. 인터넷 연결을 확인하고 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherLogin = () => {
    setIsTeacher(true);
    setCurrentStudent(null);
    localStorage.setItem('isTeacher', 'true');
    localStorage.removeItem('currentStudent');
  };

  const handleLogout = () => {
    setCurrentStudent(null);
    setIsTeacher(false);
    localStorage.removeItem('currentStudent');
    localStorage.removeItem('isTeacher');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-pink-100 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-gray-800 mb-4">오류가 발생했어요</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setCurrentStudent(null);
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-8 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  if (isTeacher) {
    return <TeacherDashboard onLogout={handleLogout} />;
  }

  if (!currentStudent) {
    return <LoginScreen onLogin={handleLogin} onTeacherLogin={handleTeacherLogin} isLoading={isLoading} />;
  }

  return (
    <MainScreen
      studentId={currentStudent.id}
      studentName={currentStudent.name}
      onLogout={handleLogout}
    />
  );
}

export default App;
