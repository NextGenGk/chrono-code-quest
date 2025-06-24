
import { supabase } from '@/integrations/supabase/client';

// AI-powered code execution using Gemini API
export const executeCode = async (code: string, language: string): Promise<any> => {
  console.log('Executing code with AI analysis:', { language, codeLength: code.length });
  
  try {
    const { data, error } = await supabase.functions.invoke('analyze-code', {
      body: {
        code: code,
        language: language,
        problemDescription: 'Two Sum problem'
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message);
    }

    console.log('AI analysis result:', data);
    return data;

  } catch (error) {
    console.error('Code execution error:', error);
    
    // Fallback response if AI analysis fails
    return {
      status: 'error',
      executionTime: '0ms',
      memoryUsed: '0MB',
      testCasesPassed: '0/10',
      failedTestCases: [{
        input: "[2,7,11,15], 9",
        expected: "[0,1]",
        actual: "Error"
      }],
      errorMessage: 'Failed to analyze code. Please check your implementation and try again.',
      suggestions: 'Make sure your code is syntactically correct and implements the Two Sum algorithm.',
      timeComplexity: 'Unknown',
      spaceComplexity: 'Unknown',
      correctness: 0
    };
  }
};
