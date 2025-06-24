
export const codeTemplates = {
  python: `def two_sum(nums, target):
    """
    Find two numbers in the array that add up to target.
    Return their indices.
    """
    # Your code here
    pass

# Test your function
if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    result = two_sum(nums, target)
    print(f"Result: {result}")`,
  
  java: `import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        /*
         * Find two numbers in the array that add up to target.
         * Return their indices.
         */
        // Your code here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = solution.twoSum(nums, target);
        System.out.println("Result: " + Arrays.toString(result));
    }
}`,
  
  cpp: `#include <vector>
#include <iostream>
#include <unordered_map>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        /*
         * Find two numbers in the array that add up to target.
         * Return their indices.
         */
        // Your code here
        return {};
    }
};

int main() {
    Solution solution;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = solution.twoSum(nums, target);
    
    cout << "Result: [";
    for (int i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ", ";
    }
    cout << "]" << endl;
    
    return 0;
}`,
  
  javascript: `/**
 * Find two numbers in the array that add up to target.
 * Return their indices.
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your code here
    return [];
}

// Test your function
const nums = [2, 7, 11, 15];
const target = 9;
const result = twoSum(nums, target);
console.log("Result:", result);`
};

export const sampleProblem = {
  title: "Two Sum",
  difficulty: "Easy" as const,
  timeLimit: "1 second",
  memoryLimit: "256 MB",
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
    },
    {
      input: "nums = [3,3], target = 6",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 6, we return [0, 1]."
    }
  ],
  constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "-10⁹ ≤ nums[i] ≤ 10⁹",
    "-10⁹ ≤ target ≤ 10⁹",
    "Only one valid answer exists."
  ]
};
