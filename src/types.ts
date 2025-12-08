export type TableCell = {
  value: string;
  isHeader: boolean;
};

export type DataTable = {
  id: string;
  title: string;
  rows: number;
  cols: number;
  data: TableCell[][];
  createdAt: string;
};

export type ChartDataPoint = {
  label: string;
  value: number;
};

export type BarChartData = {
  id: string;
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  data: ChartDataPoint[];
  color: string;
  createdAt: string;
};

export type ScientistNote = {
  scientistName: string;
  scientistIcon: string;
  messages: {
    role: 'scientist' | 'student';
    content: string;
    timestamp: string;
  }[];
  createdAt: string;
};

export type MindMapNode = {
  id: string;
  text: string;
  x: number;
  y: number;
  children?: MindMapNode[];
};

export type InquiryEntry = {
  date: string; // 'YYYY-MM-DD'
  todayTopic: string;
  questions: string;
  // 마인드맵 데이터 (questions 대신 사용 가능)
  mindMapNodes?: MindMapNode[];
  observations: string;
  priorKnowledge: string;
  groupQuestion: string;
  methods: string;
  findings: string;
  reflectionText: string;
  reflectionDrawingDataUrl?: string;
  // 선택한 진도표 차시 정보 (있을 수도, 없을 수도 있음)
  selectedLessonInfo?: {
    curriculumName: string; // 예: 4-1 과학 / 4-2 과학
    unit: string;           // 단원명
    period: number;         // 차시 번호
    topic: string;          // 학습 주제
  };
  // 표/그래프 데이터
  dataTable?: DataTable;
  barChart?: BarChartData;
  // 과학자의 노트
  scientistNote?: ScientistNote;
  // 음성 녹음 데이터 (base64 인코딩된 오디오)
  voiceRecording?: {
    audioData: string; // base64 인코딩된 오디오 데이터
    mimeType: string;  // audio/webm 등
    duration?: number; // 녹음 시간 (초)
    createdAt: string;
  };
  resources: {
    files: { 
      id: string; 
      name: string;
      type?: string; // MIME type (image/jpeg, application/pdf 등)
      dataUrl?: string; // base64 인코딩된 파일 데이터 (미리보기용)
      size?: number; // 파일 크기 (bytes)
    }[];
    links: { id: string; url: string; description?: string }[];
  };
  aiHelpLogs?: {
    chatgpt?: { field: string; prompt: string; response: string; createdAt: string }[];
    perplexity?: { purpose: string; query: string; response: string; createdAt: string }[];
  };
};

export type StudentNotebook = {
  studentId: string;
  studentName: string;
  studentCode: string;
  createdAt: string;
  lastModified: string;
};

export type AIHelpType = 'topic' | 'studentQuestions' | 'groupQuestion' | 'reflection';
export type PerplexityPurpose = 'background' | 'method' | 'comparison';

// 진도표 타입
export type CurriculumLesson = {
  id: string;
  unit: string;
  topic: string;
  period: number;
  keywords: string[];
  learningGoals?: string;
  order: number;
};

export type Curriculum = {
  id: string;
  name: string;
  grade: string;
  subject: string;
  semester: string;
  createdAt: string;
  createdBy: string;
  lessons: CurriculumLesson[];
};

export type AIResponse = {
  success: boolean;
  data?: string;
  error?: string;
};
