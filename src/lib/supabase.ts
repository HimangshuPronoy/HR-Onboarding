import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { NewHire, Task, TaskCompletion, TaskWithCompletion } from '@/types';

// Auth functions
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast.error(error.message || 'Error signing in');
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    toast.error(error.message || 'Error signing out');
    throw error;
  }
};

// New hire functions
export const addNewHire = async (name: string, email: string) => {
  try {
    // Generate a unique token and verification code
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create a corresponding auth user account via edge function
    console.log('Creating auth account for new hire:', { name, email });
    
    const { data: authData, error: authError } = await supabase.functions.invoke('create-hr-user', {
      body: { 
        email: email.toLowerCase().trim(), 
        name, 
      },
    });
    
    if (authError) {
      console.error('Error creating auth account:', authError);
      // We will continue adding the new hire even if auth creation fails
      // This allows for manual fixing later if needed
      toast.error('Warning: Failed to create login account for new hire, but will continue with onboarding process');
    } else {
      console.log('Auth account created successfully:', authData);
    }
    
    const generatedPassword = authData?.password || null;
    
    // Add to new_hires table
    const { data, error } = await supabase
      .from('new_hires')
      .insert([{ 
        name, 
        email: email.toLowerCase().trim(), 
        unique_token: token,
        verification_code: verificationCode,
        verification_status: 'pending'
      }])
      .select();
    
    if (error) throw error;
    
    // Here you would send an email with the token in a production app
    // For this demo, we'll just log it
    console.log(`Email would be sent to ${email} with verification code: ${verificationCode}`);
    console.log(`Token generated: ${token}`);
    
    if (generatedPassword) {
      console.log(`Generated password: ${generatedPassword}`);
    }
    
    // Add the generated password to the response if available
    const result = {
      ...data[0],
      generatedPassword
    };
    
    return result;
  } catch (error: any) {
    toast.error(error.message || 'Error adding new hire');
    throw error;
  }
};

export const getNewHires = async () => {
  try {
    const { data, error } = await supabase
      .from('new_hires')
      .select('*');
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast.error(error.message || 'Error fetching new hires');
    throw error;
  }
};

export const getNewHireByToken = async (token: string) => {
  try {
    if (!token || token.trim() === '') {
      console.error('Invalid token provided:', token);
      return null;
    }
    
    console.log('Fetching new hire with token:', token);
    
    // Verify supabase connection before query
    const { data: testData, error: testError } = await supabase.from('new_hires').select('count(*)');
    
    if (testError) {
      console.error('Supabase connection test error:', testError);
      throw new Error('Database connection error');
    }
    
    console.log('Supabase connection successful');
    
    // Add detailed logging to debug the query
    const { data, error, status, statusText, count } = await supabase
      .from('new_hires')
      .select('*')
      .eq('unique_token', token)
      .single();
    
    console.log('Query response:', { data, error, status, statusText, count });
    
    if (error) {
      console.error('Error fetching new hire:', error);
      if (error.code === 'PGRST116') {
        console.error('No new hire found with token:', token);
        return null;
      }
      throw error;
    }
    
    if (!data) {
      console.error('No data returned for token:', token);
      return null;
    }
    
    console.log('New hire data found:', data);
    return data;
  } catch (error: any) {
    console.error('getNewHireByToken error:', error);
    // Don't show a toast here as the error will be handled in the component
    throw new Error(error.message || 'Error fetching new hire');
  }
};

// New verification code functions
export const getNewHireByVerificationCode = async (code: string, email: string) => {
  try {
    if (!code || code.trim() === '' || !email || email.trim() === '') {
      console.error('Invalid code or email provided:', { code, email });
      return null;
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.trim();
    
    console.log('Fetching new hire with verification code:', normalizedCode, 'and email:', normalizedEmail);
    
    // Direct query approach without additional testing
    const { data, error } = await supabase
      .from('new_hires')
      .select('*')
      .eq('verification_code', normalizedCode)
      .eq('email', normalizedEmail)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching new hire:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('getNewHireByVerificationCode error:', error);
    throw error;
  }
};

export const updateNewHireVerificationStatus = async (id: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('new_hires')
      .update({ verification_status: status })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error: any) {
    toast.error(error.message || 'Error updating verification status');
    throw error;
  }
};

// Task functions
export const getTasks = async () => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast.error(error.message || 'Error fetching tasks');
    throw error;
  }
};

export const getTaskCompletions = async (newHireId: string) => {
  try {
    const { data, error } = await supabase
      .from('task_completions')
      .select('*')
      .eq('new_hire_id', newHireId);
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast.error(error.message || 'Error fetching task completions');
    throw error;
  }
};

export const updateTaskCompletion = async (
  newHireId: string,
  taskId: string,
  completed: boolean
) => {
  try {
    const now = new Date().toISOString();
    // Check if the record exists
    const { data: existingData } = await supabase
      .from('task_completions')
      .select('*')
      .eq('new_hire_id', newHireId)
      .eq('task_id', taskId);
    
    if (existingData && existingData.length > 0) {
      // Update existing record
      const { data, error } = await supabase
        .from('task_completions')
        .update({ 
          completed,
          completed_at: completed ? now : null
        })
        .eq('new_hire_id', newHireId)
        .eq('task_id', taskId)
        .select();
      
      if (error) throw error;
      
      return data;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('task_completions')
        .insert([{ 
          new_hire_id: newHireId, 
          task_id: taskId, 
          completed,
          completed_at: completed ? now : null
        }])
        .select();
      
      if (error) throw error;
      
      return data;
    }
  } catch (error: any) {
    toast.error(error.message || 'Error updating task completion');
    throw error;
  }
};

