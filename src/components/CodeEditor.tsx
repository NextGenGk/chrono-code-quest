
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Clock, Save, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ProblemStatement from './ProblemStatement';
import TestResults from './TestResults';
import { codeTemplates, sampleProblem } from '../utils/codeTemplates';
import { executeCode } from '../utils/codeExecution';

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

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<Language>('python');
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const editorRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const tabFocusRef = useRef(true);

  // Initialize code template when language changes
  useEffect(() => {
    setCode(codeTemplates[language]);
  }, [language]);

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
    }, 30000); // 30 seconds

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 300) return 'text-green-600'; // > 5 minutes
    if (timeLeft > 60) return 'text-yellow-600';  // > 1 minute
    return 'text-red-600'; // < 1 minute
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">DSA Code Editor</h1>
            <Badge variant="secondary">
              {hasSubmitted ? 'Submitted' : 'In Progress'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className={`text-lg font-mono font-semibold ${getTimerColor()}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            {lastSaved && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Save className="w-4 h-4" />
                <span>Saved at {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Statement */}
          <div className="space-y-6">
            <ProblemStatement problem={sampleProblem} />
            {submissionResult && <TestResults result={submissionResult} />}
          </div>

          {/* Code Editor */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Code Editor</CardTitle>
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
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="border rounded-lg overflow-hidden">
                  <Editor
                    height="500px"
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
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card>
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
