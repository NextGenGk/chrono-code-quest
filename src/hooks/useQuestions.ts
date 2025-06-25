
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Problem } from '@/types/Problem';
import { toast } from '@/hooks/use-toast';

export const useQuestions = () => {
  const queryClient = useQueryClient();

  const questionsQuery = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }

      // Transform Supabase data to Problem format
      return data.map(q => ({
        id: q.id,
        title: q.title,
        difficulty: q.difficulty as 'Easy' | 'Medium' | 'Hard',
        timeLimit: q.time_limit,
        memoryLimit: q.memory_limit,
        description: q.description,
        examples: Array.isArray(q.examples) ? q.examples : [],
        constraints: q.constraints || []
      })) as Problem[];
    }
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (question: Omit<Problem, 'id'>) => {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          title: question.title,
          difficulty: question.difficulty,
          time_limit: question.timeLimit,
          memory_limit: question.memoryLimit,
          description: question.description,
          examples: question.examples,
          constraints: question.constraints,
          created_by: '00000000-0000-0000-0000-000000000000' // Placeholder for now
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding question:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({
        title: "Success!",
        description: "Question has been added to the database.",
      });
    },
    onError: (error: any) => {
      console.error('Failed to add question:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add question to database.",
        variant: "destructive",
      });
    }
  });

  return {
    questions: questionsQuery.data || [],
    isLoading: questionsQuery.isLoading,
    isError: questionsQuery.isError,
    addQuestion: addQuestionMutation.mutate,
    isAddingQuestion: addQuestionMutation.isPending
  };
};
