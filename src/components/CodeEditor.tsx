
import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Play, Save, RotateCcw } from 'lucide-react';
import ProblemStatement from './ProblemStatement';
import TestResults from './TestResults';
import ClerkHeader from './layout/ClerkHeader';
import ClerkAdminQuestionForm from './admin/ClerkAdminQuestionForm';
import { useClerkAuth } from '@/contexts/ClerkContext';
import { Problem } from '@/types/Problem';
import { getCodeTemplate } from '@/utils/codeTemplates';

const CodeEditor: React.FC = () => {
  const { isAdmin } = useClerkAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  // Default problem for demo
  const defaultProblem: Problem = {
    title: "Two Sum",
    difficulty: "Easy",
    timeLimit: "30 minutes",
    memoryLimit: "256 MB",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]"
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]"
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ]
  };

  useEffect(() => {
    setProblems([defaultProblem]);
    setSelectedProblem(defaultProblem);
    setCode(getCodeTemplate(language));
  }, []);

  useEffect(() => {
    if (selectedProblem) {
      setCode(getCodeTemplate(language));
    }
  }, [language, selectedProblem]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestResults({
        passed: 2,
        total: 3,
        results: [
          { input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", actual: "[0,1]", passed: true },
          { input: "nums = [3,2,4], target = 6", expected: "[1,2]", actual: "[1,2]", passed: true },
          { input: "nums = [3,3], target = 6", expected: "[0,1]", actual: "[0,1]", passed: false, error: "Time Limit Exceeded" }
        ]
      });
    } catch (error) {
      console.error('Error running code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSave = () => {
    setLastSaved(new Date());
    // Here you would typically save to a backend
    console.log('Code saved:', code);
  };

  const handleReset = () => {
    setCode(getCodeTemplate(language));
    setTestResults(null);
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    handleSave();
    // Here you would typically submit the solution
    console.log('Solution submitted');
  };

  const handleQuestionAdded = (newQuestion: Problem) => {
    const questionWithId = { ...newQuestion, id: Date.now().toString() };
    setProblems(prev => [...prev, questionWithId]);
    setShowAddQuestion(false);
  };

  const currentProblem = selectedProblem || defaultProblem;

  return (
    <div className="h-screen bg-gray-50 p-4">
      <div className="h-full flex flex-col space-y-4">
        <ClerkHeader
          timeLeft={timeLeft}
          lastSaved={lastSaved}
          hasSubmitted={hasSubmitted}
          onAddQuestion={isAdmin ? () => setShowAddQuestion(true) : undefined}
        />

        {showAddQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <ClerkAdminQuestionForm
              onQuestionAdded={handleQuestionAdded}
              onClose={() => setShowAddQuestion(false)}
            />
          </div>
        )}

        <div className="flex-1">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full bg-white rounded-lg p-4 overflow-auto">
                <div className="mb-4">
                  <Select 
                    value={currentProblem.id || "default"} 
                    onValueChange={(value) => {
                      const problem = problems.find(p => p.id === value) || defaultProblem;
                      setSelectedProblem(problem);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a problem" />
                    </SelectTrigger>
                    <SelectContent>
                      {problems.map((problem) => (
                        <SelectItem key={problem.id || "default"} value={problem.id || "default"}>
                          {problem.title} ({problem.difficulty})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ProblemStatement problem={currentProblem} />
              </div>
            </ResizablePanel>
            
            <ResizableHandle />
            
            <ResizablePanel defaultSize={60} minSize={40}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70} minSize={50}>
                  <div className="h-full bg-white rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex space-x-2">
                        <Button onClick={handleReset} variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reset
                        </Button>
                        <Button onClick={handleSave} variant="outline" size="sm">
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button onClick={handleRunCode} disabled={isRunning} size="sm">
                          <Play className="w-4 h-4 mr-1" />
                          {isRunning ? 'Running...' : 'Run'}
                        </Button>
                        <Button onClick={handleSubmit} disabled={hasSubmitted}>
                          Submit
                        </Button>
                      </div>
                    </div>
                    
                    <div className="h-[calc(100%-60px)]">
                      <Editor
                        height="100%"
                        language={language}
                        theme="vs-light"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                      />
                    </div>
                  </div>
                </ResizablePanel>
                
                <ResizableHandle />
                
                <ResizablePanel defaultSize={30} minSize={20}>
                  <div className="h-full bg-white rounded-lg p-4">
                    <TestResults results={testResults} />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
