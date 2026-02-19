
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  QuizStatus, 
  Question, 
  UserProgress, 
  QuestionStatus, 
  Subject, 
  QuizResult 
} from './types';
import { 
  TOTAL_QUESTIONS, 
  QUIZ_DURATION_SECONDS, 
  SUBJECT_OPTIONS, 
  UPSC_INSTRUCTIONS,
  MARKS_PER_CORRECT,
  NEGATIVE_MARKING
} from './constants';
import { generateQuizQuestions, getAIPerformanceAnalysis } from './services/geminiService';
import Timer from './components/Timer';
import QuestionPalette from './components/QuestionPalette';
import ResultDashboard from './components/ResultDashboard';

const App: React.FC = () => {
  // State
  const [status, setStatus] = useState<QuizStatus>(QuizStatus.IDLE);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.CURRENT_AFFAIRS);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<Record<number, UserProgress>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for tracking
  // Fixed: Replaced NodeJS.Timeout with any to resolve "Cannot find namespace 'NodeJS'" error in browser environments.
  const timerRef = useRef<any>(null);

  // Initialize progress when questions load
  useEffect(() => {
    if (questions.length > 0) {
      const initialProgress: Record<number, UserProgress> = {};
      questions.forEach(q => {
        initialProgress[q.id] = { selectedOption: null, status: QuestionStatus.UNVISITED };
      });
      setProgress(initialProgress);
      setCurrentIndex(0);
    }
  }, [questions]);

  // Timer logic
  useEffect(() => {
    if (status === QuizStatus.ONGOING && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, timeLeft]);

  // Handlers
  const startQuizGeneration = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedQuestions = await generateQuizQuestions(selectedSubject);
      if (fetchedQuestions.length === 0) throw new Error("Could not load questions. Check your API key or connection.");
      setQuestions(fetchedQuestions);
      setStatus(QuizStatus.INSTRUCTIONS);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setStatus(QuizStatus.ONGOING);
    setTimeLeft(QUIZ_DURATION_SECONDS);
  };

  const handleOptionSelect = (option: 'A' | 'B' | 'C' | 'D') => {
    setProgress(prev => ({
      ...prev,
      [questions[currentIndex].id]: {
        ...prev[questions[currentIndex].id],
        selectedOption: option,
        status: QuestionStatus.ANSWERED
      }
    }));
  };

  const handleMarkForReview = () => {
    setProgress(prev => ({
      ...prev,
      [questions[currentIndex].id]: {
        ...prev[questions[currentIndex].id],
        status: QuestionStatus.MARKED_FOR_REVIEW
      }
    }));
    handleNext();
  };

  const handleClearResponse = () => {
    setProgress(prev => ({
      ...prev,
      [questions[currentIndex].id]: {
        ...prev[questions[currentIndex].id],
        selectedOption: null,
        status: QuestionStatus.NOT_ANSWERED
      }
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinalSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Calculate results
    let correct = 0;
    let wrong = 0;
    let answered = 0;

    questions.forEach(q => {
      const userAns = progress[q.id]?.selectedOption;
      if (userAns) {
        answered++;
        if (userAns === q.correctAnswer) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    const unattempted = questions.length - answered;
    const score = (correct * MARKS_PER_CORRECT) - (wrong * NEGATIVE_MARKING);
    const accuracy = answered > 0 ? (correct / answered) * 100 : 0;
    const timeTaken = QUIZ_DURATION_SECONDS - timeLeft;

    const resultObj: QuizResult = {
      totalQuestions: questions.length,
      answered,
      correct,
      wrong,
      unattempted,
      score,
      accuracy,
      timeTaken
    };

    setStatus(QuizStatus.SUBMITTED);
    setResults(resultObj);

    // AI Analysis in background
    try {
      const analysis = await getAIPerformanceAnalysis(resultObj, selectedSubject);
      setResults(prev => prev ? { ...prev, analysis } : null);
    } catch (e) {
      console.error("AI Analysis failed", e);
    }
  };

  const handleRestart = () => {
    setStatus(QuizStatus.IDLE);
    setQuestions([]);
    setResults(null);
    setCurrentIndex(0);
    setProgress({});
  };

  // Render Helpers
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Generating Professional UPSC Quiz</h2>
          <p className="text-slate-400">Gemini is curating questions based on latest trends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col animate-gradient bg-gradient-to-br from-slate-900 via-blue-900 to-black">
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">UA</div>
          <h1 className="text-xl font-bold tracking-tight hidden md:block">UPSC <span className="text-blue-500">ACE</span></h1>
        </div>
        
        {status === QuizStatus.ONGOING && (
          <Timer seconds={timeLeft} onTimeUp={handleFinalSubmit} />
        )}

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-xs text-slate-400 uppercase font-semibold">Live Simulation</span>
            <span className="text-sm font-medium text-blue-400">Exam Mode</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
             <img src="https://picsum.photos/40" alt="avatar" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        
        {/* State: Welcome/Subject Selection */}
        {status === QuizStatus.IDLE && (
          <div className="max-w-4xl mx-auto space-y-12 py-12">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Premium Exam Simulation
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Test your knowledge with real-time AI-generated questions designed to match UPSC Prelims difficulty standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-8 rounded-3xl space-y-6">
                <h3 className="text-xl font-bold border-b border-slate-700 pb-4">Select Your Focus Area</h3>
                <div className="grid grid-cols-1 gap-3">
                  {SUBJECT_OPTIONS.map(sub => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      className={`p-4 rounded-2xl text-left border-2 transition-all duration-200 ${
                        selectedSubject === sub 
                          ? 'bg-blue-600/20 border-blue-500 text-blue-100 shadow-lg shadow-blue-500/10' 
                          : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <div className="font-bold">{sub}</div>
                      <div className="text-xs opacity-70">UPSC Prelims Pattern - 50 Questions</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-8 rounded-3xl h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Exam Specifications</h3>
                    <ul className="space-y-4">
                      <li className="flex items-center text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
                        50 Multiple Choice Questions
                      </li>
                      <li className="flex items-center text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
                        60 Minutes Duration
                      </li>
                      <li className="flex items-center text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
                        +2.00 / -0.66 Marking Scheme
                      </li>
                      <li className="flex items-center text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
                        Real-time Gemini Current Affairs
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={startQuizGeneration}
                    className="mt-8 w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-3"
                  >
                    <span>PREPARE TEST</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-200 text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {/* State: Instructions */}
        {status === QuizStatus.INSTRUCTIONS && (
          <div className="max-w-4xl mx-auto py-12">
            <div className="glass-card rounded-3xl p-10 space-y-8">
              <div className="border-b border-slate-700 pb-6 text-center">
                <h2 className="text-3xl font-black text-white">General Instructions</h2>
                <p className="text-slate-400 mt-2">Subject: {selectedSubject}</p>
              </div>
              
              <div className="space-y-4">
                {UPSC_INSTRUCTIONS.map((instr, i) => (
                  <div key={i} className="flex items-start space-x-4 p-3 rounded-xl bg-slate-800/30">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <p className="text-slate-300 text-sm leading-relaxed">{instr}</p>
                  </div>
                ))}
              </div>

              <div className="pt-6 flex justify-center">
                <button
                  onClick={handleStartQuiz}
                  className="px-12 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xl rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  START SIMULATION
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State: Ongoing Quiz */}
        {status === QuizStatus.ONGOING && questions.length > 0 && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
            
            {/* Left: Question Area */}
            <div className="lg:col-span-3 space-y-6">
              <div className="glass-card rounded-3xl p-8 min-h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700/50">
                  <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</span>
                  <div className="flex space-x-2">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20 uppercase tracking-tighter">+2 Marks</span>
                    <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-bold rounded-full border border-rose-500/20 uppercase tracking-tighter">-0.66 Marks</span>
                  </div>
                </div>

                <div className="flex-1 space-y-8">
                  <h3 className="text-xl md:text-2xl font-medium leading-relaxed text-slate-100">
                    {questions[currentIndex].text}
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(questions[currentIndex].options).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => handleOptionSelect(key as any)}
                        className={`group relative flex items-center p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                          progress[questions[currentIndex].id]?.selectedOption === key
                            ? 'bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/20'
                            : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg mr-4 transition-colors ${
                          progress[questions[currentIndex].id]?.selectedOption === key
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-slate-200'
                        }`}>
                          {key}
                        </span>
                        <span className={`text-base font-medium ${
                          progress[questions[currentIndex].id]?.selectedOption === key ? 'text-blue-100' : 'text-slate-300'
                        }`}>
                          {val}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-700/50 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex space-x-3">
                    <button
                      onClick={handleMarkForReview}
                      className="px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-sm rounded-xl border border-amber-500/30 transition-colors"
                    >
                      Mark for Review
                    </button>
                    <button
                      onClick={handleClearResponse}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-sm rounded-xl border border-slate-700 transition-colors"
                    >
                      Clear Response
                    </button>
                  </div>

                  <div className="flex space-x-3 ml-auto">
                    <button
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="px-6 py-3 bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition-colors"
                    >
                      Previous
                    </button>
                    {currentIndex === questions.length - 1 ? (
                      <button
                        onClick={handleFinalSubmit}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                      >
                        Final Submit
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                      >
                        Save & Next
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Question Palette */}
            <div className="lg:col-span-1 hidden lg:block">
              <QuestionPalette 
                totalQuestions={questions.length} 
                currentIndex={currentIndex} 
                progress={progress} 
                onNavigate={setCurrentIndex} 
              />
            </div>

            {/* Mobile Nav Palette Toggle would go here - simplified for this demo */}
          </div>
        )}

        {/* State: Results */}
        {status === QuizStatus.SUBMITTED && results && (
          <ResultDashboard 
            result={results} 
            subject={selectedSubject} 
            onRestart={handleRestart} 
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="py-6 px-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs gap-4">
        <div className="flex items-center space-x-6">
          <span>&copy; 2024 UPSC Ace AI Simulator</span>
          <a href="#" className="hover:text-blue-400">Privacy Policy</a>
          <a href="#" className="hover:text-blue-400">Terms of Service</a>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Powered by Gemini 3.0 Flash Preview</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
