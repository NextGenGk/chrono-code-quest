
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Problem, Example } from '@/types/Problem';

interface ClerkAdminQuestionFormProps {
  onQuestionAdded: (question: Problem) => void;
  onClose: () => void;
}

const ClerkAdminQuestionForm: React.FC<ClerkAdminQuestionFormProps> = ({ onQuestionAdded, onClose }) => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [timeLimit, setTimeLimit] = useState('30 minutes');
  const [memoryLimit, setMemoryLimit] = useState('256 MB');
  const [description, setDescription] = useState('');
  const [examples, setExamples] = useState<Example[]>([
    { input: '', output: '', explanation: '' }
  ]);
  const [constraints, setConstraints] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addExample = () => {
    setExamples([...examples, { input: '', output: '', explanation: '' }]);
  };

  const updateExample = (index: number, field: keyof Example, value: string) => {
    const updatedExamples = examples.map((example, i) =>
      i === index ? { ...example, [field]: value } : example
    );
    setExamples(updatedExamples);
  };

  const removeExample = (index: number) => {
    if (examples.length > 1) {
      setExamples(examples.filter((_, i) => i !== index));
    }
  };

  const addConstraint = () => {
    setConstraints([...constraints, '']);
  };

  const updateConstraint = (index: number, value: string) => {
    const updatedConstraints = constraints.map((constraint, i) =>
      i === index ? value : constraint
    );
    setConstraints(updatedConstraints);
  };

  const removeConstraint = (index: number) => {
    if (constraints.length > 1) {
      setConstraints(constraints.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty examples and constraints
      const validExamples = examples.filter(ex => ex.input.trim() && ex.output.trim());
      const validConstraints = constraints.filter(c => c.trim());

      if (!title.trim() || !description.trim()) {
        throw new Error('Title and description are required');
      }

      if (validExamples.length === 0) {
        throw new Error('At least one valid example is required');
      }

      const newQuestion: Problem = {
        id: Date.now().toString(), // Simple ID for demo purposes
        title: title.trim(),
        difficulty,
        timeLimit,
        memoryLimit,
        description: description.trim(),
        examples: validExamples,
        constraints: validConstraints,
      };

      onQuestionAdded(newQuestion);
      
      toast({
        title: "Question Added",
        description: "The question has been successfully added.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add question",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter question title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit</Label>
              <Input
                id="timeLimit"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="e.g., 30 minutes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memoryLimit">Memory Limit</Label>
              <Input
                id="memoryLimit"
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(e.target.value)}
                placeholder="e.g., 256 MB"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter detailed problem description"
              rows={6}
              required
            />
          </div>

          {/* Examples */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Examples</Label>
              <Button type="button" onClick={addExample} variant="outline" size="sm">
                Add Example
              </Button>
            </div>
            {examples.map((example, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Example {index + 1}</span>
                  {examples.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeExample(index)}
                      variant="destructive"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Input</Label>
                    <Textarea
                      value={example.input}
                      onChange={(e) => updateExample(index, 'input', e.target.value)}
                      placeholder="Input example"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Output</Label>
                    <Textarea
                      value={example.output}
                      onChange={(e) => updateExample(index, 'output', e.target.value)}
                      placeholder="Expected output"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Explanation (Optional)</Label>
                  <Textarea
                    value={example.explanation}
                    onChange={(e) => updateExample(index, 'explanation', e.target.value)}
                    placeholder="Explanation of the example"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Constraints */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Constraints</Label>
              <Button type="button" onClick={addConstraint} variant="outline" size="sm">
                Add Constraint
              </Button>
            </div>
            {constraints.map((constraint, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={constraint}
                  onChange={(e) => updateConstraint(index, e.target.value)}
                  placeholder="Enter constraint"
                />
                {constraints.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeConstraint(index)}
                    variant="destructive"
                    size="sm"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Question'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClerkAdminQuestionForm;
