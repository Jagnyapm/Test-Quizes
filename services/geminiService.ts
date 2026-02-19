
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject, QuizResult } from "../types";
import { TOTAL_QUESTIONS } from "../constants";

// Fixed: Correct initialization of GoogleGenAI as per guidelines (must not use non-null assertion if not strictly needed)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuizQuestions = async (subject: Subject): Promise<Question[]> => {
  const prompt = `Generate ${TOTAL_QUESTIONS} UPSC Prelims level Multiple Choice Questions (MCQs) on the subject: ${subject}.
  Each question must have 4 options (A, B, C, D), a correct answer, and a detailed professional explanation.
  Ensure the difficulty level is 'Hard' or 'Competitive'.
  For Current Affairs, focus on news from the last 6 months.
  Return the output strictly as a JSON array.`;

  // Fixed: Ensure use of ai.models.generateContent with model and contents properties
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            text: { type: Type.STRING },
            options: {
              type: Type.OBJECT,
              properties: {
                A: { type: Type.STRING },
                B: { type: Type.STRING },
                C: { type: Type.STRING },
                D: { type: Type.STRING },
              },
              required: ["A", "B", "C", "D"],
            },
            correctAnswer: { type: Type.STRING, description: "A, B, C, or D" },
            explanation: { type: Type.STRING },
            subject: { type: Type.STRING },
          },
          required: ["id", "text", "options", "correctAnswer", "explanation", "subject"],
        },
      },
    },
  });

  try {
    // Fixed: Correctly accessing response.text property (not a method)
    const questions = JSON.parse(response.text || "[]");
    return questions.map((q: any, index: number) => ({ ...q, id: index + 1 }));
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return [];
  }
};

export const getAIPerformanceAnalysis = async (result: QuizResult, subject: Subject): Promise<string> => {
  const prompt = `Act as a senior UPSC mentor. Analyze the following quiz performance for the subject '${subject}':
  Score: ${result.score}/100
  Correct: ${result.correct}
  Wrong: ${result.wrong}
  Accuracy: ${result.accuracy}%
  Time Taken: ${Math.floor(result.timeTaken / 60)} minutes
  
  Provide a professional summary of strong and weak areas, and a personalized study plan for the next 7 days. Use professional yet encouraging tone.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  // Fixed: Correctly accessing response.text property (not a method)
  return response.text || "Unable to generate analysis at this time.";
};
