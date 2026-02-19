
export enum QuizStatus {
  IDLE = 'IDLE',
  INSTRUCTIONS = 'INSTRUCTIONS',
  ONGOING = 'ONGOING',
  SUBMITTED = 'SUBMITTED'
}

export enum QuestionStatus {
  UNVISITED = 'UNVISITED',
  ANSWERED = 'ANSWERED',
  NOT_ANSWERED = 'NOT_ANSWERED',
  MARKED_FOR_REVIEW = 'MARKED_FOR_REVIEW'
}

export enum Subject {
  CURRENT_AFFAIRS = 'Current Affairs',
  HISTORY = 'History',
  GEOGRAPHY = 'Geography',
  POLITY = 'Polity',
  ECONOMY = 'Economy',
  ENVIRONMENT = 'Environment & Ecology',
  SCIENCE_TECH = 'Science & Tech',
  MIXED = 'Mixed Full-Length Test'
}

export interface Question {
  id: number;
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  subject: Subject;
}

export interface UserProgress {
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  status: QuestionStatus;
}

export interface QuizState {
  questions: Question[];
  progress: Record<number, UserProgress>;
  timeLeft: number;
  startTime: number;
  subject: Subject;
}

export interface QuizResult {
  totalQuestions: number;
  answered: number;
  correct: number;
  wrong: number;
  unattempted: number;
  score: number;
  accuracy: number;
  timeTaken: number;
  analysis?: string;
}
