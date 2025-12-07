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

export type InquiryEntry = {
  date: string; // 'YYYY-MM-DD'
  todayTopic: string;
  questions: string;
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
  resources: {
    files: { id: string; name: string }[];
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
