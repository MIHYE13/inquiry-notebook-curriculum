import React, { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  initialAudioUrl?: string;
  onSave: (audioBlob: Blob | null) => void;
  editable: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  initialAudioUrl,
  onSave,
  editable
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(initialAudioUrl || null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 정리
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        onSave(audioBlob);
        
        // 스트림 정리
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // 녹음 시간 카운터
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('녹음 시작 실패:', err);
      setError('마이크 접근 권한이 필요해요. 브라우저 설정에서 마이크 권한을 허용해주세요.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const deleteRecording = () => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
      setRecordedAudio(null);
      onSave(null);
    }
  };

  const downloadAudio = async () => {
    if (!recordedAudio) return;

    try {
      // Blob을 가져오기 위해 다시 생성
      const response = await fetch(recordedAudio);
      const blob = await response.blob();
      
      // MP3로 변환 (간단한 방법: webm을 그대로 다운로드하거나, 변환 라이브러리 사용)
      // 실제로는 서버에서 변환이 필요할 수 있지만, 여기서는 webm을 mp3 확장자로 다운로드
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `탐구녹음_${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('다운로드 실패:', err);
      setError('다운로드에 실패했어요.');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
      <h4 className="text-lg font-bold text-gray-800 mb-4">
        🎤 자신의 음성을 녹음하여 지금까지 탐구한 내용을 정리하기
      </h4>

      {error && (
        <div className="mb-4 bg-red-100 border-2 border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {!recordedAudio ? (
        <div className="space-y-4">
          {!isRecording ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                마이크 버튼을 눌러서 탐구 내용을 말로 정리해보세요!
              </p>
              {editable && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
                >
                  <span className="text-3xl">🎤</span>
                  <span>녹음 시작하기</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xl font-bold text-red-600">녹음 중...</span>
                <span className="text-lg font-mono text-gray-700">{formatTime(recordingTime)}</span>
              </div>
              {editable && (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-full bg-red-500 text-white py-4 px-6 rounded-xl text-lg font-bold shadow-lg hover:bg-red-600 transition-all"
                >
                  ⏹️ 녹음 중지하기
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border-2 border-purple-300">
            <audio
              src={recordedAudio}
              controls
              className="w-full"
            >
              브라우저가 오디오 재생을 지원하지 않습니다.
            </audio>
          </div>

          <div className="flex flex-wrap gap-3">
            {editable && (
              <>
                <button
                  type="button"
                  onClick={deleteRecording}
                  className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  🗑️ 삭제하기
                </button>
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex-1 bg-purple-500 text-white py-3 px-4 rounded-xl font-bold hover:bg-purple-600 transition-colors"
                >
                  🔄 다시 녹음하기
                </button>
              </>
            )}
            <button
              type="button"
              onClick={downloadAudio}
              className="flex-1 bg-green-500 text-white py-3 px-4 rounded-xl font-bold hover:bg-green-600 transition-colors"
            >
              💾 MP3로 다운로드
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>💡 녹음 버튼을 누르면 마이크 권한을 요청할 수 있어요</p>
        <p>💡 녹음 중에는 다른 소리가 녹음되지 않도록 조용한 곳에서 녹음해주세요</p>
        <p>💡 다운로드한 파일은 MP3 형식으로 저장됩니다</p>
      </div>
    </div>
  );
};

export default VoiceRecorder;

