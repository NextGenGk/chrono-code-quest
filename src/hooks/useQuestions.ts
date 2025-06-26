
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/integrations/supabase/client';
import { Problem, Example } from '@/types/Problem';
import { toast } from '@/hooks/use-toast';

export const useQuestions = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();

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

      // Transform Supabase data to Problem format with proper type conversion
      return data.map(q => ({
        id: q.id,
        title: q.title,
        difficulty: q.difficulty as 'Easy' | 'Medium' | 'Hard',
        timeLimit: q.time_limit,
        memoryLimit: q.memory_limit,
        description: q.description,
        examples: Array.isArray(q.examples) ? (q.examples as Example[]) : [],
        constraints: q.constraints || []
      })) as Problem[];
    }
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (question: Omit<Problem, 'id'>) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // First, ensure the user profile exists in Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking user profile:', profileError);
        throw profileError;
      }

      if (!profile) {
        // Create the profile if it doesn't exist
        const { error: insertProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.emailAddresses?.[0]?.emailAddress || '',
            full_name: user.fullName || user.firstName || '',
            role: 'admin' // Set as admin since they're adding questions
          });

        if (insertProfileError) {
          console.error('Error creating user profile:', insertProfileError);
          throw insertProfileError;
        }
      }

      const { data, error } = await supabase
        .from('questions')
        .insert({
          title: question.title,
          difficulty: question.difficulty,
          time_limit: question.timeLimit,
          memory_limit: question.memoryLimit,
          description: question.description,
          examples: question.examples as any, // Cast to Json type for Supabase
          constraints: question.constraints,
          created_by: user.id
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
