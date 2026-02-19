
import { Subject } from './types';

export const TOTAL_QUESTIONS = 50;
export const QUIZ_DURATION_SECONDS = 60 * 60; // 60 minutes
export const MARKS_PER_CORRECT = 2;
export const NEGATIVE_MARKING = 0.66;

export const UPSC_INSTRUCTIONS = [
  "Total Duration: 60 Minutes.",
  "Total Questions: 50. All questions are compulsory.",
  "Each question carries 2 marks.",
  "Negative Marking: 0.66 marks will be deducted for each incorrect answer.",
  "No calculator or electronic gadgets allowed.",
  "Ensure a stable internet connection for real-time question generation.",
  "Auto-submit will be triggered when the timer reaches zero.",
  "You can mark questions for review and revisit them later using the side palette."
];

export const SUBJECT_OPTIONS = Object.values(Subject);
