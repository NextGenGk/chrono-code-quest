
// Simulated code execution API
export const executeCode = async (code: string, language: string): Promise<any> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Executing code:', { language, codeLength: code.length });
  
  // Generate test cases for Two Sum problem
  const testCases = [
    { input: "[2,7,11,15], 9", expected: "[0,1]" },
    { input: "[3,2,4], 6", expected: "[1,2]" },
    { input: "[3,3], 6", expected: "[0,1]" },
    { input: "[1,2,3,4,5], 9", expected: "[3,4]" },
    { input: "[0,4,3,0], 0", expected: "[0,3]" },
    { input: "[-1,-2,-3,-4,-5], -8", expected: "[2,4]" },
    { input: "[1,5,3,7,9,2], 8", expected: "[0,4]" },
    { input: "[10,20,30,40], 50", expected: "[1,2]" },
    { input: "[1,1,1,1], 2", expected: "[0,1]" },
    { input: "[100,200,300], 400", expected: "[0,2]" }
  ];
  
  // Simple code analysis
  const hasHashMap = code.includes('HashMap') || code.includes('dict') || code.includes('{}') || code.includes('Map');
  const hasNestedLoop = (code.match(/for/g) || []).length >= 2;
  const hasOptimalApproach = hasHashMap && !hasNestedLoop;
  
  // Simulate different outcomes based on code quality
  if (code.trim().length < 50) {
    return {
      status: 'error',
      executionTime: '0ms',
      memoryUsed: '0MB',
      testCasesPassed: '0/10',
      failedTestCases: [testCases[0]],
      errorMessage: 'Code appears to be incomplete or empty. Please implement the solution.',
      suggestions: 'Try implementing a hash map approach for O(n) time complexity.'
    };
  }
  
  if (!hasOptimalApproach && hasNestedLoop) {
    // Brute force approach - partial success
    const passedTests = Math.floor(Math.random() * 5) + 3; // 3-7 tests pass
    return {
      status: 'error',
      executionTime: '1247ms',
      memoryUsed: '14.2MB',
      testCasesPassed: `${passedTests}/10`,
      failedTestCases: testCases.slice(passedTests, passedTests + 2),
      errorMessage: 'Time Limit Exceeded on large test cases',
      suggestions: 'Your solution has O(n²) time complexity. Consider using a hash map to achieve O(n) time complexity.'
    };
  }
  
  if (hasOptimalApproach) {
    // Optimal approach - high success rate
    const passedTests = Math.floor(Math.random() * 3) + 8; // 8-10 tests pass
    if (passedTests === 10) {
      return {
        status: 'success',
        executionTime: '42ms',
        memoryUsed: '8.7MB',
        testCasesPassed: '10/10',
        failedTestCases: [],
        errorMessage: '',
        suggestions: 'Excellent! Your solution is optimal with O(n) time and O(n) space complexity.'
      };
    } else {
      return {
        status: 'error',
        executionTime: '38ms',
        memoryUsed: '8.9MB',
        testCasesPassed: `${passedTests}/10`,
        failedTestCases: testCases.slice(passedTests, passedTests + 1),
        errorMessage: 'Wrong Answer on edge cases',
        suggestions: 'Check your edge case handling. Make sure to handle duplicate values correctly.'
      };
    }
  }
  
  // Default case
  const passedTests = Math.floor(Math.random() * 6) + 2; // 2-7 tests pass
  return {
    status: 'error',
    executionTime: '156ms',
    memoryUsed: '12.1MB',
    testCasesPassed: `${passedTests}/10`,
    failedTestCases: testCases.slice(passedTests, passedTests + 2),
    errorMessage: 'Logic error in implementation',
    suggestions: 'Review your algorithm logic. Consider using a hash map to store seen values and their indices.'
  };
};
