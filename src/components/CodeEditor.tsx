
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Play, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ProblemStatement from './ProblemStatement';
import TestResults from './TestResults';
import AdminQuestionForm from './admin/AdminQuestionForm';
import Header from './layout/Header';
import { codeTemplates, sampleProblem } from '../utils/codeTemplates';
import { executeCode } from '../utils/codeExecution';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Language = 'python' | 'java' | 'cpp' | 'javascript';

interface SubmissionResult {
  status: 'success' | 'error';
  executionTime: string;
  memoryUsed: string;
  testCasesPassed: string;
  failedTestCases: any[];
  errorMessage: string;
  suggestions: string;
}

interface Problem {
  id?: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: string;
  memoryLimit: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
}

const CodeEditor: React.FC = () => {
  const { isAdmin } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<Language>('python');
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem>(sampleProblem);
  const [questions, setQuestions] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const editorRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const tabFocusRef = useRef(true);

  // Load questions from database
  const loadQuestions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuestions = data?.map(q => ({
        id: q.id,
        title: q.title,
        difficulty: q.difficulty as 'Easy' | 'Medium' | 'Hard',
        timeLimit: q.time_limit,
        memoryLimit: q.memory_limit,
        description: q.description,
        examples: Array.isArray(q.examples) ? q.examples : [],
        constraints: Array.isArray(q.constraints) ? q.constraints : []
      })) || [];

      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions from database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Initialize code template when language changes
  useEffect(() => {
    setCode(codeTemplates[language]);
  }, [language]);

  // Reset submission state when problem changes
  useEffect(() => {
    setHasSubmitted(false);
    setSubmissionResult(null);
    setTimeLeft(30 * 60);
  }, [currentProblem]);

  // Timer functionality
  useEffect(() => {
    if (timeLeft > 0 && !hasSubmitted) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !hasSubmitted) {
      handleAutoSubmit('Timer expired');
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, hasSubmitted]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }
    
    autoSaveRef.current = setTimeout(() => {
      handleAutoSave();
    }, 30000);

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [code]);

  // Tab focus detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !hasSubmitted) {
        tabFocusRef.current = false;
        handleAutoSubmit('Tab switched or window lost focus');
      } else {
        tabFocusRef.current = true;
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasSubmitted) {
        handleAutoSubmit('Browser tab closing');
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasSubmitted]);

  const handleAutoSave = useCallback(() => {
    if (code.trim()) {
      localStorage.setItem(`code_${language}`, code);
      setLastSaved(new Date());
      console.log('Code auto-saved');
    }
  }, [code, language]);

  const handleAutoSubmit = useCallback(async (reason: string) => {
    if (hasSubmitted) return;
    
    console.log('Auto-submitting code due to:', reason);
    toast({
      title: "Auto-submission triggered",
      description: reason,
      variant: "default",
    });
    
    await handleSubmission(true);
  }, [hasSubmitted, code, language]);

  const handleSubmission = async (isAutoSubmit = false) => {
    if (hasSubmitted && !isAutoSubmit) return;
    
    setIsSubmitting(true);
    setHasSubmitted(true);
    
    try {
      const result = await executeCode(code, language);
      setSubmissionResult(result);
      
      toast({
        title: result.status === 'success' ? "Submission successful!" : "Submission failed",
        description: result.status === 'success' 
          ? `Passed ${result.testCasesPassed} test cases` 
          : result.errorMessage,
        variant: result.status === 'success' ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Submission error",
        description: "Failed to submit code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddQuestion = () => {
    loadQuestions();
    setShowAddQuestion(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading questions...</div>
      </div>
    );
  }

  if (showAddQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <AdminQuestionForm
            onQuestionAdded={handleAddQuestion}
            onCancel={() => setShowAddQuestion(false)}
          />
        </div>
      </div>
    );
  }

  const allProblems = [sampleProblem, ...questions];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header
          timeLeft={timeLeft}
          lastSaved={lastSaved}
          hasSubmitted={hasSubmitted}
          onAddQuestion={isAdmin ? () => setShowAddQuestion(true) : undefined}
        />

        {/* Problem Selection */}
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Select Problem:</label>
            <Select
              value={currentProblem.title}
              onValueChange={(title) => {
                const problem = allProblems.find(p => p.title === title);
                if (problem) setCurrentProblem(problem);
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allProblems.map((problem, index) => (
                  <SelectItem key={problem.id || index} value={problem.title}>
                    {problem.title} ({problem.difficulty})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-240px)] rounded-lg border bg-white"
        >
          {/* Left Panel - Problem Statement */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-auto p-6">
                <ProblemStatement problem={currentProblem} />
                {submissionResult && (
                  <div className="mt-6">
                    <TestResults result={submissionResult} />
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Code Editor */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Code Editor</h3>
                  <div className="flex items-center space-x-4">
                    <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={() => handleSubmission(false)}
                      disabled={isSubmitting || hasSubmitted}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : hasSubmitted ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Submitted
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Submit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={language === 'cpp' ? 'cpp' : language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={(editor) => {
                    editorRef.current = editor;
                  }}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    renderLineHighlight: 'all',
                    selectOnLineNumbers: true,
                    readOnly: hasSubmitted,
                  }}
                />
              </div>

              {/* Status Information */}
              <div className="p-4 border-t bg-gray-50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      hasSubmitted ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <span>Status: {hasSubmitted ? 'Submitted' : 'In Progress'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      tabFocusRef.current ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span>Focus: {tabFocusRef.current ? 'Active' : 'Inactive'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Language: {language.toUpperCase()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Auto-save: Active</span>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default CodeEditor;
