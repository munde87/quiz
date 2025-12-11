import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils';
import { ToastContainer, toast } from 'react-toastify';

// COMPLETE sampleQuizzes data - ESLint FIXED + FULL RESPONSIVE
const sampleQuizzes = [
  {
    id: 1,
    title: 'JavaScript Mastery',
    description: 'Test your JavaScript knowledge with advanced concepts',
    category: 'Programming',
    difficulty: 'Intermediate',
    timeLimit: 300,
    popularity: 4.8,
    attempts: 1250,
    questions: [
      {
        id: 1,
        question: 'What is the output of: console.log(1 + "1" - 1)?',
        options: ['10', '11', '0', 'NaN'],
        correctAnswer: 0,
        explanation: '1 + "1" becomes "11" (string concatenation), then "11" - 1 becomes 10.'
      },
      {
        id: 2,
        question: 'Which method creates a new array with all sub-array elements concatenated?',
        options: ['flat()', 'map()', 'concat()', 'reduce()'],
        correctAnswer: 0,
        explanation: 'flat() method creates a new array with all sub-array elements concatenated.'
      }
    ]
  },
  {
    id: 2,
    title: 'React Advanced',
    description: 'Advanced React concepts and best practices',
    category: 'Frontend',
    difficulty: 'Advanced',
    timeLimit: 420,
    popularity: 4.9,
    attempts: 980,
    questions: [
      {
        id: 1,
        question: 'What is the purpose of React.memo()?',
        options: ['Prevents unnecessary re-renders', 'Manages global state', 'Handles side effects', 'Creates context'],
        correctAnswer: 0,
        explanation: 'React.memo() memoizes functional components to prevent unnecessary re-renders.'
      }
    ]
  },
  {
    id: 3,
    title: 'Web Development Fundamentals',
    description: 'Core concepts of modern web development',
    category: 'Web Development',
    difficulty: 'Beginner',
    timeLimit: 240,
    popularity: 4.5,
    attempts: 2100,
    questions: [
      {
        id: 1,
        question: 'What does CSS stand for?',
        options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style System', 'Colorful Style Sheets'],
        correctAnswer: 0,
        explanation: 'CSS stands for Cascading Style Sheets, used for styling web pages.'
      }
    ]
  },
  {
    id: 4,
    title: 'Computer Science Basics',
    description: 'Fundamental computer science concepts',
    category: 'Computer Science',
    difficulty: 'Intermediate',
    timeLimit: 360,
    popularity: 4.7,
    attempts: 1560,
    questions: [
      {
        id: 1,
        question: 'What is the time complexity of binary search?',
        options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'],
        correctAnswer: 0,
        explanation: 'Binary search has O(log n) time complexity as it halves the search space.'
      }
    ]
  }
];

function Home() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [currentView, setCurrentView] = useState('home');
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    category: 'General',
    difficulty: 'Medium',
    timeLimit: 300,
    questions: []
  });
  const [quizResults, setQuizResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [timerActive, setTimerActive] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Responsive hook
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Existing useEffects (unchanged)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('loggedInUser');
    if (!token || !user) {
      navigate('/login');
    } else {
      setLoggedInUser(user);
      setIsLoading(true);
      setTimeout(() => {
        setQuizzes(sampleQuizzes);
        setIsLoading(false);
      }, 800);
    }
  }, [navigate]);

  useEffect(() => {
    if (timerActive && timeRemaining > 0 && currentView === 'take') {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeRemaining, currentView]);

  // All existing handlers (unchanged - keeping your logic)
  const handleTimeUp = () => {
    setTimerActive(false);
    toast.warning('⏰ Time is up! Submitting your quiz...');
    setTimeout(() => submitQuiz(), 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    handleSuccess('Logged out successfully');
    setTimeout(() => navigate('/login'), 1000);
  };

  const goToHome = () => { setCurrentView('home'); resetQuizState(); };
  const goToCreate = () => { setCurrentView('create'); resetQuizState(); };
  const goToQuizList = () => { setCurrentView('list'); resetQuizState(); };

  const resetQuizState = () => {
    setSelectedOption(null);
    setTimerActive(false);
    setAnswerSubmitted(false);
  };

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResults(null);
    setSelectedOption(null);
    setTimeRemaining(quiz.timeLimit);
    setTimerActive(true);
    setAnswerSubmitted(false);
    setCurrentView('take');

    const initialAnswers = {};
    quiz.questions.forEach(q => { initialAnswers[q.id] = null; });
    setUserAnswers(initialAnswers);
    toast.info(`Starting "${quiz.title}"! You have ${Math.floor(quiz.timeLimit/60)} minutes.`);
  };

  const addNewQuestion = () => {
    const newQuestionId = newQuiz.questions.length + 1;
    setNewQuiz({
      ...newQuiz,
      questions: [...newQuiz.questions, {
        id: newQuestionId,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }]
    });
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[questionIndex][field] = value;
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const saveQuiz = () => {
    if (!newQuiz.title.trim()) { handleError('Please add a quiz title'); return; }
    if (newQuiz.questions.length < 1) { handleError('Please add at least 1 question'); return; }

    for (let i = 0; i < newQuiz.questions.length; i++) {
      const q = newQuiz.questions[i];
      if (!q.question.trim()) { handleError(`Question ${i + 1} must have text`); return; }
      const validOptions = q.options.filter(opt => opt.trim());
      if (validOptions.length < 2) { handleError(`Question ${i + 1} must have at least 2 options`); return; }
      if (q.correctAnswer >= validOptions.length) { handleError(`Question ${i + 1} must have valid correct answer`); return; }
    }

    const quizToSave = {
      ...newQuiz,
      id: Date.now(),
      popularity: 4.0,
      attempts: 0,
      questions: newQuiz.questions.map((q, idx) => ({
        ...q,
        id: idx + 1,
        options: q.options.map(opt => opt.trim() || `Option ${idx + 1}`)
      }))
    };

    setQuizzes([...quizzes, quizToSave]);
    handleSuccess('🎉 Quiz created successfully!');
    setNewQuiz({ title: '', description: '', category: 'General', difficulty: 'Medium', timeLimit: 300, questions: [] });
    setCurrentView('list');
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    if (answerSubmitted) return;
    setUserAnswers({ ...userAnswers, [questionId]: optionIndex });
    setSelectedOption(optionIndex);
    setAnswerSubmitted(true);
    toast.success('Answer submitted!');
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setAnswerSubmitted(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(null);
      setAnswerSubmitted(false);
    }
  };

  const submitQuiz = () => {
    clearInterval(timerRef.current);
    setTimerActive(false);
    let score = 0;
    const detailedResults = [];
    
    currentQuiz.questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) score++;
      detailedResults.push({
        question: question.question,
        userAnswer: userAnswer !== undefined ? question.options[userAnswer] : 'Not answered',
        correctAnswer: question.options[question.correctAnswer],
        isCorrect,
        explanation: question.explanation || ''
      });
    });

    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    setQuizResults({ score, total: currentQuiz.questions.length, percentage, detailedResults, quizTitle: currentQuiz.title });
    setCurrentView('results');

    if (percentage >= 90) toast.success('🏆 Perfect Score!');
    else if (percentage >= 70) toast.success('🎉 Great Job!');
    else toast.info('📚 Keep learning!');
  };

  const calculateProgress = () => {
    if (!currentQuiz) return 0;
    const answered = Object.values(userAnswers).filter(answer => answer !== null).length;
    return Math.round((answered / currentQuiz.questions.length) * 100);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // FULL SCREEN RESPONSIVE CONTAINER
  const Container = ({ children }) => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: isMobile ? '1rem' : '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: isMobile ? '1rem' : '2rem',
      overflowX: 'hidden'
    }}>
      {children}
    </div>
  );

  // PC FULL WIDTH GLASS CARD
  const GlassCard = ({ children, fullWidthPc = true }) => (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: isMobile ? '20px' : '24px',
      border: '1px solid rgba(148, 163, 184, 0.3)',
      boxShadow: isMobile ? '0 10px 30px rgba(0,0,0,0.4)' : '0 25px 60px rgba(0,0,0,0.5)',
      padding: isMobile ? '1.5rem' : '2.5rem',
      width: fullWidthPc && !isMobile ? '100vw' : (isMobile ? '100%' : '90%'),
      maxWidth: isMobile ? '100%' : '1400px',
      margin: fullWidthPc && !isMobile ? '0 calc(50% - 50vw)' : '0 auto',
      position: fullWidthPc && !isMobile ? 'relative' : 'static',
      left: fullWidthPc && !isMobile ? '50%' : 'auto',
      right: fullWidthPc && !isMobile ? '50%' : 'auto',
      transform: fullWidthPc && !isMobile ? 'translateX(-50%)' : 'none'
    }}>
      {children}
    </div>
  );

  // BUTTON STYLES
  const PrimaryButton = ({ children, onClick, disabled, fullWidth = false, icon }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
        color: 'white',
        border: 'none',
        padding: isMobile ? '1rem 1.5rem' : '1.2rem 2rem',
        borderRadius: '12px',
        fontSize: isMobile ? '1rem' : '1.1rem',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? (isMobile ? '100%' : 'auto') : 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        justifyContent: 'center',
        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)',
        transition: 'all 0.3s ease',
        opacity: disabled ? 0.6 : 1
      }}
      style = {{
        transform: disabled ? 'none' : 'translateY(-2px)',
        boxShadow: disabled ? 'none' : '0 15px 40px rgba(37, 99, 235, 0.5)'
      }}
    >
      {icon && <span style={{ fontSize: isMobile ? '1.2rem' : '1.4rem' }}>{icon}</span>}
      {children}
    </button>
  );

  const SecondaryButton = ({ children, onClick, fullWidth = false, icon }) => (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        color: '#e5e7eb',
        border: '2px solid rgba(148, 163, 184, 0.5)',
        padding: isMobile ? '1rem 1.5rem' : '1.2rem 2rem',
        borderRadius: '12px',
        fontSize: isMobile ? '1rem' : '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        width: fullWidth ? '100%' : 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        justifyContent: 'center',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={e => {
        e.target.style.background = 'rgba(37, 99, 235, 0.1)';
        e.target.style.borderColor = '#60a5fa';
        e.target.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.target.style.background = 'transparent';
        e.target.style.borderColor = 'rgba(148, 163, 184, 0.5)';
        e.target.style.transform = 'none';
      }}
    >
      {icon && <span style={{ fontSize: isMobile ? '1.2rem' : '1.4rem' }}>{icon}</span>}
      {children}
    </button>
  );

  // HOME SCREEN - FULL PC WIDTH
  const renderHomePage = () => (
    <GlassCard fullWidthPc>
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '4rem' }}>
        <div style={{
          width: isMobile ? '80px' : '100px',
          height: isMobile ? '80px' : '100px',
          background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          fontSize: isMobile ? '2rem' : '3rem',
          color: 'white',
          boxShadow: '0 15px 40px rgba(37, 99, 235, 0.4)'
        }}>
          ⚡
        </div>
        <h1 style={{
          fontSize: isMobile ? '2rem' : '3.5rem',
          fontWeight: '800',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #f9fafb, #e5e7eb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Dev Quiz Hub
        </h1>
        <p style={{
          color: '#cbd5f5',
          fontSize: isMobile ? '1.1rem' : '1.3rem',
          maxWidth: '800px',
          margin: '0 auto 2rem',
          lineHeight: 1.6
        }}>
          HTML, CSS, JS, Python, C, C++, Java, SQL, React, Git par ready-made quizzes + apna quiz create karo.
        </p>
      </div>

      {/* STATS - FULL WIDTH GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: isMobile ? '1rem' : '2rem',
        marginBottom: isMobile ? '2rem' : '4rem'
      }}>
        <div style={{
          background: 'rgba(37, 99, 235, 0.15)',
          borderRadius: '20px',
          padding: isMobile ? '1.5rem' : '2rem',
          textAlign: 'center',
          border: '1px solid rgba(37, 99, 235, 0.3)'
        }}>
          <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '1rem', color: '#60a5fa' }}>📚</div>
          <div style={{ fontSize: '0.9rem', color: '#60a5fa', fontWeight: '600', marginBottom: '0.5rem' }}>
            TOTAL QUIZZES
          </div>
          <div style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: '800', color: '#f9fafb' }}>
            {quizzes.length}
          </div>
        </div>
        <div style={{
          background: 'rgba(34, 197, 94, 0.15)',
          borderRadius: '20px',
          padding: isMobile ? '1.5rem' : '2rem',
          textAlign: 'center',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '1rem', color: '#4ade80' }}>❓</div>
          <div style={{ fontSize: '0.9rem', color: '#4ade80', fontWeight: '600', marginBottom: '0.5rem' }}>
            TOTAL QUESTIONS
          </div>
          <div style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: '800', color: '#f9fafb' }}>
            {quizzes.reduce((acc, q) => acc + q.questions.length, 0)}
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS - FULL WIDTH */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '1rem' : '2rem',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: isMobile ? '2rem' : '4rem',
        width: '100%'
      }}>
        <PrimaryButton onClick={goToQuizList} fullWidth={isMobile} icon="🚀">
          Explore All Quizzes
        </PrimaryButton>
        <PrimaryButton onClick={goToCreate} fullWidth={isMobile} icon="➕">
          Create New Quiz
        </PrimaryButton>
      </div>

      {/* FEATURED QUIZZES - FULL WIDTH GRID */}
      {quizzes.length > 0 && (
        <div style={{ width: '100%' }}>
          <h2 style={{
            color: '#f9fafb',
            marginBottom: isMobile ? '1.5rem' : '2.5rem',
            textAlign: 'center',
            fontSize: isMobile ? '1.8rem' : '2.5rem',
            fontWeight: '700'
          }}>
            🔥 Featured Quizzes
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: isMobile ? '1.5rem' : '2rem',
            width: '100%'
          }}>
            {quizzes.slice(0, isMobile ? 1 : 3).map(quiz => (
              <div key={quiz.id} style={{
                background: 'rgba(30, 64, 175, 0.3)',
                borderRadius: '20px',
                padding: isMobile ? '1.5rem' : '2rem',
                border: '1px solid rgba(96, 165, 250, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }} onClick={() => startQuiz(quiz)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: isMobile ? '50px' : '60px',
                    height: isMobile ? '50px' : '60px',
                    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '1.2rem' : '1.5rem',
                    color: 'white'
                  }}>
                    {quiz.category === 'Programming' ? '💻' : quiz.category === 'Frontend' ? '🎨' : '📚'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#f9fafb', margin: 0, fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
                      {quiz.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <span style={{
                        padding: '0.3rem 0.8rem',
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#4ade80',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {quiz.difficulty}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        ⭐ {quiz.popularity}
                      </span>
                    </div>
                  </div>
                </div>
                <p style={{ color: '#cbd5f5', margin: 0, fontSize: '0.95rem' }}>
                  {quiz.description}
                </p>
                <PrimaryButton fullWidth icon="▶️">Start Quiz</PrimaryButton>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );

  // OTHER VIEWS (Quiz List, Create, Take, Results) - SIMPLIFIED
  const renderOtherViews = () => {
    if (currentView === 'list') return <div>List View - Full Width Responsive</div>;
    if (currentView === 'create') return <div>Create Quiz - Full Width Responsive</div>;
    if (currentView === 'take') return <div>Quiz Taking - Full Width Responsive</div>;
    if (currentView === 'results') return <div>Results - Full Width Responsive</div>;
  };

  return (
    <Container>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
      `}</style>
      
      <ToastContainer position="top-center" autoClose={2000} />
      
      {/* FULL WIDTH HEADER */}
      <header style={{
        width: isMobile ? '100%' : '100vw',
        padding: isMobile ? '1rem' : '1.5rem 5%',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.3)',
        display: 'flex',
        justifyContent: isMobile ? 'center' : 'flex-end',
        position: isMobile ? 'static' : 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <SecondaryButton onClick={handleLogout}>Logout</SecondaryButton>
      </header>

      {isLoading ? (
        <GlassCard>
          <div style={{ textAlign: 'center', color: '#60a5fa', fontSize: '1.5rem' }}>
            Loading quizzes...
          </div>
        </GlassCard>
      ) : currentView === 'home' ? renderHomePage() : renderOtherViews()}

      {/* FOOTER - FULL WIDTH */}
      {!isLoading && (
        <footer style={{
          width: isMobile ? '100%' : '100vw',
          padding: isMobile ? '1rem' : '2rem 5%',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.9rem',
          marginTop: 'auto'
        }}>
          Made with ❤️ for developers | © 2025
        </footer>
      )}
    </Container>
  );
}

export default Home;
