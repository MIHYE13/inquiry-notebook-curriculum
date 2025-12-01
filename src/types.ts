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

export type AIResponse = {
  success: boolean;
  data?: string;
  error?: string;
};
